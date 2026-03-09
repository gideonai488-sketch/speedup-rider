-- Add bi-weekly payout tracking to ambassador signups
ALTER TABLE public.ambassador_signups
  ADD COLUMN IF NOT EXISTS biweekly_last_paid_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS biweekly_next_due_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_ambassador_signups_biweekly_due
  ON public.ambassador_signups (biweekly_next_due_at)
  WHERE status = 'active' AND first_order_paid = true;

-- Enable pg_cron for scheduled payouts
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Runs daily; only pays rows whose next_due_at is reached (so each referral pays every 14 days)
CREATE OR REPLACE FUNCTION public.run_ambassador_biweekly_payouts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  v_cycle_id uuid;
  v_start_date date := (now() at time zone 'utc')::date;
  v_end_date date := ((now() at time zone 'utc') + interval '14 days')::date;
  rec record;
  v_wallet_id uuid;
  v_total_amount numeric := 0;
  v_ambassadors_paid integer := 0;
BEGIN
  INSERT INTO public.ambassador_payout_cycles (cycle_start_date, cycle_end_date, status)
  VALUES (v_start_date, v_end_date, 'processing')
  RETURNING id INTO v_cycle_id;

  FOR rec IN
    WITH eligible AS (
      SELECT
        s.ambassador_id,
        COUNT(*)::int AS referrals_due,
        COALESCE(SUM(COALESCE(o.service_fee, 2)), 0)::numeric AS total_amount,
        ARRAY_AGG(s.id) AS signup_ids
      FROM public.ambassador_signups s
      LEFT JOIN public.orders o ON o.id = s.first_order_id
      WHERE s.status = 'active'
        AND s.first_order_paid = true
        AND s.biweekly_next_due_at IS NOT NULL
        AND s.biweekly_next_due_at <= now()
      GROUP BY s.ambassador_id
      HAVING COALESCE(SUM(COALESCE(o.service_fee, 2)), 0) > 0
    )
    SELECT * FROM eligible
  LOOP
    -- Ensure wallet exists
    SELECT w.id INTO v_wallet_id
    FROM public.wallets w
    WHERE w.user_id = rec.ambassador_id;

    IF v_wallet_id IS NULL THEN
      INSERT INTO public.wallets (user_id, balance)
      VALUES (rec.ambassador_id, 0)
      RETURNING id INTO v_wallet_id;
    END IF;

    -- Credit wallet
    UPDATE public.wallets
    SET balance = COALESCE(balance, 0) + rec.total_amount,
        updated_at = now()
    WHERE id = v_wallet_id;

    -- Record a single transaction per ambassador per run
    INSERT INTO public.transactions (wallet_id, amount, type, description)
    VALUES (
      v_wallet_id,
      rec.total_amount,
      'referral_bonus',
      'Bi-weekly ambassador earnings (' || rec.referrals_due || ' referrals due)'
    );

    -- Update ambassador stats
    UPDATE public.ambassador_stats
    SET total_earnings = total_earnings + rec.total_amount,
        current_month_earnings = current_month_earnings + rec.total_amount,
        updated_at = now()
    WHERE ambassador_id = rec.ambassador_id;

    -- Advance due dates for all paid signups in this batch
    UPDATE public.ambassador_signups
    SET biweekly_last_paid_at = now(),
        biweekly_next_due_at = now() + interval '14 days'
    WHERE id = ANY(rec.signup_ids);

    v_total_amount := v_total_amount + rec.total_amount;
    v_ambassadors_paid := v_ambassadors_paid + 1;
  END LOOP;

  UPDATE public.ambassador_payout_cycles
  SET processed_at = now(),
      status = 'completed',
      total_ambassadors_paid = v_ambassadors_paid,
      total_amount_paid = v_total_amount
  WHERE id = v_cycle_id;
EXCEPTION
  WHEN OTHERS THEN
    IF v_cycle_id IS NOT NULL THEN
      UPDATE public.ambassador_payout_cycles
      SET processed_at = now(),
          status = 'failed'
      WHERE id = v_cycle_id;
    END IF;
    RAISE;
END;
$$;

-- Schedule daily execution (pays only when next_due_at <= now)
SELECT cron.schedule(
  'ambassador_biweekly_payouts_daily',
  '0 9 * * *',
  $$ SELECT public.run_ambassador_biweekly_payouts(); $$
);