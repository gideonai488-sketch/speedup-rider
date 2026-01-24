-- Add rider_status field to profiles for rider approval system
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS rider_status text DEFAULT 'pending' CHECK (rider_status IN ('pending', 'approved', 'rejected', 'suspended'));

-- Add vehicle info to profiles for riders
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS vehicle_type text,
ADD COLUMN IF NOT EXISTS vehicle_plate text;

-- Create index for faster rider queries
CREATE INDEX IF NOT EXISTS idx_profiles_rider_status ON public.profiles(rider_status) WHERE role = 'rider';

-- Drop existing policy if it exists before creating new one
DROP POLICY IF EXISTS "Admins can update rider status" ON public.profiles;

-- Update RLS policy to allow admins to update rider status
CREATE POLICY "Admins can update rider status" 
ON public.profiles 
FOR UPDATE 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Drop existing policy if it exists before creating new one
DROP POLICY IF EXISTS "Users can create transactions for their wallet" ON public.transactions;

-- Allow transactions to be inserted by authenticated users (for wallet operations)
CREATE POLICY "Users can create transactions for their wallet" 
ON public.transactions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM wallets 
    WHERE wallets.id = wallet_id 
    AND wallets.user_id = get_profile_id(auth.uid())
  )
);