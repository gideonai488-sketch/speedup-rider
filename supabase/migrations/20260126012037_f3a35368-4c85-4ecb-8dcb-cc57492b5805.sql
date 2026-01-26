-- Add city column to stores table for location-based filtering
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS city text;

-- Create index for faster city-based queries
CREATE INDEX IF NOT EXISTS idx_stores_city ON public.stores(city);

-- Update existing stores with city based on their addresses (Ghana major cities)
UPDATE public.stores SET city = 'Accra' WHERE address ILIKE '%accra%' OR address ILIKE '%tema%' OR address ILIKE '%east legon%' OR address ILIKE '%osu%' OR address ILIKE '%airport%' OR address IS NULL;
UPDATE public.stores SET city = 'Kumasi' WHERE address ILIKE '%kumasi%' OR address ILIKE '%adum%' OR address ILIKE '%kejetia%';
UPDATE public.stores SET city = 'Tamale' WHERE address ILIKE '%tamale%';
UPDATE public.stores SET city = 'Cape Coast' WHERE address ILIKE '%cape coast%';
UPDATE public.stores SET city = 'Takoradi' WHERE address ILIKE '%takoradi%' OR address ILIKE '%sekondi%';
UPDATE public.stores SET city = 'Ho' WHERE address ILIKE '%ho%' AND address ILIKE '%volta%';
UPDATE public.stores SET city = 'Koforidua' WHERE address ILIKE '%koforidua%';
UPDATE public.stores SET city = 'Sunyani' WHERE address ILIKE '%sunyani%';

-- Set default city for any remaining stores without a city
UPDATE public.stores SET city = 'Accra' WHERE city IS NULL;