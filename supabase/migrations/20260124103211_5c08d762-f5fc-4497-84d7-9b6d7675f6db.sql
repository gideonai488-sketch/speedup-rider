-- Add GPS coordinates to stores table
ALTER TABLE public.stores
ADD COLUMN latitude numeric,
ADD COLUMN longitude numeric;

-- Add index for geospatial queries
CREATE INDEX idx_stores_coordinates ON public.stores (latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Update existing stores with Accra-area coordinates
UPDATE public.stores SET latitude = 5.6037, longitude = -0.1870 WHERE latitude IS NULL;