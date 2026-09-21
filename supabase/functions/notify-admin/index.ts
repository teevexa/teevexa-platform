import {
  adminClient, corsHeaders, json, escapeHtml, textToHtml, sendEmail, getCaller, isEmail, SITE_URL, ADMIN_INBOX,
} from "../_shared/util.ts";

// Types anyone (anonymous visitors) may trigger. They only ever email the fixed admin inbox.
const PUBLIC_TYPES = ["new_contact", "waitlist_signup"];
// Types that email an arbitrary recipient -> team members only.
const TEAM_ONLY_TYPES = ["client_onboarded", "milestone_completed", "invoice_created", "task_overdue", "invoice_overdue"];

const clip = (v: unknown, n = 500) => String(v ?? "").slice(0, n);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = adminClient();
    const caller = await getCaller(req, supabase);

    const body = await req.json();
    const type = clip(body?.type, 64);
    const raw = (body?.data && typeof body.data === "object" ? body.data : {}) as Record<string, unknown>;

    const isPublic = PUBLIC_TYPES.includes(type);
    if (!isPublic && caller.kind === "anon") return json({ error: "Unauthorized" }, 401);
    if (TEAM_ONLY_TYPES.includes(type) && !caller.isTeam) return json({ error: "Forbidden" }, 403);

    // Cheap flood guard for anonymous callers: at most 20 notifications of one type per minute.
    if (caller.kind === "anon") {
      const since = new Date(Date.now() - 60_000).toISOString();
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("title", type === "new_contact" ? "New Contact Message" : "New Waitlist Signup")
        .gte("created_at", since);
      if ((count ?? 0) > 20) return json({ error: "Too many requests" }, 429);
    }

    // Only whitelisted, length-capped fields are used.
    const data = {
      full_name: clip(raw.full_name, 120), email: clip(raw.email, 254), subject: clip(raw.subject, 200),
      message: clip(raw.message, 4000), project_type: clip(raw.project_type, 60), budget: clip(raw.budget, 120),
      timeline: clip(raw.timeline, 120), meeting_type: clip(raw.meeting_type, 40), selected_date: clip(raw.selected_date, 20),
      title: clip(raw.title, 200), project_id: clip(raw.project_id, 64), invoice_number: clip(raw.invoice_number, 60),
      amount: clip(raw.amount, 30), client_name: clip(raw.client_name, 120), client_email: clip(raw.client_email, 254),
      project_title: clip(raw.project_title, 200), user_id: clip(raw.user_id, 64),
    };

    // ── Email notifications ──────────────────────────────────────────────────
    if (type === "new_contact") {
      await sendEmail({
        to: ADMIN_INBOX,
        replyTo: isEmail(data.email) ? data.email : undefined,
        subject: `[Teevexa] New Contact: ${data.subject || "No subject"}`,
        html: `
          <h2 style="color:#0e7490;">New Contact Form Submission</h2>
          <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
            <tr><td><strong>Name</strong></td><td>${escapeHtml(data.full_name) || "—"}</td></tr>
            <tr><td><strong>Email</strong></td><td>${escapeHtml(data.email) || "—"}</td></tr>
            <tr><td><strong>Subject</strong></td><td>${escapeHtml(data.subject) || "—"}</td></tr>
          </table>
          <hr/>
          <div style="font-family:sans-serif;font-size:14px;">${textToHtml(data.message || "—")}</div>
          <hr/>
          <p style="font-family:sans-serif;font-size:12px;color:#64748b;">
            View in admin panel: <a href="${SITE_URL}/admin/contacts">${SITE_URL.replace(/^https?:\/\//, "")}/admin/contacts</a>
          </p>
        `,
      });
    }

    if (type === "client_onboarded" && isEmail(data.client_email)) {
      await sendEmail({
        to: data.client_email,
        subject: `Your project "${data.project_title || "New Project"}" is ready — Teevexa`,
        html: `
          <div style="font-family:sans-serif;font-size:15px;color:#1e293b;max-width:560px;margin:auto;">
            <h2 style="color:#0e7490;">Welcome to your project workspace!</h2>
            <p>Hi ${escapeHtml(data.client_name) || "there"},</p>
            <p>Your project <strong>${escapeHtml(data.project_title) || "New Project"}</strong> has been set up and is ready for you in the Teevexa client portal. You can track progress, view milestones, download deliverables, and message the team — all in one place.</p>
            <p style="margin:24px 0;">
              <a href="${SITE_URL}/client-portal" style="background:#0e7490;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;display:inline-block;">
                Open Your Project Portal
              </a>
            </p>
            <p style="color:#64748b;font-size:13px;">To sign in, use the email address this message was sent to at <a href="${SITE_URL}/auth" style="color:#0e7490;">${SITE_URL.replace(/^https?:\/\//, "")}/auth</a>. If you haven't set a password yet, use the invitation email we sent you, or choose “Forgot password”. Questions before kickoff? Just reply to this email.</p>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;"/>
            <p style="color:#94a3b8;font-size:12px;">Teevexa · teevexa.com</p>
          </div>
        `,
      });
    }

    // new_consultation / new_lead emails are sent by their own edge functions
    // (book-consultation, intake-project) which have the full details.

    // ── In-app notifications ──────────────────────────────────────────────────
    const notificationMap: Record<string, { title: string; message: string; notifyType: string; link?: string; targetRole?: string[] }> = {
      new_lead: {
        title: "New Project Inquiry",
        message: `${data.full_name || "Someone"} submitted a project inquiry for ${data.project_type || "a project"}.`,
        notifyType: "info",
        link: "/admin/leads",
        targetRole: ["super_admin", "admin", "project_manager"],
      },
      new_consultation: {
        title: "New Consultation Booking",
        message: `${data.full_name || "Someone"} booked a ${data.meeting_type || "consultation"} on ${data.selected_date || "TBD"}.`,
        notifyType: "info",
        link: "/admin/consultations",
        targetRole: ["super_admin", "admin", "project_manager"],
      },
      new_contact: {
        title: "New Contact Message",
        message: `${data.full_name || "Someone"} sent a message: "${data.subject || "No subject"}".`,
        notifyType: "message",
        link: "/admin/contacts",
        targetRole: ["super_admin", "admin"],
      },
      milestone_completed: {
        title: "Milestone Completed",
        message: `Milestone "${data.title || "Unknown"}" has been marked as completed.`,
        notifyType: "milestone",
        link: data.project_id ? `/admin/projects/${data.project_id}` : "/admin/milestones",
        targetRole: ["super_admin", "admin", "project_manager"],
      },
      invoice_created: {
        title: "New Invoice Created",
        message: `Invoice #${data.invoice_number || "N/A"} for $${data.amount || 0} has been created.`,
        notifyType: "invoice",
        link: "/admin/invoices",
        targetRole: ["super_admin", "admin"],
      },
      deliverable_submitted: {
        title: "Deliverable Submitted for Review",
        message: `"${data.title || "A deliverable"}" has been submitted and awaits approval.`,
        notifyType: "info",
        link: "/admin/deliverables",
        targetRole: ["super_admin", "admin", "project_manager"],
      },
      support_ticket: {
        title: "New Support Ticket",
        message: `A support ticket "${data.subject || "No subject"}" has been opened.`,
        notifyType: "info",
        link: "/admin/support-tickets",
        targetRole: ["super_admin", "admin", "project_manager"],
      },
      task_overdue: {
        title: "Task Overdue",
        message: `Task "${data.title || "Unknown"}" is past its due date.`,
        notifyType: "info",
        link: "/admin/tasks",
        targetRole: ["super_admin", "admin", "project_manager"],
      },
      invoice_overdue: {
        title: "Invoice Overdue",
        message: `Invoice #${data.invoice_number || "N/A"} for $${data.amount || 0} is overdue.`,
        notifyType: "invoice",
        link: "/admin/invoices",
        targetRole: ["super_admin", "admin"],
      },
      client_onboarded: {
        title: "Client Onboarded",
        message: `${data.client_name || "A client"} has been onboarded with project "${data.project_title || "Unknown"}".`,
        notifyType: "info",
        link: data.project_id ? `/admin/projects/${data.project_id}` : "/admin/projects",
        targetRole: ["super_admin", "admin", "project_manager"],
      },
      waitlist_signup: {
        title: "New Waitlist Signup",
        message: `${data.full_name || "Someone"} joined the Teevexa Trace waitlist.`,
        notifyType: "info",
        link: "/admin/waitlist",
        targetRole: ["super_admin", "admin"],
      },
    };

    const config = notificationMap[type];

    if (config) {
      const targetRoles = config.targetRole || ["super_admin", "admin"];
      const { data: roleUsers } = await supabase
        .from("user_roles")
        .select("user_id")
        .in("role", targetRoles);

      if (roleUsers && roleUsers.length > 0) {
        const notifications = roleUsers.map((ru: { user_id: string }) => ({
          user_id: ru.user_id,
          title: config.title,
          message: config.message,
          type: config.notifyType,
          link: config.link || null,
        }));

        await supabase.from("notifications").insert(notifications);
      }

      if (caller.isTeam && data.user_id && ["milestone_completed", "invoice_created", "deliverable_submitted"].includes(type)) {
        await supabase.from("notifications").insert({
          user_id: data.user_id,
          title: config.title,
          message: config.message,
          type: config.notifyType,
          link: config.link?.replace("/admin/", "/client-portal/") || null,
        });
      }
    }

    return json({ success: true, message: `Notified about ${type}`, notified: !!config });
  } catch (error) {
    console.error("Notification error:", error);
    return json({ error: "Notification failed" }, 500);
  }
});
