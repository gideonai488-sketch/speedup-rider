-- Tighten permissive INSERT RLS policies flagged by linter

-- ambassador_signups: only allow creating a signup for the currently authenticated user
DROP POLICY IF EXISTS "Authenticated can insert signups" ON public.ambassador_signups;
CREATE POLICY "Authenticated can insert signups"
ON public.ambassador_signups
FOR INSERT
TO authenticated
WITH CHECK (
  signed_up_user_id = public.get_profile_id(auth.uid())
  AND ambassador_id IS NOT NULL
  AND referral_code IS NOT NULL
  AND length(trim(referral_code)) > 0
  AND status = 'active'
);

-- ambassador_applications: prevent empty/garbage inserts while keeping it open to anon/auth
DROP POLICY IF EXISTS "Anyone can submit ambassador applications" ON public.ambassador_applications;
CREATE POLICY "Anyone can submit ambassador applications"
ON public.ambassador_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL AND length(trim(email)) > 3
  AND full_name IS NOT NULL AND length(trim(full_name)) > 1
  AND phone IS NOT NULL AND length(trim(phone)) > 5
  AND university_name IS NOT NULL AND length(trim(university_name)) > 1
  AND university_city IS NOT NULL AND length(trim(university_city)) > 1
  AND why_ambassador IS NOT NULL AND length(trim(why_ambassador)) > 5
);

-- partner_applications: prevent empty/garbage inserts while keeping it open to anon/auth
DROP POLICY IF EXISTS "Anyone can submit partner applications" ON public.partner_applications;
CREATE POLICY "Anyone can submit partner applications"
ON public.partner_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (
  business_name IS NOT NULL AND length(trim(business_name)) > 1
  AND contact_name IS NOT NULL AND length(trim(contact_name)) > 1
  AND phone IS NOT NULL AND length(trim(phone)) > 5
  AND city IS NOT NULL AND length(trim(city)) > 1
  AND business_address IS NOT NULL AND length(trim(business_address)) > 3
);
