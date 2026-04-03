import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { type, data } = await req.json();

    console.log(`[ADMIN NOTIFICATION] Type: ${type}`, JSON.stringify(data, null, 2));

    // Determine notification details based on event type
    const notificationMap: Record<string, { title: string; message: string; notifyType: string; link?: string; targetRole?: string[] }> = {
      new_lead: {
        title: "New Project Inquiry",
        message: `${data?.full_name || "Someone"} submitted a project inquiry for ${data?.project_type || "a project"}.`,
        notifyType: "info",
        link: "/admin/leads",
        targetRole: ["super_admin", "admin", "project_manager"],
      },
      new_consultation: {
        title: "New Consultation Booking",
        message: `${data?.full_name || "Someone"} booked a ${data?.meeting_type || "consultation"} on ${data?.selected_date || "TBD"}.`,
        notifyType: "info",
        link: "/admin/consultations",
        targetRole: ["super_admin", "admin", "project_manager"],
      },
      new_contact: {
        title: "New Contact Message",
        message: `${data?.full_name || "Someone"} sent a message: "${data?.subject || "No subject"}".`,
        notifyType: "message",
        link: "/admin/messages",
        targetRole: ["super_admin", "admin"],
      },
      milestone_completed: {
        title: "Milestone Completed",
        message: `Milestone "${data?.title || "Unknown"}" has been marked as completed.`,
        notifyType: "milestone",
        link: data?.project_id ? `/admin/projects/${data.project_id}` : "/admin/milestones",
        targetRole: ["super_admin", "admin", "project_manager"],
      },
      invoice_created: {
        title: "New Invoice Created",
        message: `Invoice #${data?.invoice_number || "N/A"} for $${data?.amount || 0} has been created.`,
        notifyType: "invoice",
        link: "/admin/invoices",
        targetRole: ["super_admin", "admin"],
      },
      deliverable_submitted: {
        title: "Deliverable Submitted for Review",
        message: `"${data?.title || "A deliverable"}" has been submitted and awaits approval.`,
        notifyType: "info",
        link: "/admin/deliverables",
        targetRole: ["super_admin", "admin", "project_manager"],
      },
      support_ticket: {
        title: "New Support Ticket",
        message: `A support ticket "${data?.subject || "No subject"}" has been opened.`,
        notifyType: "info",
        link: "/admin/support-tickets",
        targetRole: ["super_admin", "admin", "project_manager"],
      },
      task_overdue: {
        title: "Task Overdue",
        message: `Task "${data?.title || "Unknown"}" is past its due date.`,
        notifyType: "info",
        link: "/admin/tasks",
        targetRole: ["super_admin", "admin", "project_manager"],
      },
      invoice_overdue: {
        title: "Invoice Overdue",
        message: `Invoice #${data?.invoice_number || "N/A"} for $${data?.amount || 0} is overdue.`,
        notifyType: "invoice",
        link: "/admin/invoices",
        targetRole: ["super_admin", "admin"],
      },
      client_onboarded: {
        title: "Client Onboarded",
        message: `${data?.client_name || "A client"} has been onboarded with project "${data?.project_title || "Unknown"}".`,
        notifyType: "info",
        link: data?.project_id ? `/admin/projects/${data.project_id}` : "/admin/projects",
        targetRole: ["super_admin", "admin", "project_manager"],
      },
      waitlist_signup: {
        title: "New Waitlist Signup",
        message: `${data?.full_name || "Someone"} joined the Teevexa Trace waitlist.`,
        notifyType: "info",
        link: "/admin/waitlist",
        targetRole: ["super_admin", "admin"],
      },
    };

    const config = notificationMap[type];

    if (config) {
      // Find admin/team user IDs that should receive the notification
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

      // Also notify the specific client if applicable
      if (data?.user_id && ["milestone_completed", "invoice_created", "deliverable_submitted"].includes(type)) {
        await supabase.from("notifications").insert({
          user_id: data.user_id,
          title: config.title,
          message: config.message,
          type: config.notifyType,
          link: config.link?.replace("/admin/", "/client-portal/") || null,
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: `Notified about ${type}`, notified: !!config }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Notification error:", error);
    return new Response(
      JSON.stringify({ error: "Notification failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
