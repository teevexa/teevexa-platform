
-- Project inquiries table
CREATE TABLE public.project_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  country TEXT,
  project_type TEXT NOT NULL,
  features TEXT[] DEFAULT '{}',
  budget TEXT,
  timeline TEXT,
  urgency TEXT,
  additional_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.project_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public form)
CREATE POLICY "Anyone can submit project inquiries"
  ON public.project_inquiries
  FOR INSERT
  WITH CHECK (true);

-- Only service role can read
CREATE POLICY "Service role can read inquiries"
  ON public.project_inquiries
  FOR SELECT
  USING (false);

-- Consultation bookings table
CREATE TABLE public.consultation_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  selected_date DATE NOT NULL,
  selected_time TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Africa/Lagos',
  meeting_type TEXT NOT NULL DEFAULT 'zoom',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.consultation_bookings ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public form)
CREATE POLICY "Anyone can submit consultation bookings"
  ON public.consultation_bookings
  FOR INSERT
  WITH CHECK (true);

-- Only service role can read
CREATE POLICY "Service role can read bookings"
  ON public.consultation_bookings
  FOR SELECT
  USING (false);

-- Contact form submissions table
CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form"
  ON public.contact_submissions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can read contacts"
  ON public.contact_submissions
  FOR SELECT
  USING (false);
