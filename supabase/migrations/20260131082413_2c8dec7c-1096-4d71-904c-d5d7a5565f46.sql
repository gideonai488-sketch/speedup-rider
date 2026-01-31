-- Add city column to profiles for city-based filtering
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;

-- Create an index for city-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);

-- Update the handle_new_user function to include city and vehicle_type from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_profile_id UUID;
  user_role user_role := 'customer';
  user_name TEXT;
  user_city TEXT;
  user_vehicle_type TEXT;
BEGIN
  -- Get role from metadata if provided
  IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    user_role := (NEW.raw_user_meta_data->>'role')::user_role;
  END IF;
  
  -- Get name from metadata
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  
  -- Get city from metadata
  user_city := NEW.raw_user_meta_data->>'city';
  
  -- Get vehicle type from metadata (for riders)
  user_vehicle_type := NEW.raw_user_meta_data->>'vehicle_type';
  
  -- Create profile with city and vehicle type
  INSERT INTO public.profiles (user_id, role, full_name, phone, city, vehicle_type)
  VALUES (
    NEW.id, 
    user_role, 
    user_name, 
    NEW.raw_user_meta_data->>'phone',
    user_city,
    user_vehicle_type
  )
  RETURNING id INTO new_profile_id;
  
  -- Create wallet
  INSERT INTO public.wallets (user_id, balance)
  VALUES (new_profile_id, 0);
  
  -- Generate referral code
  INSERT INTO public.referrals (referrer_id, referral_code)
  VALUES (new_profile_id, UPPER(SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 8)));
  
  RETURN NEW;
END;
$$;