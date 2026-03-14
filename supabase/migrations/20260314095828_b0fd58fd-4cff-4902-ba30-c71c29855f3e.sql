
-- Allow merchants to insert their own stores
CREATE POLICY "Merchants can insert own stores"
ON public.stores
FOR INSERT
TO authenticated
WITH CHECK (owner_id = get_profile_id(auth.uid()));

-- Allow merchants to update their own stores  
CREATE POLICY "Merchants can update own stores"
ON public.stores
FOR UPDATE
TO authenticated
USING (owner_id = get_profile_id(auth.uid()));

-- Allow merchants to manage their own products
CREATE POLICY "Merchants can insert own products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.stores 
  WHERE stores.id = store_id AND stores.owner_id = get_profile_id(auth.uid())
));

CREATE POLICY "Merchants can update own products"
ON public.products
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.stores 
  WHERE stores.id = store_id AND stores.owner_id = get_profile_id(auth.uid())
));

CREATE POLICY "Merchants can delete own products"
ON public.products
FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.stores 
  WHERE stores.id = store_id AND stores.owner_id = get_profile_id(auth.uid())
));
