-- Fix remaining recursion: remove the order-related policy that indirectly causes recursion loops
DROP POLICY IF EXISTS "View order-related profiles" ON public.profiles;

-- Ensure admin check used in profiles policies never triggers RLS
CREATE OR REPLACE FUNCTION public.is_admin_no_rls(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = check_user_id AND role = 'admin'
  );
$$;

-- Recreate admin policies using the safe function (drop+create to ensure they use the latest function)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_admin_no_rls(auth.uid()));

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (public.is_admin_no_rls(auth.uid()));