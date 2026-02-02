-- Create partner_applications table for businesses to submit their info
CREATE TABLE public.partner_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  business_type TEXT NOT NULL, -- 'food', 'groceries', 'electronics', 'pharmacy', 'other'
  business_address TEXT NOT NULL,
  city TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  operating_hours TEXT,
  estimated_daily_orders TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'contacted'
  notes TEXT, -- Admin notes
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a partner application (no auth required)
CREATE POLICY "Anyone can submit partner applications"
ON public.partner_applications
FOR INSERT
WITH CHECK (true);

-- Admins can view all applications
CREATE POLICY "Admins can view partner applications"
ON public.partner_applications
FOR SELECT
USING (is_admin(auth.uid()));

-- Admins can update applications
CREATE POLICY "Admins can update partner applications"
ON public.partner_applications
FOR UPDATE
USING (is_admin(auth.uid()));

-- Admins can delete applications
CREATE POLICY "Admins can delete partner applications"
ON public.partner_applications
FOR DELETE
USING (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_partner_applications_updated_at
BEFORE UPDATE ON public.partner_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create whatsapp_otp_settings table for future WhatsApp OTP configuration
CREATE TABLE public.whatsapp_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'twilio', -- 'twilio', 'africastalking', 'termii', etc.
  api_key_reference TEXT, -- Reference to secret name, not actual key
  sender_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.whatsapp_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage WhatsApp settings
CREATE POLICY "Admins can manage whatsapp settings"
ON public.whatsapp_settings
FOR ALL
USING (is_admin(auth.uid()));

-- Create otp_requests table for tracking OTP requests
CREATE TABLE public.otp_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'auth', -- 'auth', 'verification', 'password_reset'
  is_verified BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.otp_requests ENABLE ROW LEVEL SECURITY;

-- Service role only for OTP requests (edge functions will handle this)
CREATE POLICY "Service role only for OTP"
ON public.otp_requests
FOR ALL
USING (false);

-- Create marketing_campaigns table for WhatsApp marketing
CREATE TABLE public.marketing_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  message_template TEXT NOT NULL,
  target_audience TEXT NOT NULL DEFAULT 'all', -- 'all', 'customers', 'riders', 'inactive'
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'cancelled'
  total_recipients INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

-- Only admins can manage marketing campaigns
CREATE POLICY "Admins can manage marketing campaigns"
ON public.marketing_campaigns
FOR ALL
USING (is_admin(auth.uid()));