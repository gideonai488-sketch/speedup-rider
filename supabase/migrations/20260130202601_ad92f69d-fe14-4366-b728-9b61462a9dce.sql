-- =====================================================
-- SECURITY FIX: Restrict profile data access and add role protection
-- =====================================================

-- 1. Drop the overly permissive profile policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- 2. Create restricted profile policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (
    auth.uid() = user_id 
    OR is_admin(auth.uid())
  );

-- 3. Create policy for viewing limited profile data for order-related interactions
CREATE POLICY "Users can view profiles for their orders" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE (orders.customer_id = profiles.id AND orders.rider_id = get_profile_id(auth.uid()))
         OR (orders.rider_id = profiles.id AND orders.customer_id = get_profile_id(auth.uid()))
    )
  );

-- 4. Create a public view for limited profile info (no sensitive data)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  avatar_url,
  role,
  created_at,
  -- Only show rider-specific public info for riders
  CASE WHEN role = 'rider' THEN vehicle_type ELSE NULL END as vehicle_type
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- 5. Create function to prevent role changes after creation
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow role changes by admins
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    IF NOT is_admin(auth.uid()) THEN
      RAISE EXCEPTION 'Role changes are not allowed. Contact support if you need to change your account type.';
    END IF;
  END IF;
  
  -- Prevent changing user_id
  IF OLD.user_id IS DISTINCT FROM NEW.user_id THEN
    RAISE EXCEPTION 'User ID cannot be changed';
  END IF;
  
  RETURN NEW;
END;
$$;

-- 6. Create trigger to enforce role protection
DROP TRIGGER IF EXISTS enforce_role_protection ON public.profiles;
CREATE TRIGGER enforce_role_protection
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_change();

-- 7. Add indexes for performance at scale
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_rider_id ON public.orders(rider_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON public.transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON public.transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_rider_locations_rider_id ON public.rider_locations(rider_id);
CREATE INDEX IF NOT EXISTS idx_rider_locations_is_online ON public.rider_locations(is_online);

-- 8. Create idempotency table to prevent duplicate payment processing
CREATE TABLE IF NOT EXISTS public.payment_idempotency (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_reference text UNIQUE NOT NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  processed_at timestamptz NOT NULL DEFAULT now(),
  result jsonb
);

-- Enable RLS on idempotency table
ALTER TABLE public.payment_idempotency ENABLE ROW LEVEL SECURITY;

-- Only system (service role) can access idempotency table
CREATE POLICY "Service role only" ON public.payment_idempotency
  FOR ALL USING (false);

-- 9. Create function to validate order ownership for payments
CREATE OR REPLACE FUNCTION public.validate_order_payment(
  p_order_id uuid,
  p_user_id uuid
)
RETURNS TABLE (
  is_valid boolean,
  error_message text,
  order_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order record;
  v_profile_id uuid;
BEGIN
  -- Get profile ID for the user
  SELECT id INTO v_profile_id FROM public.profiles WHERE user_id = p_user_id;
  
  IF v_profile_id IS NULL THEN
    RETURN QUERY SELECT false, 'User profile not found'::text, NULL::jsonb;
    RETURN;
  END IF;
  
  -- Get order
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  
  IF v_order IS NULL THEN
    RETURN QUERY SELECT false, 'Order not found'::text, NULL::jsonb;
    RETURN;
  END IF;
  
  -- Verify ownership
  IF v_order.customer_id != v_profile_id THEN
    RETURN QUERY SELECT false, 'Not authorized to pay for this order'::text, NULL::jsonb;
    RETURN;
  END IF;
  
  -- Check if already paid
  IF v_order.payment_status = 'paid' THEN
    RETURN QUERY SELECT false, 'Order already paid'::text, NULL::jsonb;
    RETURN;
  END IF;
  
  -- Return valid with order data
  RETURN QUERY SELECT 
    true, 
    NULL::text, 
    jsonb_build_object(
      'id', v_order.id,
      'customer_id', v_order.customer_id,
      'rider_id', v_order.rider_id,
      'total', v_order.total,
      'delivery_fee', v_order.delivery_fee,
      'payment_status', v_order.payment_status,
      'order_number', v_order.order_number
    );
END;
$$;