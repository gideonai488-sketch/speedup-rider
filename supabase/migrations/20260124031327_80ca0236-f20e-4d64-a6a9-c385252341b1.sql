-- Add bank details columns to profiles for Paystack transfers
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bank_name text,
ADD COLUMN IF NOT EXISTS bank_code text,
ADD COLUMN IF NOT EXISTS account_number text,
ADD COLUMN IF NOT EXISTS account_name text;

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  is_read boolean DEFAULT false,
  data jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (user_id = get_profile_id(auth.uid()));

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (user_id = get_profile_id(auth.uid()));

-- System can create notifications (via service role or triggers)
CREATE POLICY "System can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (user_id = get_profile_id(auth.uid()) OR is_admin(auth.uid()));

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create ratings table for rider and order ratings
CREATE TABLE IF NOT EXISTS public.ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.profiles(id),
  rider_id uuid REFERENCES public.profiles(id),
  store_id uuid REFERENCES public.stores(id),
  rider_rating integer CHECK (rider_rating >= 1 AND rider_rating <= 5),
  store_rating integer CHECK (store_rating >= 1 AND store_rating <= 5),
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(order_id)
);

-- Enable RLS on ratings
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Customers can create ratings for their orders
CREATE POLICY "Customers can create ratings"
ON public.ratings
FOR INSERT
WITH CHECK (customer_id = get_profile_id(auth.uid()));

-- Anyone can view ratings
CREATE POLICY "Anyone can view ratings"
ON public.ratings
FOR SELECT
USING (true);

-- Create withdrawal_requests table for rider bank withdrawals
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rider_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  bank_name text NOT NULL,
  bank_code text NOT NULL,
  account_number text NOT NULL,
  account_name text NOT NULL,
  paystack_transfer_code text,
  paystack_reference text,
  failure_reason text,
  processed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on withdrawal_requests
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Riders can view their own withdrawal requests
CREATE POLICY "Riders can view their own withdrawals"
ON public.withdrawal_requests
FOR SELECT
USING (rider_id = get_profile_id(auth.uid()) OR is_admin(auth.uid()));

-- Riders can create withdrawal requests
CREATE POLICY "Riders can create withdrawal requests"
ON public.withdrawal_requests
FOR INSERT
WITH CHECK (rider_id = get_profile_id(auth.uid()));

-- Only admins can update withdrawal requests
CREATE POLICY "Admins can update withdrawal requests"
ON public.withdrawal_requests
FOR UPDATE
USING (is_admin(auth.uid()));

-- Create app_settings table for admin configuration
CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES public.profiles(id)
);

-- Enable RLS on app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can view settings"
ON public.app_settings
FOR SELECT
USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can manage settings"
ON public.app_settings
FOR ALL
USING (is_admin(auth.uid()));

-- Insert default settings
INSERT INTO public.app_settings (key, value) VALUES
  ('delivery', '{"base_fee": 5, "per_km_fee": 2, "service_fee": 2, "surge_enabled": true, "max_surge": 2.5}'),
  ('platform', '{"rider_platform_fee": 5, "min_order_amount": 20, "max_delivery_radius_km": 25}'),
  ('notifications', '{"push_enabled": true, "email_enabled": true, "sms_enabled": false}'),
  ('payments', '{"wallet_enabled": true, "momo_enabled": true, "card_enabled": true, "cash_enabled": true}')
ON CONFLICT (key) DO NOTHING;