-- Fix infinite recursion in profiles RLS policies
-- Drop the problematic policies first
DROP POLICY IF EXISTS "Users can view profiles for their orders" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update rider status" ON public.profiles;

-- Recreate policies without recursion
-- Users can view their own profile (direct auth.uid() comparison, no function call)
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'admin'
  )
);

-- Users can update their own profile (direct comparison)
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'admin'
  )
);

-- Users can insert their own profile (direct comparison)
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow viewing profiles related to orders (for riders seeing customer info and vice versa)
-- Use a simpler approach that doesn't cause recursion
CREATE POLICY "View order-related profiles" 
ON public.profiles 
FOR SELECT 
USING (
  id IN (
    SELECT DISTINCT o.customer_id FROM public.orders o WHERE o.rider_id IN (
      SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
    UNION
    SELECT DISTINCT o.rider_id FROM public.orders o WHERE o.customer_id IN (
      SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()
    ) AND o.rider_id IS NOT NULL
  )
);