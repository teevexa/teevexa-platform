// Team-only: sends the same-day first response (reviewed proposal text + optional Loom walkthrough) to a lead
// and records it (status -> contacted, first_response_at, loom_url).
import { adminClient, corsHeaders, json, escapeHtml, textToHtml, sendEmail, getCaller, isEmail, SITE_URL, ADMIN_INBOX } from "../_shared/util.ts";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const admin = adminClient();
    const caller = await getCaller(req, admin);
    const allowed = caller.roles.some((r) => ["super_admin", "admin", "project_manager"].includes(r));
    if (caller.kind !== "user" || !allowed) return json({ error: "Forbidden" }, 403);

    const b = await req.json();
    const leadId = String(b?.lead_id ?? "");
    const subject = String(b?.subject ?? "").trim().slice(0, 200);
    const message = String(b?.body ?? "").trim().slice(0, 6000);
    let loom: string | null = String(b?.loom_url ?? "").trim() || null;

    if (!UUID_RE.test(leadId)) return json({ error: "Invalid lead" }, 400);
    if (subject.length < 3 || message.length < 20) return json({ error: "Add a subject and a message before sending." }, 400);
    if (/\[ADD QUOTE[^\]]*\]/i.test(message)) return json({ error: "Replace the [ADD QUOTE …] line with the actual quote before sending." }, 400);
    if (loom) {
      try {
        const u = new URL(loom);
        if (u.protocol !== "https:") throw new Error("not https");
        loom = u.toString();
      } catch {
        return json({ error: "The video link must be a valid https URL (e.g. a Loom share link)." }, 400);
      }
    }

    const { data: lead } = await admin.from("project_inquiries").select("id, email, full_name, status").eq("id", leadId).maybeSingle();
    if (!lead || !isEmail(lead.email)) return json({ error: "Lead not found" }, 404);

    const bookUrl = `${SITE_URL}/book-consultation?name=${encodeURIComponent(lead.full_name)}&email=${encodeURIComponent(lead.email)}`;
    const html = `
      <div style="font-family:sans-serif;color:#1e293b;max-width:560px;margin:auto;font-size:15px;">
        ${textToHtml(message)}
        ${loom ? `<p style="margin:24px 0;"><a href="${escapeHtml(loom)}" style="background:#0e7490;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;display:inline-block;">▶ Watch your walkthrough</a></p>` : ""}
        <p style="margin:24px 0;"><a href="${bookUrl}" style="color:#0e7490;font-weight:600;">Book a free 30-minute call →</a></p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;"/>
        <p style="color:#94a3b8;font-size:12px;">Teevexa Ltd · Nairobi, Kenya · teevexa.com</p>
      </div>`;

    const ok = await sendEmail({ to: lead.email, replyTo: ADMIN_INBOX, subject, html });
    if (!ok) return json({ error: "The email could not be sent. Check the email configuration (RESEND_API_KEY) and try again." }, 502);

    const update: Record<string, unknown> = { first_response_at: new Date().toISOString(), loom_url: loom, proposal_draft: message };
    if (lead.status === "new" || lead.status === "draft") update.status = "contacted";
    await admin.from("project_inquiries").update(update).eq("id", leadId);

    return json({ success: true });
  } catch (e) {
    console.error("send-first-response error:", e);
    return json({ error: "Could not send the response." }, 500);
  }
});
