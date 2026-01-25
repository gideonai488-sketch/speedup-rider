-- Drop existing SELECT policy for orders
DROP POLICY IF EXISTS "Customers can view their orders" ON public.orders;

-- Create new SELECT policy that allows:
-- 1. Customers to see their own orders
-- 2. Riders to see orders assigned to them
-- 3. Approved riders to see pending unassigned orders (for accepting new deliveries)
-- 4. Admins to see all orders
CREATE POLICY "Users can view relevant orders" 
ON public.orders 
FOR SELECT 
USING (
  (customer_id = get_profile_id(auth.uid()))
  OR (rider_id = get_profile_id(auth.uid()))
  OR is_admin(auth.uid())
  OR (
    -- Approved riders can see unassigned pending orders
    rider_id IS NULL 
    AND status IN ('pending', 'confirmed', 'ready_for_pickup')
    AND is_rider(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.rider_status = 'approved'
    )
  )
);