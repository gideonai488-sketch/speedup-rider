
-- Add 'ambassador' to user_role enum
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'ambassador';

-- Add university field to profiles for ambassadors
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS university TEXT;

-- Create ambassador_stats table for tracking performance
CREATE TABLE public.ambassador_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_signups INTEGER NOT NULL DEFAULT 0,
  total_orders_generated INTEGER NOT NULL DEFAULT 0,
  total_earnings NUMERIC NOT NULL DEFAULT 0,
  current_month_signups INTEGER NOT NULL DEFAULT 0,
  current_month_earnings NUMERIC NOT NULL DEFAULT 0,
  rank INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(ambassador_id)
);

ALTER TABLE public.ambassador_stats ENABLE ROW LEVEL SECURITY;

-- Ambassadors can view their own stats
CREATE POLICY "Ambassadors can view own stats"
  ON public.ambassador_stats
  FOR SELECT
  TO authenticated
  USING (ambassador_id = get_profile_id(auth.uid()) OR is_admin(auth.uid()));

-- System can insert/update stats
CREATE POLICY "System can manage ambassador stats"
  ON public.ambassador_stats
  FOR ALL
  TO authenticated
  USING (ambassador_id = get_profile_id(auth.uid()) OR is_admin(auth.uid()))
  WITH CHECK (ambassador_id = get_profile_id(auth.uid()) OR is_admin(auth.uid()));

-- Create ambassador_signups table to track who signed up through which ambassador
CREATE TABLE public.ambassador_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL REFERENCES public.profiles(id),
  signed_up_user_id UUID NOT NULL REFERENCES public.profiles(id),
  referral_code TEXT NOT NULL,
  bonus_earned NUMERIC DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ambassador_signups ENABLE ROW LEVEL SECURITY;

-- Ambassadors can view their signups
CREATE POLICY "Ambassadors can view their signups"
  ON public.ambassador_signups
  FOR SELECT
  TO authenticated
  USING (ambassador_id = get_profile_id(auth.uid()) OR is_admin(auth.uid()));

-- System can insert signups
CREATE POLICY "Authenticated can insert signups"
  ON public.ambassador_signups
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Enable realtime for ambassador stats
ALTER PUBLICATION supabase_realtime ADD TABLE public.ambassador_stats;
