// Triggers a Vercel redeploy so newly published blog posts, case studies and job postings get a
// real prerendered HTML page and a sitemap entry without waiting for the next unrelated code deploy.
// Called from the admin Blog/Portfolio/Careers editors right after a record is published (see
// src/lib/functions.ts's triggerRebuild helper). Safe to call often: Vercel Deploy Hooks de-duplicate
// concurrent builds on their own, and this function itself rate-limits to avoid hammering the hook.
//
// Requires the DEPLOY_HOOK_URL secret (Vercel project -> Settings -> Git -> Deploy Hooks -> create one
// for the production branch, then: supabase secrets set DEPLOY_HOOK_URL=<the generated URL>).
// Until that secret is set, this function responds 200 with { skipped: true } rather than failing the
// publish action: a missing rebuild trigger should never block an editor from publishing content.
import { adminClient, corsHeaders, getCaller, json } from "../_shared/util.ts";

const MIN_INTERVAL_MS = 60_000;
let lastTriggeredAt = 0;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = adminClient();
  const caller = await getCaller(req, supabase);
  if (!caller.isTeam) return json({ error: "Forbidden" }, 403);

  const hookUrl = Deno.env.get("DEPLOY_HOOK_URL");
  if (!hookUrl) return json({ skipped: true, reason: "DEPLOY_HOOK_URL is not configured" });

  const now = Date.now();
  if (now - lastTriggeredAt < MIN_INTERVAL_MS) {
    return json({ skipped: true, reason: "A rebuild was already triggered in the last minute" });
  }

  try {
    const res = await fetch(hookUrl, { method: "POST" });
    lastTriggeredAt = now;
    if (!res.ok) return json({ error: `Deploy hook responded ${res.status}` }, 502);
    return json({ triggered: true });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Deploy hook request failed" }, 502);
  }
});
