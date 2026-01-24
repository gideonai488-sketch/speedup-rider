-- Add service_fee column to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS service_fee numeric DEFAULT 2;

-- Add rider_fee column (flat 5 cedis taken from rider per order)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS rider_fee numeric DEFAULT 5;

-- Update calculate_delivery_fee function to include service fee
CREATE OR REPLACE FUNCTION public.calculate_delivery_fee(
  p_distance_km numeric, 
  p_base_fee numeric DEFAULT 5, 
  p_per_km_fee numeric DEFAULT 2, 
  p_surge_multiplier numeric DEFAULT 1,
  p_service_fee numeric DEFAULT 2
)
RETURNS numeric
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN ROUND((p_base_fee + (p_distance_km * p_per_km_fee) + p_service_fee) * p_surge_multiplier, 2);
END;
$function$;