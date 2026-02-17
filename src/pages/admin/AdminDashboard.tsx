import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, FolderKanban, Receipt, CalendarDays, Users, TrendingUp } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ leads: 0, projects: 0, invoices: 0, consultations: 0, users: 0, revenue: 0 });

  useEffect(() => {
    const load = async () => {
      const [leads, projects, invoices, consults, users, paidInvoices] = await Promise.all([
        supabase.from("project_inquiries").select("id", { count: "exact", head: true }),
        supabase.from("client_projects").select("id", { count: "exact", head: true }),
        supabase.from("invoices").select("id", { count: "exact", head: true }),
        supabase.from("consultation_bookings").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("invoices").select("amount").eq("status", "paid"),
      ]);
      const revenue = (paidInvoices.data || []).reduce((sum, i) => sum + Number(i.amount), 0);
      setStats({
        leads: leads.count || 0, projects: projects.count || 0,
        invoices: invoices.count || 0, consultations: consults.count || 0,
        users: users.count || 0, revenue,
      });
    };
    load();
  }, []);

  const widgets = [
    { label: "Total Leads", value: stats.leads, icon: Target, color: "text-primary" },
    { label: "Active Projects", value: stats.projects, icon: FolderKanban, color: "text-accent" },
    { label: "Revenue (NGN)", value: stats.revenue.toLocaleString(), icon: TrendingUp, color: "text-green-400" },
    { label: "Consultations", value: stats.consultations, icon: CalendarDays, color: "text-primary" },
    { label: "Invoices", value: stats.invoices, icon: Receipt, color: "text-accent" },
    { label: "Users", value: stats.users, icon: Users, color: "text-primary" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="font-display font-bold text-2xl">Admin Dashboard</h1>
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
