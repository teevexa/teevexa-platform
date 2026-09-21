// Team-only: makes sure a lead has a client-portal account.
// Leads from the account-less funnel have no user yet, so onboarding invites them by email
// (they set a password from the invite link) or reuses their existing account.
import { adminClient, corsHeaders, json, getCaller, isEmail, SITE_URL } from "../_shared/util.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const admin = adminClient();
    const caller = await getCaller(req, admin);
    const allowed = caller.roles.some((r) => ["super_admin", "admin", "project_manager"].includes(r));
    if (caller.kind !== "user" || !allowed) return json({ error: "Forbidden" }, 403);

    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const fullName = String(body?.full_name ?? "").trim().slice(0, 100);
    if (!isEmail(email)) return json({ error: "Invalid email" }, 400);

    // Reuse an existing account when there is one.
    const findExisting = async (): Promise<string | null> => {
      for (let page = 1; page <= 10; page++) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) throw error;
        const hit = data.users.find((u: { email?: string }) => (u.email ?? "").toLowerCase() === email);
        if (hit) return hit.id;
        if (data.users.length < 1000) break;
      }
      return null;
    };

    const existing = await findExisting();
    if (existing) return json({ user_id: existing, invited: false });

    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${SITE_URL}/reset-password?invited=1`,
      data: { full_name: fullName || email.split("@")[0] },
    });
    if (error || !data?.user) {
      console.error("invite-client error:", error);
      return json({ error: "Could not invite the client. Check the email address and try again." }, 500);
    }
    return json({ user_id: data.user.id, invited: true });
  } catch (e) {
    console.error("invite-client error:", e);
    return json({ error: "Could not invite the client." }, 500);
  }
});
