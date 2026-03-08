
-- 1. Update handle_new_user to set rider_status = 'approved' by default for riders
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  new_profile_id UUID;
  user_role user_role := 'customer';
  user_name TEXT;
  user_city TEXT;
  user_vehicle_type TEXT;
BEGIN
  IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    user_role := (NEW.raw_user_meta_data->>'role')::user_role;
  END IF;
  
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  user_city := NEW.raw_user_meta_data->>'city';
  user_vehicle_type := NEW.raw_user_meta_data->>'vehicle_type';
  
  INSERT INTO public.profiles (user_id, role, full_name, phone, city, vehicle_type, rider_status)
  VALUES (
    NEW.id, 
    user_role, 
    user_name, 
    NEW.raw_user_meta_data->>'phone',
    user_city,
    user_vehicle_type,
    CASE WHEN user_role = 'rider' THEN 'approved' ELSE 'pending' END
  )
  RETURNING id INTO new_profile_id;
  
  INSERT INTO public.wallets (user_id, balance)
  VALUES (new_profile_id, 0);
  
  INSERT INTO public.referrals (referrer_id, referral_code)
  VALUES (new_profile_id, UPPER(SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 8)));
  
  RETURN NEW;
END;
$function$;

-- 2. Update existing pending riders to approved
UPDATE public.profiles SET rider_status = 'approved' WHERE role = 'rider' AND rider_status = 'pending';
