import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, FolderKanban, Receipt, CalendarDays, Users, TrendingUp } from "lucide-react";

const AdminDashboard = () => {
  const { role } = useAuth();
  const [stats, setStats] = useState({ leads: 0, projects: 0, invoices: 0, consultations: 0, users: 0, revenue: 0 });

  useEffect(() => {
    const load = async () => {
      const isFullAdmin = role === "super_admin" || role === "admin";
      const isPM = role === "project_manager";

      // All roles can see projects
      const projectsRes = await supabase.from("client_projects").select("id", { count: "exact", head: true });

      let leads = 0, consultations = 0, users = 0, invoices = 0, revenue = 0;

      if (isFullAdmin || isPM) {
        const [leadsRes, consultsRes, invoicesRes, paidInvoices] = await Promise.all([
          supabase.from("project_inquiries").select("id", { count: "exact", head: true }),
          supabase.from("consultation_bookings").select("id", { count: "exact", head: true }),
          supabase.from("invoices").select("id", { count: "exact", head: true }),
          supabase.from("invoices").select("amount").eq("status", "paid"),
        ]);
        leads = leadsRes.count || 0;
        consultations = consultsRes.count || 0;
        invoices = invoicesRes.count || 0;
        revenue = (paidInvoices.data || []).reduce((sum, i) => sum + Number(i.amount), 0);
      }

      if (isFullAdmin) {
        const usersRes = await supabase.from("profiles").select("id", { count: "exact", head: true });
        users = usersRes.count || 0;
      }

      setStats({
        leads,
        projects: projectsRes.count || 0,
        invoices,
        consultations,
        users,
        revenue,
      });
    };
    if (role) load();
  }, [role]);

  const isFullAdmin = role === "super_admin" || role === "admin";
  const isPM = role === "project_manager";

  const widgets = [
    ...(isFullAdmin || isPM ? [{ label: "Total Leads", value: stats.leads, icon: Target, color: "text-primary" }] : []),
    { label: "Active Projects", value: stats.projects, icon: FolderKanban, color: "text-accent" },
    ...(isFullAdmin || isPM ? [
      { label: "Revenue (NGN)", value: stats.revenue.toLocaleString(), icon: TrendingUp, color: "text-green-400" },
      { label: "Consultations", value: stats.consultations, icon: CalendarDays, color: "text-primary" },
      { label: "Invoices", value: stats.invoices, icon: Receipt, color: "text-accent" },
    ] : []),
    ...(isFullAdmin ? [{ label: "Users", value: stats.users, icon: Users, color: "text-primary" }] : []),
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl">
          {role === "developer" ? "Developer Dashboard" : role === "project_manager" ? "PM Dashboard" : "Admin Dashboard"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1 capitalize">{role?.replace("_", " ")} view</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {widgets.map((w) => (
          <Card key={w.label} className="glass">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{w.label}</CardTitle>
              <w.icon size={18} className={w.color} />
            </CardHeader>
            <CardContent><p className="text-3xl font-display font-bold">{w.value}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
