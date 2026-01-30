-- Fix security definer view - use security invoker instead
DROP VIEW IF EXISTS public.public_profiles;

-- Recreate view with SECURITY INVOKER (default, but explicit)
CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id,
  full_name,
  avatar_url,
  role,
  created_at,
  CASE WHEN role = 'rider' THEN vehicle_type ELSE NULL END as vehicle_type
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated, anon;