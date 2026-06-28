-- =============================================================================
-- Teevexa Trace: Developer API keys.
--
-- Retailers and enterprise clients use these keys to verify batch provenance
-- programmatically via GET /api/v1/batch/:batchId.
--
-- Design:
--   - Each key is a 64-char hex secret (256-bit entropy) stored as a bcrypt
--     hash.  The plaintext is shown ONCE on creation; never again.
--   - prefix column (first 8 chars of the key) lets users identify keys in the
--     admin UI without exposing the full secret.
--   - rate_limit_rpm: requests per minute.  null = platform default (60 rpm).
--   - Keys belong to trace_client or enterprise users only.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.trace_api_keys (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text        NOT NULL,                          -- human label e.g. "Shopify Integration"
  prefix          text        NOT NULL,                          -- first 8 chars, displayed in UI
  key_hash        text        NOT NULL,                          -- bcrypt hash of the full key
  rate_limit_rpm  integer     DEFAULT NULL,                      -- null = use platform default
  last_used_at    timestamptz DEFAULT NULL,
  revoked         boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.trace_api_keys ENABLE ROW LEVEL SECURITY;

-- Users manage their own keys
CREATE POLICY "users_manage_own_api_keys" ON public.trace_api_keys
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can see all
CREATE POLICY "admins_view_all_api_keys" ON public.trace_api_keys
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE TRIGGER trace_api_keys_updated_at
  BEFORE UPDATE ON public.trace_api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
