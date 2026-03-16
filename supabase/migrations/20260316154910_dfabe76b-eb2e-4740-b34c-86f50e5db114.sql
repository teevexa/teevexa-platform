
-- Tighten public INSERT policies to require non-empty required fields
-- These are public forms so WITH CHECK (true) is intentional, but we can add basic validation

-- Drop and recreate with minimal validation (ensuring required fields are non-null/non-empty)
DROP POLICY IF EXISTS "Anyone can submit consultation bookings" ON public.consultation_bookings;
CREATE POLICY "Anyone can submit consultation bookings"
ON public.consultation_bookings
FOR INSERT
TO public
WITH CHECK (
  full_name IS NOT NULL AND full_name != '' AND
  email IS NOT NULL AND email != '' AND
  selected_date IS NOT NULL AND
  selected_time IS NOT NULL AND selected_time != ''
);

DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact form"
ON public.contact_submissions
FOR INSERT
TO public
WITH CHECK (
  full_name IS NOT NULL AND full_name != '' AND
  email IS NOT NULL AND email != '' AND
  subject IS NOT NULL AND subject != '' AND
  message IS NOT NULL AND message != ''
);

DROP POLICY IF EXISTS "Anyone can submit project inquiries" ON public.project_inquiries;
CREATE POLICY "Anyone can submit project inquiries"
ON public.project_inquiries
FOR INSERT
TO public
WITH CHECK (
  full_name IS NOT NULL AND full_name != '' AND
  email IS NOT NULL AND email != '' AND
  project_type IS NOT NULL AND project_type != ''
);

DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist_signups;
CREATE POLICY "Anyone can join waitlist"
ON public.waitlist_signups
FOR INSERT
TO public
WITH CHECK (
  full_name IS NOT NULL AND full_name != '' AND
  email IS NOT NULL AND email != ''
);

DROP POLICY IF EXISTS "Anyone can submit applications" ON public.job_applications;
CREATE POLICY "Anyone can submit applications"
ON public.job_applications
FOR INSERT
TO public
WITH CHECK (
  full_name IS NOT NULL AND full_name != '' AND
  email IS NOT NULL AND email != '' AND
  job_id IS NOT NULL
);
