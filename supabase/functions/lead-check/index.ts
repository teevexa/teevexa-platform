// Public, read-only check used by the booking page to give instant feedback while the visitor is
// still typing their email, before they fill in the rest of the form.
//
// This is advisory only: it saves the visitor time, but it is NOT the enforcement point. The
// authoritative gate lives in book-consultation (runs again server-side at submit, cannot be
// bypassed from the client). A failure or timeout here must never block booking on its own —
// callers should fail open and let book-consultation have the final word.
import { adminClient, corsHeaders, json, isEmail, hasDescribedProject, makeRateLimiter, clientIp } from "../_shared/util.ts";

// Generous limit: this runs on every email keystroke pause while someone fills in the form.
const rateLimited = makeRateLimiter(60);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    if (rateLimited(`ip:${clientIp(req)}`)) return json({ error: "Too many requests" }, 429);

    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase().slice(0, 254);
    if (!isEmail(email)) return json({ error: "Invalid email" }, 400);

    const hasProject = await hasDescribedProject(adminClient(), email);
    return json({ hasProject });
  } catch (error) {
    // A real error (not "no match found") must not read as a definite "no" to the caller.
    console.error("lead-check error:", error);
    return json({ error: "Could not check right now." }, 500);
  }
});
