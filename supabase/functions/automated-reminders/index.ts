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

    const now = new Date().toISOString().split("T")[0];
    const results = { overdueTasks: 0, overdueInvoices: 0, upcomingMilestones: 0 };

    // 1. Find overdue tasks (due_date < today, status not 'done')
    const { data: overdueTasks } = await supabase
      .from("project_tasks")
      .select("id, title, due_date, assigned_to, project_id")
      .lt("due_date", now)
      .neq("status", "done")
      .not("due_date", "is", null);

    if (overdueTasks && overdueTasks.length > 0) {
      for (const task of overdueTasks) {
        // Notify assigned user
        if (task.assigned_to) {
          // Check if we already sent a reminder today
          const { data: existing } = await supabase
            .from("notifications")
            .select("id")
            .eq("user_id", task.assigned_to)
            .eq("title", "Task Overdue")
            .like("message", `%${task.title}%`)
            .gte("created_at", `${now}T00:00:00`)
            .limit(1);

          if (!existing || existing.length === 0) {
            await supabase.from("notifications").insert({
              user_id: task.assigned_to,
              title: "Task Overdue",
              message: `Task "${task.title}" was due on ${task.due_date}. Please update its status.`,
              type: "info",
              link: `/client-portal/projects/${task.project_id}`,
            });
            results.overdueTasks++;
          }
        }

        // Notify admins via the notify-admin pattern
        const { data: admins } = await supabase
          .from("user_roles")
          .select("user_id")
          .in("role", ["super_admin", "admin", "project_manager"]);

        if (admins) {
          for (const admin of admins) {
            const { data: existing } = await supabase
              .from("notifications")
              .select("id")
              .eq("user_id", admin.user_id)
              .eq("title", "Task Overdue")
              .like("message", `%${task.title}%`)
              .gte("created_at", `${now}T00:00:00`)
              .limit(1);

            if (!existing || existing.length === 0) {
              await supabase.from("notifications").insert({
                user_id: admin.user_id,
                title: "Task Overdue",
                message: `Task "${task.title}" was due on ${task.due_date}.`,
                type: "info",
                link: `/admin/tasks`,
              });
            }
          }
        }
      }
    }

    // 2. Find overdue invoices (due_date < today, status not 'paid')
    const { data: overdueInvoices } = await supabase
      .from("invoices")
      .select("id, invoice_number, amount, due_date, user_id")
      .lt("due_date", now)
      .neq("status", "paid")
      .not("due_date", "is", null);

    if (overdueInvoices && overdueInvoices.length > 0) {
      for (const invoice of overdueInvoices) {
        // Notify the client
        const { data: existing } = await supabase
          .from("notifications")
          .select("id")
          .eq("user_id", invoice.user_id)
          .eq("title", "Invoice Overdue")
          .like("message", `%${invoice.invoice_number}%`)
          .gte("created_at", `${now}T00:00:00`)
          .limit(1);

        if (!existing || existing.length === 0) {
          await supabase.from("notifications").insert({
            user_id: invoice.user_id,
            title: "Invoice Overdue",
            message: `Invoice #${invoice.invoice_number} for $${invoice.amount} was due on ${invoice.due_date}. Please make payment.`,
            type: "invoice",
            link: "/client-portal/invoices",
          });
          results.overdueInvoices++;
        }

        // Notify admins
        const { data: admins } = await supabase
          .from("user_roles")
          .select("user_id")
          .in("role", ["super_admin", "admin"]);

        if (admins) {
          for (const admin of admins) {
            const { data: existing2 } = await supabase
              .from("notifications")
              .select("id")
              .eq("user_id", admin.user_id)
              .eq("title", "Invoice Overdue")
              .like("message", `%${invoice.invoice_number}%`)
              .gte("created_at", `${now}T00:00:00`)
              .limit(1);

            if (!existing2 || existing2.length === 0) {
              await supabase.from("notifications").insert({
                user_id: admin.user_id,
                title: "Invoice Overdue",
                message: `Invoice #${invoice.invoice_number} for $${invoice.amount} is overdue.`,
                type: "invoice",
                link: "/admin/invoices",
              });
            }
          }
        }
      }
    }

    // 3. Find upcoming milestones (due in next 3 days)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const futureDate = threeDaysFromNow.toISOString().split("T")[0];

    const { data: upcomingMilestones } = await supabase
      .from("project_milestones")
      .select("id, title, due_date, project_id")
      .gte("due_date", now)
      .lte("due_date", futureDate)
      .neq("status", "completed")
      .not("due_date", "is", null);

    if (upcomingMilestones && upcomingMilestones.length > 0) {
      const { data: admins } = await supabase
        .from("user_roles")
        .select("user_id")
        .in("role", ["super_admin", "admin", "project_manager"]);

      for (const milestone of upcomingMilestones) {
        if (admins) {
          for (const admin of admins) {
            const { data: existing } = await supabase
              .from("notifications")
              .select("id")
              .eq("user_id", admin.user_id)
              .eq("title", "Milestone Approaching")
              .like("message", `%${milestone.title}%`)
              .gte("created_at", `${now}T00:00:00`)
              .limit(1);

            if (!existing || existing.length === 0) {
              await supabase.from("notifications").insert({
                user_id: admin.user_id,
                title: "Milestone Approaching",
                message: `Milestone "${milestone.title}" is due on ${milestone.due_date}.`,
                type: "milestone",
                link: `/admin/projects/${milestone.project_id}`,
              });
              results.upcomingMilestones++;
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Reminder error:", error);
    return new Response(
      JSON.stringify({ error: "Reminders failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
