import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Zoom Server-to-Server OAuth ───────────────────────────────────────────────
async function getZoomAccessToken(): Promise<string> {
  const accountId  = Deno.env.get("ZOOM_ACCOUNT_ID")!;
  const clientId   = Deno.env.get("ZOOM_CLIENT_ID")!;
  const clientSecret = Deno.env.get("ZOOM_CLIENT_SECRET")!;

  const credentials = btoa(`${clientId}:${clientSecret}`);
  const res = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
    {
      method: "POST",
      headers: { Authorization: `Basic ${credentials}` },
    }
  );
  if (!res.ok) throw new Error(`Zoom auth failed: ${await res.text()}`);
  const { access_token } = await res.json();
  return access_token;
}

async function createZoomMeeting(opts: {
  accessToken: string;
  guestName: string;
  selectedDate: string;
  selectedTime: string;
  timezone: string;
  agenda: string;
}): Promise<{ id: string; join_url: string; start_url: string }> {
  const startTime = `${opts.selectedDate}T${opts.selectedTime}:00`;

  const res = await fetch("https://api.zoom.us/v2/users/me/meetings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic: `Teevexa Consultation — ${opts.guestName}`,
      type: 2,
      start_time: startTime,
      duration: 30,
      timezone: opts.timezone,
      agenda: opts.agenda,
      settings: {
        join_before_host: false,
        waiting_room: true,
        mute_upon_entry: true,
        auto_recording: "none",
      },
    }),
  });

  if (!res.ok) throw new Error(`Zoom meeting creation failed: ${await res.text()}`);
  const { id, join_url, start_url } = await res.json();
  return { id: String(id), join_url, start_url };
}
// ─────────────────────────────────────────────────────────────────────────────

// ── Resend email helper ───────────────────────────────────────────────────────
async function sendEmail(opts: { to: string; subject: string; html: string }) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      from: "Teevexa <no-reply@teevexa.com>",
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
    }),
  });

  if (!res.ok) {
    console.warn("Resend error:", await res.text());
  }
}
// ─────────────────────────────────────────────────────────────────────────────

