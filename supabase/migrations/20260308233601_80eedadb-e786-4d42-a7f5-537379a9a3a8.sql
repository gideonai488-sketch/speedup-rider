
-- Update handle_new_user to also save country_code from the city metadata field
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_profile_id UUID;
  user_role user_role := 'customer';
  user_name TEXT;
  user_city TEXT;
  user_vehicle_type TEXT;
  user_university TEXT;
  user_country_code TEXT;
BEGIN
  IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    user_role := (NEW.raw_user_meta_data->>'role')::user_role;
  END IF;
  
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  user_city := NEW.raw_user_meta_data->>'city';
  user_vehicle_type := NEW.raw_user_meta_data->>'vehicle_type';
  
  -- For ambassadors: city = country_code, vehicle_type = university
  IF user_role = 'ambassador' THEN
    user_country_code := user_city; -- country code passed as city
    user_university := user_vehicle_type;
  ELSE
    user_country_code := COALESCE(user_city, 'GH'); -- default GH for non-ambassadors
  END IF;
  
  INSERT INTO public.profiles (user_id, role, full_name, phone, city, vehicle_type, rider_status, university, country_code)
  VALUES (
    NEW.id, 
    user_role, 
    user_name, 
    NEW.raw_user_meta_data->>'phone',
    CASE WHEN user_role = 'ambassador' THEN NULL ELSE user_city END,
    CASE WHEN user_role = 'ambassador' THEN NULL ELSE user_vehicle_type END,
    CASE WHEN user_role = 'rider' THEN 'approved' ELSE 'pending' END,
    CASE WHEN user_role = 'ambassador' THEN user_university ELSE NULL END,
    user_country_code
  )
  RETURNING id INTO new_profile_id;
  
  INSERT INTO public.wallets (user_id, balance)
  VALUES (new_profile_id, 0);
  
  INSERT INTO public.referrals (referrer_id, referral_code)
  VALUES (new_profile_id, UPPER(SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 8)));
  
  -- Auto-create ambassador stats if ambassador role
  IF user_role = 'ambassador' THEN
    INSERT INTO public.ambassador_stats (ambassador_id)
    VALUES (new_profile_id);
  END IF;
  
  RETURN NEW;
END;
$$;
