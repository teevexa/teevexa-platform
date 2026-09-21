-- =============================================================================
-- Security hardening + account-less project funnel + booking fixes
-- Safe to re-run (idempotent where possible).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. project-attachments bucket: no public read, scoped anonymous upload
--    (previously: anyone could list/download every client upload)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can read project attachments" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload project attachments" ON storage.objects;
DROP POLICY IF EXISTS "Upload inquiry attachments (scoped)" ON storage.objects;
DROP POLICY IF EXISTS "Team can read project attachments" ON storage.objects;
DROP POLICY IF EXISTS "Project files: upload" ON storage.objects;
DROP POLICY IF EXISTS "Project files: read" ON storage.objects;

-- This bucket serves three things, distinguished by the first folder of the object path:
--   inquiries/<uuid>/...   anonymous quote-request attachments   (upload by anyone; read by the team only)
--   <project_uuid>/...     client project files & deliverables   (client who owns the project, assigned staff, team)
-- Everything else is denied. Previously the bucket was world-readable and world-writable.

CREATE POLICY "Upload inquiry attachments (scoped)"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'project-attachments'
  AND (storage.foldername(name))[1] = 'inquiries'
  AND (storage.foldername(name))[2] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
);

CREATE POLICY "Project files: upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'project-attachments'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'project_manager'::app_role)
    OR has_role(auth.uid(), 'developer'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.client_projects p
      WHERE p.id::text = (storage.foldername(name))[1] AND p.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Project files: read"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'project-attachments'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'project_manager'::app_role)
    OR has_role(auth.uid(), 'developer'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.client_projects p
      WHERE p.id::text = (storage.foldername(name))[1] AND p.user_id = auth.uid()
    )
  )
);

-- Client/team files include spreadsheets, video and archives, so no MIME allow-list; cap size at 50 MB.
-- (The public quote form additionally enforces 10 MB and safe types in the browser.)
UPDATE storage.buckets
SET file_size_limit = 52428800,
    allowed_mime_types = NULL
WHERE id = 'project-attachments';

-- ---------------------------------------------------------------------------
-- 2. Public trace verification: replace table-wide anon SELECT with a
--    single-batch RPC that never exposes recorded_by / other producers' data.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "anon_can_view_trace_products" ON public.trace_products;
DROP POLICY IF EXISTS "anon_can_view_trace_events" ON public.trace_events;

CREATE OR REPLACE FUNCTION public.get_public_trace(p_batch_id text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE WHEN p.id IS NULL THEN NULL ELSE jsonb_build_object(
    'product', jsonb_build_object(
      'id', p.id, 'batch_id', p.batch_id, 'product_name', p.product_name,
      'origin', p.origin, 'created_at', p.created_at, 'updated_at', p.updated_at
    ),
    'events', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', e.id, 'product_id', e.product_id, 'event_type', e.event_type,
        'location', e.location, 'latitude', e.latitude, 'longitude', e.longitude,
        'notes', e.notes, 'photo_url', e.photo_url, 'recorded_at', e.recorded_at,
        'blockchain_tx_hash', CASE WHEN e.blockchain_tx_hash ~ '^0x[0-9a-fA-F]{64}$' THEN e.blockchain_tx_hash END
      ) ORDER BY e.recorded_at ASC)
      FROM public.trace_events e WHERE e.product_id = p.batch_id
    ), '[]'::jsonb)
  ) END
  FROM (SELECT 1) AS one
  LEFT JOIN public.trace_products p ON p.batch_id = p_batch_id;
$$;

