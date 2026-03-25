
CREATE TABLE public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  carrier TEXT NOT NULL DEFAULT 'dhl',
  
  -- Package details
  package_weight NUMERIC NOT NULL DEFAULT 0,
  package_length NUMERIC NOT NULL DEFAULT 0,
  package_width NUMERIC NOT NULL DEFAULT 0,
  package_height NUMERIC NOT NULL DEFAULT 0,
  is_fragile BOOLEAN NOT NULL DEFAULT false,
  customs_description TEXT,
  declared_value NUMERIC DEFAULT 0,
  requires_insurance BOOLEAN NOT NULL DEFAULT false,
  
  -- Origin (local pickup)
  origin_address TEXT,
  origin_city TEXT,
  origin_country TEXT DEFAULT 'GH',
  
  -- Destination (international)
  destination_country TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  destination_postal_code TEXT,
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  recipient_email TEXT,
  
  -- DHL API data
  dhl_shipment_id TEXT,
  dhl_tracking_number TEXT,
  dhl_label_url TEXT,
  dhl_qr_code_data TEXT,
  dhl_service_point_id TEXT,
  
  -- Rate & pricing
  quoted_rate NUMERIC,
  currency TEXT DEFAULT 'USD',
  estimated_delivery_date TEXT,
  
  -- Tracking
  current_tracking_status TEXT,
  last_tracking_update TIMESTAMPTZ,
  tracking_events JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shipments"
  ON public.shipments FOR SELECT
  TO authenticated
  USING (user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1));

CREATE POLICY "Users can create own shipments"
  ON public.shipments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1));

CREATE POLICY "Users can update own shipments"
  ON public.shipments FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1));