// ── Email templates ───────────────────────────────────────────────────────────
function userConfirmationHtml(data: {
  full_name: string;
  selected_date: string;
  selected_time: string;
  timezone: string;
  zoom_join_url: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f8fafc;font-family:sans-serif;">
      <div style="max-width:540px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
        <div style="background:#0e7490;padding:32px 40px;">
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">
            Consultation Confirmed!
          </h1>
          <p style="margin:8px 0 0;color:#a5f3fc;font-size:14px;">Teevexa — Free 30-Minute Discovery Call</p>
        </div>
        <div style="padding:32px 40px;">
          <p style="margin:0 0 20px;color:#334155;font-size:15px;">
            Hi ${data.full_name},<br/><br/>
            Your consultation with the Teevexa team is confirmed. Here are your details:
          </p>
          <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr>
              <td style="padding:10px 12px;background:#f1f5f9;border-radius:6px 6px 0 0;font-size:13px;color:#64748b;font-weight:600;width:110px;">DATE</td>
              <td style="padding:10px 12px;background:#f1f5f9;border-radius:6px 6px 0 0;font-size:14px;color:#0f172a;">${data.selected_date}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border-top:1px solid #e2e8f0;font-size:13px;color:#64748b;font-weight:600;">TIME</td>
              <td style="padding:10px 12px;border-top:1px solid #e2e8f0;font-size:14px;color:#0f172a;">${data.selected_time} (${data.timezone})</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border-top:1px solid #e2e8f0;font-size:13px;color:#64748b;font-weight:600;">PLATFORM</td>
              <td style="padding:10px 12px;border-top:1px solid #e2e8f0;font-size:14px;color:#0f172a;">Zoom</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;background:#f1f5f9;border-radius:0 0 6px 6px;border-top:1px solid #e2e8f0;font-size:13px;color:#64748b;font-weight:600;">DURATION</td>
              <td style="padding:10px 12px;background:#f1f5f9;border-radius:0 0 6px 6px;border-top:1px solid #e2e8f0;font-size:14px;color:#0f172a;">30 minutes</td>
            </tr>
          </table>

          <div style="text-align:center;margin-bottom:28px;">
            <a href="${data.zoom_join_url}"
               style="display:inline-block;background:#0e7490;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:8px;">
              Join Zoom Meeting
            </a>
          </div>

          <p style="margin:0 0 8px;color:#64748b;font-size:13px;">
            Or copy the link:<br/>
            <a href="${data.zoom_join_url}" style="color:#0e7490;word-break:break-all;">${data.zoom_join_url}</a>
          </p>

          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;"/>

          <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
            Need to cancel or reschedule? Reply to this email or write to
            <a href="mailto:info@teevexa.com" style="color:#0e7490;">info@teevexa.com</a>.<br/>
            We look forward to speaking with you!
          </p>
        </div>
        <div style="background:#f8fafc;padding:16px 40px;border-top:1px solid #e2e8f0;">
          <p style="margin:0;color:#cbd5e1;font-size:11px;">
            © 2026 TEEVEXA LTD · Nairobi, Kenya ·
            <a href="https://teevexa.com" style="color:#94a3b8;">teevexa.com</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function adminNotificationHtml(data: {
  full_name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  selected_date: string;
  selected_time: string;
  timezone: string;
  notes?: string | null;
  zoom_start_url: string;
  zoom_join_url: string;
  zoom_meeting_id: string;
}): string {
  return `
    <h2 style="color:#0e7490;font-family:sans-serif;">New Consultation Booking</h2>
    <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
      <tr><td><strong>Name</strong></td><td>${data.full_name}</td></tr>
      <tr><td><strong>Email</strong></td><td><a href="mailto:${data.email}">${data.email}</a></td></tr>
      <tr><td><strong>Phone</strong></td><td>${data.phone || "—"}</td></tr>
      <tr><td><strong>Company</strong></td><td>${data.company || "—"}</td></tr>
      <tr><td><strong>Date</strong></td><td>${data.selected_date}</td></tr>
      <tr><td><strong>Time</strong></td><td>${data.selected_time} (${data.timezone})</td></tr>
      <tr><td><strong>Zoom ID</strong></td><td>${data.zoom_meeting_id}</td></tr>
      <tr><td><strong>Notes</strong></td><td>${data.notes || "None"}</td></tr>
    </table>
    <p style="font-family:sans-serif;font-size:14px;margin-top:20px;">
      <a href="${data.zoom_start_url}"
         style="background:#0e7490;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-weight:600;">
        Start Zoom Meeting (Host Link)
      </a>
    </p>
    <p style="font-family:sans-serif;font-size:13px;color:#64748b;">
      Guest join link: <a href="${data.zoom_join_url}">${data.zoom_join_url}</a>
    </p>
    <hr/>
    <p style="font-family:sans-serif;font-size:12px;color:#64748b;">
      View in admin panel:
      <a href="https://teevexa.com/admin/consultations">teevexa.com/admin/consultations</a>
    </p>
  `;
}
// ─────────────────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const {
      full_name,
      email,
      phone,
      company,
      selected_date,
      selected_time,
      timezone,
      notes,
    } = body;

    // ── Validate required fields ──────────────────────────────────────────────
    if (!full_name || !email || !selected_date || !selected_time) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Check slot is still available ─────────────────────────────────────────
    const { data: existing } = await supabase
      .from("consultation_bookings")
      .select("id")
      .eq("selected_date", selected_date)
      .eq("selected_time", selected_time)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ error: "This time slot has already been booked. Please choose another." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Create Zoom meeting ───────────────────────────────────────────────────
    let zoomData = { id: "", join_url: "", start_url: "" };
    try {
      const accessToken = await getZoomAccessToken();
      zoomData = await createZoomMeeting({
        accessToken,
        guestName: full_name,
        selectedDate: selected_date,
        selectedTime: selected_time,
        timezone,
        agenda: notes || "Free 30-minute discovery consultation",
      });
    } catch (zoomErr) {
      console.error("Zoom error:", zoomErr);
      // Non-fatal: proceed without Zoom link, admin can create manually
    }

    // ── Insert booking into database ──────────────────────────────────────────
    const { error: dbError } = await supabase.from("consultation_bookings").insert({
      full_name,
      email,
      phone: phone || null,
      company: company || null,
      selected_date,
      selected_time,
      timezone,
      meeting_type: "zoom",
      notes: notes || null,
      zoom_meeting_id: zoomData.id || null,
      zoom_join_url: zoomData.join_url || null,
      zoom_start_url: zoomData.start_url || null,
    });

    if (dbError) throw new Error(`DB insert failed: ${dbError.message}`);

    // ── Send user confirmation email ──────────────────────────────────────────
    await sendEmail({
      to: email,
      subject: `Your Teevexa Consultation is Confirmed — ${selected_date} at ${selected_time}`,
      html: userConfirmationHtml({
        full_name,
        selected_date,
        selected_time,
        timezone,
        zoom_join_url: zoomData.join_url || "https://teevexa.com/book-consultation",
      }),
    });

    // ── Send admin notification email ─────────────────────────────────────────
    await sendEmail({
      to: "teevexa@gmail.com",
      subject: `[Teevexa] New Consultation — ${full_name} on ${selected_date} at ${selected_time}`,
      html: adminNotificationHtml({
        full_name,
        email,
        phone,
        company,
        selected_date,
        selected_time,
        timezone,
        notes,
        zoom_start_url: zoomData.start_url || "",
        zoom_join_url: zoomData.join_url || "",
        zoom_meeting_id: zoomData.id || "N/A",
      }),
    });

    // ── Trigger in-app admin notification ────────────────────────────────────
    supabase.functions.invoke("notify-admin", {
      body: {
        type: "new_consultation",
        data: {
          full_name,
          email,
          meeting_type: "zoom",
          selected_date,
          selected_time,
          timezone,
          notes,
          zoom_join_url: zoomData.join_url,
        },
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        zoom_join_url: zoomData.join_url || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("book-consultation error:", error);
    return new Response(
      JSON.stringify({ error: "Booking failed. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
