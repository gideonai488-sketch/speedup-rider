
DROP POLICY "Relevant users can view rider locations" ON public.rider_locations;

CREATE POLICY "Relevant users can view rider locations"
ON public.rider_locations
FOR SELECT
USING (
  (rider_id = get_profile_id(auth.uid()))
  OR is_admin(auth.uid())
  OR (EXISTS (
    SELECT 1 FROM orders
    WHERE orders.rider_id = rider_locations.rider_id
      AND orders.customer_id = get_profile_id(auth.uid())
      AND orders.status NOT IN ('delivered', 'cancelled')
  ))
);
