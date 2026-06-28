-- =============================================================================
-- Teevexa Trace: Subscription tiers, usage tracking, and billing foundation.
--
-- Design principle:
--   BILLING_ENABLED env var (default false) gates all payment enforcement.
--   During beta every account is free. Flipping the flag activates billing
--   across the entire platform with zero code changes.
--
-- Tier limits:
--   beta       → unlimited (null) — free, expires at beta_expires_at
--   starter    → 500 batches/mo,  5 field agents
--   growth     → 5,000 batches/mo, 25 field agents, analytics
--   enterprise → unlimited (null), SLA, white-label
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. trace_subscriptions table
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.trace_subscriptions (
  id                        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   uuid        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Tier and billing state
  tier                      text        NOT NULL DEFAULT 'beta'
                              CHECK (tier IN ('beta', 'starter', 'growth', 'enterprise')),
  status                    text        NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),

  -- Usage limits (null = unlimited)
  batch_limit               integer     DEFAULT NULL,
  agent_limit               integer     DEFAULT NULL,

  -- Beta expiry — NULL means no expiry set yet
  beta_expires_at           timestamptz DEFAULT NULL,

  -- Future: Flutterwave billing references (populated when billing goes live)
  flutterwave_customer_id   text        DEFAULT NULL,
  flutterwave_subscription_id text      DEFAULT NULL,

  -- Billing period tracking
  current_period_start      timestamptz DEFAULT now(),
  current_period_end        timestamptz DEFAULT (now() + interval '1 month'),

  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.trace_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own subscription
CREATE POLICY "users_view_own_subscription" ON public.trace_subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admins can manage all subscriptions
CREATE POLICY "admins_manage_subscriptions" ON public.trace_subscriptions
  FOR ALL TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Keep updated_at current
CREATE TRIGGER trace_subscriptions_updated_at
  BEFORE UPDATE ON public.trace_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ---------------------------------------------------------------------------
-- 2. trace_usage_stats view — per-user usage summary
--    Computed from existing trace_products and trace_events tables.
--    Accessible by the owning user and admins.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.trace_usage_stats
WITH (security_invoker = true)
AS
SELECT
  p.user_id,
  COALESCE(ts.tier,   'beta')   AS tier,
  COALESCE(ts.status, 'active') AS status,
  ts.beta_expires_at,
  ts.batch_limit,
  ts.agent_limit,
  ts.current_period_start,
  ts.current_period_end,

  -- All-time counts (field agents: what they created)
  COUNT(DISTINCT tp.id)                                              AS batches_total,
  COUNT(DISTINCT te.id)                                              AS events_total,

  -- Current billing period counts
  COUNT(DISTINCT tp.id) FILTER (
    WHERE tp.created_at >= COALESCE(ts.current_period_start, date_trunc('month', now()))
  )                                                                  AS batches_this_period,

  COUNT(DISTINCT te.id) FILTER (
    WHERE te.recorded_at >= COALESCE(ts.current_period_start, date_trunc('month', now()))
  )                                                                  AS events_this_period,

  -- Days remaining in beta (null if no expiry set or already expired)
  CASE
    WHEN ts.beta_expires_at IS NOT NULL AND ts.beta_expires_at > now()
    THEN EXTRACT(DAY FROM (ts.beta_expires_at - now()))::integer
    ELSE NULL
  END                                                                AS beta_days_remaining

FROM public.profiles p
LEFT JOIN public.trace_subscriptions ts ON ts.user_id = p.user_id
LEFT JOIN public.trace_products       tp ON tp.producer_id = p.user_id
LEFT JOIN public.trace_events         te ON te.recorded_by  = p.user_id
GROUP BY
  p.user_id,
  ts.tier,
  ts.status,
  ts.beta_expires_at,
  ts.batch_limit,
  ts.agent_limit,
  ts.current_period_start,
  ts.current_period_end;


-- ---------------------------------------------------------------------------
-- 3. Auto-create a beta subscription when a trace_client or field_agent
--    signs up. The beta_expires_at is intentionally left NULL here —
--    it is set in bulk via an admin action when a cutoff date is decided.
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

  -- Auto-provision a beta subscription for Trace app users
  IF v_role IN ('trace_client', 'field_agent') THEN
    INSERT INTO public.trace_subscriptions (user_id, tier, status)
    VALUES (NEW.id, 'beta', 'active')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;


-- ---------------------------------------------------------------------------
-- 4. Back-fill: create beta subscriptions for existing trace_client and
--    field_agent users who signed up before this migration.
-- ---------------------------------------------------------------------------

INSERT INTO public.trace_subscriptions (user_id, tier, status)
SELECT ur.user_id, 'beta', 'active'
FROM public.user_roles ur
WHERE ur.role IN ('trace_client', 'field_agent')
ON CONFLICT (user_id) DO NOTHING;


-- ---------------------------------------------------------------------------
-- 5. Helper function: check if a user is within their tier limits.
--    Returns true if under limit (or limit is null / billing disabled).
--    Used by application-layer checks — not enforced at DB level during beta.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.within_batch_limit(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_limit   integer;
  v_used    integer;
BEGIN
  SELECT ts.batch_limit,
         COUNT(tp.id) FILTER (
           WHERE tp.created_at >= ts.current_period_start
         )
  INTO   v_limit, v_used
  FROM   public.trace_subscriptions ts
  LEFT JOIN public.trace_products tp ON tp.producer_id = ts.user_id
  WHERE  ts.user_id = p_user_id
  GROUP  BY ts.batch_limit, ts.current_period_start;

  -- null limit = unlimited
  IF v_limit IS NULL THEN RETURN true; END IF;
  RETURN COALESCE(v_used, 0) < v_limit;
END;
$$;
