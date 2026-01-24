-- Add subaccount_code field to store Paystack subaccount reference
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subaccount_code text;