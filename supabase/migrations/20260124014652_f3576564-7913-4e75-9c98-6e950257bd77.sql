-- Add payment_status and Uber-style fee fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS distance_km numeric,
ADD COLUMN IF NOT EXISTS base_fee numeric DEFAULT 5,
ADD COLUMN IF NOT EXISTS per_km_fee numeric DEFAULT 2,
ADD COLUMN IF NOT EXISTS surge_multiplier numeric DEFAULT 1,
ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone;

-- Add constraint for payment_status
ALTER TABLE public.orders
ADD CONSTRAINT orders_payment_status_check 
CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed', 'refunded'));

-- Create function to calculate delivery fee like Uber
CREATE OR REPLACE FUNCTION public.calculate_delivery_fee(
  p_distance_km numeric,
  p_base_fee numeric DEFAULT 5,
  p_per_km_fee numeric DEFAULT 2,
  p_surge_multiplier numeric DEFAULT 1
) RETURNS numeric AS $$
BEGIN
  RETURN ROUND((p_base_fee + (p_distance_km * p_per_km_fee)) * p_surge_multiplier, 2);
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create function to get current surge multiplier based on time/demand
CREATE OR REPLACE FUNCTION public.get_surge_multiplier() RETURNS numeric AS $$
DECLARE
  current_hour integer;
  pending_orders integer;
  available_riders integer;
  demand_ratio numeric;
BEGIN
  current_hour := EXTRACT(HOUR FROM NOW());
  
  -- Get pending orders count
  SELECT COUNT(*) INTO pending_orders 
  FROM public.orders 
  WHERE status IN ('pending', 'confirmed', 'ready_for_pickup') 
  AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Get available riders count
  SELECT COUNT(*) INTO available_riders 
  FROM public.rider_locations 
  WHERE is_online = true;
  
  -- Calculate demand ratio
  IF available_riders > 0 THEN
    demand_ratio := pending_orders::numeric / available_riders::numeric;
  ELSE
    demand_ratio := 2; -- High surge if no riders
  END IF;
  
  -- Peak hours (12-2pm, 6-9pm) get slight boost
  IF current_hour BETWEEN 12 AND 14 OR current_hour BETWEEN 18 AND 21 THEN
    demand_ratio := demand_ratio * 1.2;
  END IF;
  
  -- Return multiplier (min 1, max 2.5)
  RETURN LEAST(GREATEST(1, 1 + (demand_ratio * 0.3)), 2.5);
END;
$$ LANGUAGE plpgsql SET search_path = public;