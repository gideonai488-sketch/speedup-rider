
CREATE TABLE public.ambassador_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  university_name TEXT NOT NULL,
  university_city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  year_of_study TEXT NOT NULL,
  major TEXT,
  student_id_number TEXT,
  social_media_handle TEXT,
  follower_count TEXT,
  why_ambassador TEXT NOT NULL,
  referral_code TEXT UNIQUE DEFAULT UPPER(SUBSTRING(MD5(gen_random_uuid()::text) FROM 1 FOR 8)),
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ambassador_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an application
CREATE POLICY "Anyone can submit ambassador applications"
  ON public.ambassador_applications
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Admins can view all applications
CREATE POLICY "Admins can view ambassador applications"
  ON public.ambassador_applications
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Admins can update applications
CREATE POLICY "Admins can update ambassador applications"
  ON public.ambassador_applications
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Admins can delete applications
CREATE POLICY "Admins can delete ambassador applications"
  ON public.ambassador_applications
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));
