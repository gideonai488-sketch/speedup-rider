
-- Create ambassador_earning_rates table for per-country config
CREATE TABLE public.ambassador_earning_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL UNIQUE,
  currency_symbol TEXT NOT NULL,
  first_order_bonus NUMERIC NOT NULL DEFAULT 2,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ambassador_earning_rates ENABLE ROW LEVEL SECURITY;

-- Anyone can read rates, only admins manage
CREATE POLICY "Anyone can view earning rates"
  ON public.ambassador_earning_rates FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage earning rates"
  ON public.ambassador_earning_rates FOR ALL
  USING (is_admin(auth.uid()));

-- Insert per-country rates
INSERT INTO public.ambassador_earning_rates (country_code, currency_symbol, first_order_bonus, description) VALUES
  ('GH', 'GH₵', 2, 'Ghana - 2 cedis per first order'),
  ('US', '$', 1, 'USA - 1 dollar per first order'),
  ('FI', '€', 1, 'Finland - 1 euro per first order'),
  ('ET', 'ETB', 50, 'Ethiopia - 50 birr per first order'),
  ('JM', 'J$', 150, 'Jamaica - 150 JMD per first order'),
  ('PH', '₱', 50, 'Philippines - 50 pesos per first order');

-- Add country_code to profiles so we know which country the user is in
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'GH';

-- Track if a user's first order bonus has been paid to their ambassador
ALTER TABLE public.ambassador_signups ADD COLUMN IF NOT EXISTS first_order_paid BOOLEAN DEFAULT false;
ALTER TABLE public.ambassador_signups ADD COLUMN IF NOT EXISTS first_order_id UUID REFERENCES public.orders(id);
ALTER TABLE public.ambassador_signups ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Create the trigger function that credits ambassadors on first order payment
CREATE OR REPLACE FUNCTION public.credit_ambassador_on_first_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_signup RECORD;
  v_ambassador_wallet_id UUID;
  v_earning_rate NUMERIC;
  v_country TEXT;
  v_currency TEXT;
  v_first_paid_order_count INTEGER;
BEGIN
  -- Only trigger when payment_status changes to 'paid'
  IF NEW.payment_status = 'paid' AND (OLD.payment_status IS DISTINCT FROM 'paid') THEN
    
    -- Check if this customer was referred by an ambassador
    SELECT as2.* INTO v_signup
    FROM public.ambassador_signups as2
    WHERE as2.signed_up_user_id = NEW.customer_id
      AND as2.first_order_paid = false
    LIMIT 1;
    
    -- No ambassador referral found, exit
    IF v_signup IS NULL THEN
      RETURN NEW;
    END IF;
    
    -- Check this is truly the customer's first PAID order
    SELECT COUNT(*) INTO v_first_paid_order_count
    FROM public.orders
    WHERE customer_id = NEW.customer_id
      AND payment_status = 'paid'
      AND id != NEW.id;
    
    IF v_first_paid_order_count > 0 THEN
      -- Not their first order, mark as done so we don't check again
      UPDATE public.ambassador_signups
      SET first_order_paid = true
      WHERE id = v_signup.id;
      RETURN NEW;
    END IF;
    
    -- Get the customer's country
    SELECT COALESCE(p.country_code, 'GH') INTO v_country
    FROM public.profiles p
    WHERE p.id = NEW.customer_id;
    
    -- Get the earning rate for this country
    SELECT first_order_bonus, currency_symbol INTO v_earning_rate, v_currency
    FROM public.ambassador_earning_rates
    WHERE country_code = v_country AND is_active = true;
    
    -- Default to 2 if no rate found
    IF v_earning_rate IS NULL THEN
      v_earning_rate := 2;
      v_currency := 'GH₵';
    END IF;
    
    -- Get ambassador's wallet
    SELECT w.id INTO v_ambassador_wallet_id
    FROM public.wallets w
    WHERE w.user_id = v_signup.ambassador_id;
    
    IF v_ambassador_wallet_id IS NULL THEN
      RETURN NEW;
    END IF;
    
    -- Credit ambassador's wallet
    UPDATE public.wallets
    SET balance = balance + v_earning_rate,
        updated_at = now()
    WHERE id = v_ambassador_wallet_id;
    
    -- Record the transaction
    INSERT INTO public.transactions (wallet_id, type, amount, description, order_id)
    VALUES (
      v_ambassador_wallet_id,
      'referral_bonus',
      v_earning_rate,
      'Ambassador bonus: ' || v_currency || v_earning_rate || ' from referred user first order',
      NEW.id
    );
    
    -- Update ambassador_signups
    UPDATE public.ambassador_signups
    SET first_order_paid = true,
        first_order_id = NEW.id,
        bonus_earned = v_earning_rate,
        paid_at = now()
    WHERE id = v_signup.id;
    
    -- Update ambassador_stats
    UPDATE public.ambassador_stats
    SET total_earnings = total_earnings + v_earning_rate,
        current_month_earnings = current_month_earnings + v_earning_rate,
        total_orders_generated = total_orders_generated + 1,
        updated_at = now()
    WHERE ambassador_id = v_signup.ambassador_id;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger on orders table
DROP TRIGGER IF EXISTS trg_credit_ambassador_first_order ON public.orders;
CREATE TRIGGER trg_credit_ambassador_first_order
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.credit_ambassador_on_first_order();
