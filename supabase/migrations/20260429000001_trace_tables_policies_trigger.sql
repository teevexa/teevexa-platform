-- =============================================================================
-- Teevexa Trace: tables, RLS policies, and updated handle_new_user trigger.
-- Depends on: 20260429000000 (adds trace_client and field_agent to app_role).
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. Update handle_new_user trigger to assign role from signup metadata
--
-- Mobile apps pass app_type in options.data during supabase.auth.signUp():
--   trace-field-app     → app_type: 'trace_field'    → role: field_agent
--   trace-dashboard-app → app_type: 'trace_dashboard' → role: trace_client
--   web-app (default)   → no app_type                → role: client
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role app_role;
  v_app  text;
BEGIN
  v_app := NEW.raw_user_meta_data->>'app_type';

  IF v_app = 'trace_field' THEN
    v_role := 'field_agent';
  ELSIF v_app = 'trace_dashboard' THEN
    v_role := 'trace_client';
  ELSE
    v_role := 'client';
  END IF;

  INSERT INTO public.profiles (user_id, display_name, company)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'company'
  )
  ON CONFLICT (user_id) DO UPDATE
    SET display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
        company      = COALESCE(EXCLUDED.company, profiles.company);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;


-- ---------------------------------------------------------------------------
-- 2. Trace products table (one row per supply chain batch)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.trace_products (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id     text        NOT NULL UNIQUE,
  product_name text        NOT NULL,
  producer_id  uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  origin       text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.trace_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "field_agents_can_insert_products" ON public.trace_products
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = producer_id
    AND has_role(auth.uid(), 'field_agent'::app_role)
  );

CREATE POLICY "field_agents_can_view_products" ON public.trace_products
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'field_agent'::app_role));

CREATE POLICY "trace_clients_can_view_products" ON public.trace_products
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'trace_client'::app_role));

CREATE POLICY "admins_manage_products" ON public.trace_products
  FOR ALL TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE TRIGGER trace_products_updated_at
  BEFORE UPDATE ON public.trace_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ---------------------------------------------------------------------------
-- 3. Trace events table (supply chain events logged by field agents)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.trace_events (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id         text        NOT NULL,
  event_type         text        NOT NULL,
  location           text,
  latitude           numeric,
  longitude          numeric,
  notes              text,
  photo_url          text,
  recorded_by        uuid        NOT NULL REFERENCES auth.users(id),
  recorded_at        timestamptz NOT NULL DEFAULT now(),
  blockchain_tx_hash text,
  created_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.trace_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "field_agents_can_insert_events" ON public.trace_events
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = recorded_by
    AND has_role(auth.uid(), 'field_agent'::app_role)
  );

CREATE POLICY "field_agents_can_view_own_events" ON public.trace_events
  FOR SELECT TO authenticated
  USING (
    auth.uid() = recorded_by
    AND has_role(auth.uid(), 'field_agent'::app_role)
  );

CREATE POLICY "trace_clients_can_view_events" ON public.trace_events
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'trace_client'::app_role));

CREATE POLICY "admins_manage_events" ON public.trace_events
  FOR ALL TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );


-- ---------------------------------------------------------------------------
-- 4. Trace notifications table
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.trace_notifications (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title      text        NOT NULL,
  body       text        NOT NULL,
  read       boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.trace_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_trace_notifications" ON public.trace_notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users_update_own_trace_notifications" ON public.trace_notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "service_can_insert_trace_notifications" ON public.trace_notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "admins_manage_trace_notifications" ON public.trace_notifications
  FOR ALL TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );


-- ---------------------------------------------------------------------------
-- 5. Lock down user_roles — users must never be able to assign themselves roles.
--    The handle_new_user trigger runs as SECURITY DEFINER and bypasses RLS,
--    so legitimate role assignment still works.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "users_cannot_self_assign_roles" ON public.user_roles;
CREATE POLICY "users_cannot_self_assign_roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (false);

DROP POLICY IF EXISTS "users_cannot_self_update_roles" ON public.user_roles;
CREATE POLICY "users_cannot_self_update_roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (false);
