-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "View order-related profiles" ON public.profiles;

-- Create a security definer function to check admin status without triggering RLS
CREATE OR REPLACE FUNCTION public.is_admin_no_rls(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = check_user_id AND role = 'admin'
  );
$$;

-- Recreate admin view policy using the security definer function
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (is_admin_no_rls(auth.uid()));

-- Recreate admin update policy using the security definer function  
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (is_admin_no_rls(auth.uid()));

-- Recreate order-related profiles view policy (simplified to avoid recursion)
CREATE POLICY "View order-related profiles"
ON public.profiles
FOR SELECT
USING (
  id IN (
    SELECT DISTINCT o.customer_id
    FROM orders o
    WHERE o.rider_id = (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid() LIMIT 1)
    UNION
    SELECT DISTINCT o.rider_id
    FROM orders o
    WHERE o.customer_id = (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid() LIMIT 1)
    AND o.rider_id IS NOT NULL
  )
);