REVOKE ALL ON FUNCTION public.get_public_trace(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_trace(text) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Consultation booking: real availability + no double booking
-- ---------------------------------------------------------------------------
ALTER TABLE public.consultation_bookings
  ADD COLUMN IF NOT EXISTS starts_at timestamptz;

-- selected_date / selected_time now hold the slot in Africa/Nairobi (EAT);
-- `timezone` remains the visitor's zone, `starts_at` is the exact instant.

CREATE OR REPLACE FUNCTION public.get_booked_slots(p_date date)
RETURNS text[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(selected_time), ARRAY[]::text[])
  FROM public.consultation_bookings
  WHERE selected_date = p_date AND status <> 'cancelled';
$$;

REVOKE ALL ON FUNCTION public.get_booked_slots(date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_booked_slots(date) TO anon, authenticated;

DO $$
BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS uq_consultation_slot
    ON public.consultation_bookings (selected_date, selected_time)
    WHERE status <> 'cancelled';
EXCEPTION WHEN unique_violation THEN
  RAISE NOTICE 'uq_consultation_slot not created: existing duplicate slots. Resolve duplicates and re-run.';
END $$;

-- Direct anonymous inserts are no longer needed (edge function uses service role)
DROP POLICY IF EXISTS "Anyone can submit consultation bookings" ON public.consultation_bookings;

-- Team could read but never update bookings -> status changes silently failed
DROP POLICY IF EXISTS "Team can update consultation bookings" ON public.consultation_bookings;
CREATE POLICY "Team can update consultation bookings" ON public.consultation_bookings
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'project_manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'project_manager'::app_role));

-- ---------------------------------------------------------------------------
-- 4. project_inquiries: funnel columns + team write policies
-- ---------------------------------------------------------------------------
ALTER TABLE public.project_inquiries
  ADD COLUMN IF NOT EXISTS description        text,
  ADD COLUMN IF NOT EXISTS source_link        text,
  ADD COLUMN IF NOT EXISTS starting_point     text,
  ADD COLUMN IF NOT EXISTS brief              jsonb,
  ADD COLUMN IF NOT EXISTS estimate           jsonb,
  ADD COLUMN IF NOT EXISTS draft_token        text,
  ADD COLUMN IF NOT EXISTS proposal_draft     text,
  ADD COLUMN IF NOT EXISTS loom_url           text,
  ADD COLUMN IF NOT EXISTS estimate_sent_at   timestamptz,
  ADD COLUMN IF NOT EXISTS first_response_at  timestamptz;

CREATE INDEX IF NOT EXISTS idx_project_inquiries_email ON public.project_inquiries (lower(email));

-- Public inserts now go through the intake-project edge function (service role)
DROP POLICY IF EXISTS "Anyone can submit project inquiries" ON public.project_inquiries;

DROP POLICY IF EXISTS "Team can insert project inquiries" ON public.project_inquiries;
CREATE POLICY "Team can insert project inquiries" ON public.project_inquiries
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'project_manager'::app_role));

DROP POLICY IF EXISTS "Team can update project inquiries" ON public.project_inquiries;
CREATE POLICY "Team can update project inquiries" ON public.project_inquiries
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'project_manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'project_manager'::app_role));

-- draft_token stores only a SHA-256 hash of the edit token (never the token itself);
-- only the team can read this table, so the hash is not exposed to visitors.

-- ---------------------------------------------------------------------------
-- 5. Waitlist: one signup per email
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS uq_waitlist_email ON public.waitlist_signups (lower(email));
EXCEPTION WHEN unique_violation THEN
  RAISE NOTICE 'uq_waitlist_email not created: duplicate emails exist. De-duplicate and re-run.';
END $$;

-- ---------------------------------------------------------------------------
-- 6. Account deletion: keep anonymised supply-chain records instead of failing.
--    trace_events.recorded_by was NOT NULL with a plain FK, so delete-account
--    (which sets it to NULL) always failed for field agents.
-- ---------------------------------------------------------------------------
DO $$
DECLARE c text;
BEGIN
  FOR c IN SELECT conname FROM pg_constraint
           WHERE conrelid = 'public.trace_events'::regclass AND contype = 'f' AND confrelid = 'auth.users'::regclass
  LOOP EXECUTE format('ALTER TABLE public.trace_events DROP CONSTRAINT %I', c); END LOOP;
  ALTER TABLE public.trace_events ALTER COLUMN recorded_by DROP NOT NULL;
  ALTER TABLE public.trace_events
    ADD CONSTRAINT trace_events_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES auth.users(id) ON DELETE SET NULL;

  FOR c IN SELECT conname FROM pg_constraint
           WHERE conrelid = 'public.trace_products'::regclass AND contype = 'f' AND confrelid = 'auth.users'::regclass
  LOOP EXECUTE format('ALTER TABLE public.trace_products DROP CONSTRAINT %I', c); END LOOP;
  ALTER TABLE public.trace_products ALTER COLUMN producer_id DROP NOT NULL;
  ALTER TABLE public.trace_products
    ADD CONSTRAINT trace_products_producer_id_fkey FOREIGN KEY (producer_id) REFERENCES auth.users(id) ON DELETE SET NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 7. Role changes: only a super_admin may grant or revoke admin / super_admin.
--    (Previously any admin could promote anyone, including themselves, to super_admin.)
--    Server-side calls (auth.uid() IS NULL: service role, migrations, signup trigger) are unaffected.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_privileged_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  touched app_role[];
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  touched := ARRAY[]::app_role[];
  IF TG_OP IN ('INSERT', 'UPDATE') THEN touched := touched || NEW.role; END IF;
  IF TG_OP IN ('UPDATE', 'DELETE') THEN touched := touched || OLD.role; END IF;

  IF (touched && ARRAY['super_admin'::app_role, 'admin'::app_role])
     AND NOT public.has_role(auth.uid(), 'super_admin'::app_role) THEN
    RAISE EXCEPTION 'Only a super admin can grant or revoke the admin and super admin roles';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_privileged_roles ON public.user_roles;
CREATE TRIGGER trg_guard_privileged_roles
  BEFORE INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.guard_privileged_roles();
