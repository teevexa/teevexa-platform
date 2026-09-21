import {
  adminClient, corsHeaders, json, escapeHtml, sendEmail, isEmail, SITE_URL, ADMIN_INBOX,
} from "../_shared/util.ts";
import { eatParts, isBookableInstant, isValidTimeZone, zonedParts } from "../_shared/slots.ts";

// ── Zoom Server-to-Server OAuth ───────────────────────────────────────────────
async function getZoomAccessToken(): Promise<string> {
  const accountId = Deno.env.get("ZOOM_ACCOUNT_ID");
  const clientId = Deno.env.get("ZOOM_CLIENT_ID");
  const clientSecret = Deno.env.get("ZOOM_CLIENT_SECRET");
  if (!accountId || !clientId || !clientSecret) throw new Error("Zoom credentials not configured");

  const credentials = btoa(`${clientId}:${clientSecret}`);
  const res = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
    { method: "POST", headers: { Authorization: `Basic ${credentials}` } },
  );
  if (!res.ok) throw new Error(`Zoom auth failed: ${await res.text()}`);
  const { access_token } = await res.json();
  return access_token;
}

async function createZoomMeeting(opts: {
  accessToken: string;
  guestName: string;
  eatDate: string;
  eatTime: string;
  agenda: string;
}): Promise<{ id: string; join_url: string; start_url: string }> {
  const res = await fetch("https://api.zoom.us/v2/users/me/meetings", {
    method: "POST",
    headers: { Authorization: `Bearer ${opts.accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      topic: `Teevexa Consultation — ${opts.guestName}`,
      type: 2,
      // Slots are defined in Nairobi time, so schedule the meeting in that zone.
      start_time: `${opts.eatDate}T${opts.eatTime}:00`,
      duration: 30,
      timezone: "Africa/Nairobi",
      agenda: opts.agenda,
      settings: { join_before_host: false, waiting_room: true, mute_upon_entry: true, auto_recording: "none" },
    }),
  });
  if (!res.ok) throw new Error(`Zoom meeting creation failed: ${await res.text()}`);
  const { id, join_url, start_url } = await res.json();
  return { id: String(id), join_url, start_url };
}

// ── .ics calendar invite (UTC, so it is correct in every calendar) ───────────
function icsStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function generateIcs(opts: { name: string; start: Date; joinUrl: string | null }): string {
  const end = new Date(opts.start.getTime() + 30 * 60_000);
  const safeName = opts.name.replace(/[\r\n,;]/g, " ");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Teevexa//Consultation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@teevexa.com`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(opts.start)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:Teevexa Discovery Call — ${safeName}`,
    `DESCRIPTION:${opts.joinUrl ? `Join Zoom: ${opts.joinUrl}\\n` : "Meeting link will be emailed separately.\\n"}Duration: 30 minutes`,
    ...(opts.joinUrl ? [`LOCATION:${opts.joinUrl}`] : []),
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

const fmtLong = (d: Date, tz: string) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: tz, weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZoneName: "short",
  }).format(d);

function userConfirmationHtml(o: { name: string; when: string; whenEat: string; joinUrl: string | null }): string {
  const linkBlock = o.joinUrl
    ? `<div style="text-align:center;margin-bottom:28px;">
         <a href="${escapeHtml(o.joinUrl)}" style="display:inline-block;background:#0e7490;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:8px;">Join Zoom Meeting</a>
       </div>
       <p style="margin:0 0 8px;color:#64748b;font-size:13px;">Or copy the link:<br/><a href="${escapeHtml(o.joinUrl)}" style="color:#0e7490;word-break:break-all;">${escapeHtml(o.joinUrl)}</a></p>`
    : `<p style="margin:0 0 20px;color:#334155;font-size:14px;background:#f1f5f9;padding:12px 16px;border-radius:8px;">Your Zoom link is being prepared and will be emailed to you shortly, well before the call.</p>`;
  return `
    <!DOCTYPE html><html><body style="margin:0;padding:0;background:#f8fafc;font-family:sans-serif;">
      <div style="max-width:540px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
        <div style="background:#0e7490;padding:32px 40px;">
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Consultation Confirmed!</h1>
          <p style="margin:8px 0 0;color:#a5f3fc;font-size:14px;">Teevexa — Free 30-Minute Discovery Call</p>
        </div>
        <div style="padding:32px 40px;">
          <p style="margin:0 0 20px;color:#334155;font-size:15px;">Hi ${escapeHtml(o.name)},<br/><br/>Your consultation with the Teevexa team is confirmed.</p>
          <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr><td style="padding:10px 12px;background:#f1f5f9;font-size:13px;color:#64748b;font-weight:600;width:110px;">YOUR TIME</td><td style="padding:10px 12px;background:#f1f5f9;font-size:14px;color:#0f172a;">${escapeHtml(o.when)}</td></tr>
            <tr><td style="padding:10px 12px;border-top:1px solid #e2e8f0;font-size:13px;color:#64748b;font-weight:600;">NAIROBI</td><td style="padding:10px 12px;border-top:1px solid #e2e8f0;font-size:14px;color:#0f172a;">${escapeHtml(o.whenEat)}</td></tr>
            <tr><td style="padding:10px 12px;border-top:1px solid #e2e8f0;font-size:13px;color:#64748b;font-weight:600;">PLATFORM</td><td style="padding:10px 12px;border-top:1px solid #e2e8f0;font-size:14px;color:#0f172a;">Zoom · 30 minutes</td></tr>
          </table>
          ${linkBlock}
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;"/>
          <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">Need to cancel or reschedule? Reply to this email or write to <a href="mailto:hello@teevexa.com" style="color:#0e7490;">hello@teevexa.com</a>.</p>
        </div>
      </div>
    </body></html>`;
}

const clip = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabase = adminClient();
    const body = await req.json();

    const full_name = clip(body.full_name, 100);
    const email = clip(body.email, 254).toLowerCase();
    const phone = clip(body.phone, 30) || null;
    const company = clip(body.company, 100) || null;
    const notes = clip(body.notes, 2000) || null;
    const startsAt = new Date(String(body.starts_at ?? ""));
    const visitorTz = isValidTimeZone(String(body.timezone ?? "")) ? String(body.timezone) : "Africa/Nairobi";

    if (full_name.length < 2 || !isEmail(email)) return json({ error: "Please provide your name and a valid email." }, 400);
    if (!isBookableInstant(startsAt)) return json({ error: "That time is not available. Please choose another slot." }, 400);

    // Slots are stored in Nairobi wall-clock time; the unique index on (date, time) prevents double booking.
    const eat = eatParts(startsAt);

    // Abuse guard: max 3 bookings per email per day.
    const since = new Date(Date.now() - 86400_000).toISOString();
    const { count } = await supabase
      .from("consultation_bookings")
      .select("id", { count: "exact", head: true })
      .ilike("email", email)
      .gte("created_at", since);
    if ((count ?? 0) >= 3) return json({ error: "Too many bookings from this email today. Please contact us directly." }, 429);

    // Fast pre-check (the unique index below is the real guarantee).
    const { data: taken } = await supabase
      .from("consultation_bookings")
      .select("id")
      .eq("selected_date", eat.date)
      .eq("selected_time", eat.time)
      .neq("status", "cancelled")
      .limit(1);
    if (taken && taken.length > 0) return json({ error: "This time slot has already been booked. Please choose another." }, 409);

    // 1) Claim the slot first (atomic via unique index) — no orphan Zoom meetings on conflict.
    const { data: inserted, error: insertErr } = await supabase
      .from("consultation_bookings")
      .insert({
        full_name, email, phone, company, notes,
        selected_date: eat.date, selected_time: eat.time,
        starts_at: startsAt.toISOString(), timezone: visitorTz, meeting_type: "zoom",
      })
      .select("id")
      .single();

    if (insertErr) {
      if (insertErr.code === "23505") return json({ error: "This time slot has already been booked. Please choose another." }, 409);
      throw new Error(`DB insert failed: ${insertErr.message}`);
    }

    // 2) Create the Zoom meeting (non-fatal: the team can add a link manually).
    let zoom = { id: "", join_url: "", start_url: "" };
    try {
      zoom = await createZoomMeeting({
        accessToken: await getZoomAccessToken(),
        guestName: full_name,
        eatDate: eat.date,
        eatTime: eat.time,
        agenda: notes || "Free 30-minute discovery consultation",
      });
      await supabase
        .from("consultation_bookings")
        .update({ zoom_meeting_id: zoom.id, zoom_join_url: zoom.join_url, zoom_start_url: zoom.start_url })
        .eq("id", inserted.id);
    } catch (zoomErr) {
      console.error("Zoom error:", zoomErr);
    }

    // 3) Emails
    const joinUrl = zoom.join_url || null;
    const ics = generateIcs({ name: full_name, start: startsAt, joinUrl });
    const icsBase64 = btoa(unescape(encodeURIComponent(ics)));
    const when = fmtLong(startsAt, visitorTz);
    const whenEat = fmtLong(startsAt, "Africa/Nairobi");

    await sendEmail({
      to: email,
      subject: `Your Teevexa consultation is confirmed — ${zonedParts(startsAt, visitorTz).date}`,
      html: userConfirmationHtml({ name: full_name, when, whenEat, joinUrl }),
      attachments: [{ filename: "teevexa-consultation.ics", content: icsBase64 }],
    });

    await sendEmail({
      to: ADMIN_INBOX,
      replyTo: email,
      subject: `[Teevexa] New Consultation — ${full_name}, ${whenEat}`,
      html: `
        <h2 style="color:#0e7490;font-family:sans-serif;">New Consultation Booking</h2>
        <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
          <tr><td><strong>Name</strong></td><td>${escapeHtml(full_name)}</td></tr>
          <tr><td><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
          <tr><td><strong>Phone</strong></td><td>${escapeHtml(phone || "—")}</td></tr>
          <tr><td><strong>Company</strong></td><td>${escapeHtml(company || "—")}</td></tr>
          <tr><td><strong>Nairobi time</strong></td><td>${escapeHtml(whenEat)}</td></tr>
          <tr><td><strong>Visitor time</strong></td><td>${escapeHtml(when)}</td></tr>
          <tr><td><strong>Notes</strong></td><td>${escapeHtml(notes || "None")}</td></tr>
        </table>
        ${zoom.start_url
          ? `<p style="font-family:sans-serif;font-size:14px;margin-top:20px;"><a href="${escapeHtml(zoom.start_url)}" style="background:#0e7490;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-weight:600;">Start Zoom Meeting (Host Link)</a></p>`
          : `<p style="font-family:sans-serif;font-size:14px;color:#b45309;"><strong>No Zoom link was created</strong> — please send the guest a meeting link manually.</p>`}
        <p style="font-family:sans-serif;font-size:12px;color:#64748b;">View in admin panel: <a href="${SITE_URL}/admin/consultations">${SITE_URL}/admin/consultations</a></p>
      `,
    });

    // In-app notification (awaited so the runtime doesn't drop it when we return)
    await supabase.functions.invoke("notify-admin", {
      body: { type: "new_consultation", data: { full_name, meeting_type: "zoom", selected_date: eat.date } },
    }).catch((e: unknown) => console.warn("notify-admin failed:", e));

    return json({ success: true, zoom_join_url: joinUrl });
  } catch (error) {
    console.error("book-consultation error:", error);
    return json({ error: "Booking failed. Please try again." }, 500);
  }
});
