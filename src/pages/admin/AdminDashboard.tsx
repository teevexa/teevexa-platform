import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, FolderKanban, Receipt, CalendarDays, Users, TrendingUp, CheckCircle, Clock, AlertTriangle, Plus, ListTodo } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";

const COLORS = {
  primary: "hsl(var(--primary))",
  accent: "hsl(var(--accent))",
  green: "#22c55e",
  yellow: "#eab308",
  red: "#ef4444",
  muted: "hsl(var(--muted-foreground))",
};

const STATUS_PIE_COLORS: Record<string, string> = {
  planning: COLORS.muted, "in-progress": COLORS.primary, review: COLORS.accent, completed: COLORS.green,
};
const TASK_PIE_COLORS: Record<string, string> = {
  todo: COLORS.muted, "in-progress": COLORS.yellow, done: COLORS.green,
};

const chartTooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};

const AdminDashboard = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isFullAdmin = role === "super_admin" || role === "admin";
  const isPM = role === "project_manager";

  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard", role],
    enabled: !!role,
    staleTime: 60_000,
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];

      const projectsRes = await supabase.from("client_projects").select("id, status, progress");
      const tasksRes = await supabase.from("project_tasks").select("status, due_date");
      const milestonesRes = await supabase.from("project_milestones").select("status, due_date").neq("status", "completed");

      let leads = 0, consultations = 0, users = 0, invoices = 0;
      let revenueByKES = 0, revenueByUSD = 0;
      let revenueData: { month: string; kes: number; usd: number }[] = [];
      let leadTrend: { month: string; leads: number; consultations: number }[] = [];
      let recentLeads: { id: string; full_name: string; project_type: string; created_at: string }[] = [];
      let overdueInvoices = 0;

      if (isFullAdmin || isPM) {
        const [leadsRes, consultsRes, invoicesRes, paidInvoices, leadsAll, consultsAll, recentLeadsRes] = await Promise.all([
          supabase.from("project_inquiries").select("id", { count: "exact", head: true }),
          supabase.from("consultation_bookings").select("id", { count: "exact", head: true }),
          supabase.from("invoices").select("id, status, amount, currency, due_date", { count: "exact" }),
          supabase.from("invoices").select("amount, currency, paid_at").eq("status", "paid"),
          supabase.from("project_inquiries").select("created_at"),
          supabase.from("consultation_bookings").select("created_at"),
          supabase.from("project_inquiries").select("id, full_name, project_type, created_at").order("created_at", { ascending: false }).limit(5),
        ]);

        leads = leadsRes.count || 0;
        consultations = consultsRes.count || 0;
        invoices = invoicesRes.count || 0;

        // Revenue separated by currency — no cross-currency summing
        (paidInvoices.data || []).forEach((inv) => {
          const amt = Number(inv.amount);
          if ((inv.currency || "KES").toUpperCase() === "USD") revenueByUSD += amt;
          else revenueByKES += amt;
        });

        overdueInvoices = (invoicesRes.data || []).filter(
          (i) => i.status !== "paid" && i.due_date && i.due_date < today
        ).length;

        // Revenue trend by month — track KES and USD separately
        const monthlyKES: Record<string, number> = {};
        const monthlyUSD: Record<string, number> = {};
        (paidInvoices.data || []).forEach((inv) => {
          if (!inv.paid_at) return;
          const m = new Date(inv.paid_at).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
          if ((inv.currency || "KES").toUpperCase() === "USD") {
            monthlyUSD[m] = (monthlyUSD[m] || 0) + Number(inv.amount);
          } else {
            monthlyKES[m] = (monthlyKES[m] || 0) + Number(inv.amount);
          }
        });
        const allMonths = Array.from(new Set([...Object.keys(monthlyKES), ...Object.keys(monthlyUSD)])).sort();
        revenueData = allMonths.slice(-6).map((month) => ({
          month, kes: monthlyKES[month] || 0, usd: monthlyUSD[month] || 0,
        }));

        // Lead trend
        const leadMonths: Record<string, { leads: number; consultations: number }> = {};
        (leadsAll.data || []).forEach((l) => {
          const m = new Date(l.created_at).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
          if (!leadMonths[m]) leadMonths[m] = { leads: 0, consultations: 0 };
          leadMonths[m].leads++;
        });
        (consultsAll.data || []).forEach((c) => {
          const m = new Date(c.created_at).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
          if (!leadMonths[m]) leadMonths[m] = { leads: 0, consultations: 0 };
          leadMonths[m].consultations++;
        });
        leadTrend = Object.entries(leadMonths).map(([month, d]) => ({ month, ...d })).slice(-6);
        recentLeads = recentLeadsRes.data || [];
      }

      if (isFullAdmin) {
        const usersRes = await supabase.from("profiles").select("id", { count: "exact", head: true });
        users = usersRes.count || 0;
      }

      const statusCounts: Record<string, number> = {};
      (projectsRes.data || []).forEach((p) => { statusCounts[p.status] = (statusCounts[p.status] || 0) + 1; });
      const projectStatusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

      const tCounts: Record<string, number> = {};
      let overdueTasks = 0;
      (tasksRes.data || []).forEach((t) => {
        tCounts[t.status] = (tCounts[t.status] || 0) + 1;
        if (t.status !== "done" && t.due_date && t.due_date < today) overdueTasks++;
      });
      const taskStats = Object.entries(tCounts).map(([name, value]) => ({ name, value }));
      const overdueMilestones = (milestonesRes.data || []).filter((m) => m.due_date && m.due_date < today).length;

      return {
        stats: { leads, projects: projectsRes.count || 0, invoices, consultations, users, revenueByKES, revenueByUSD },
        projectStatusData, revenueData, leadTrend, taskStats, recentLeads,
        overdueItems: { tasks: overdueTasks, milestones: overdueMilestones, invoices: overdueInvoices },
      };
    },
  });

  // Real-time: invalidate on new leads, milestones, invoices
  useEffect(() => {
    const channel = supabase
      .channel("admin-dashboard-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "project_inquiries" }, () =>
        queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "invoices" }, () =>
        queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "project_milestones" }, () =>
        queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] }))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const { stats, projectStatusData = [], revenueData = [], leadTrend = [], taskStats = [], recentLeads = [], overdueItems = { tasks: 0, milestones: 0, invoices: 0 } } = data || {};

  const statWidgets = [
    ...(isFullAdmin || isPM ? [{ label: "Total Leads", value: stats?.leads ?? "—", icon: Target, color: "text-primary" }] : []),
    { label: "Active Projects", value: stats?.projects ?? "—", icon: FolderKanban, color: "text-accent" },
    ...(isFullAdmin || isPM ? [
      { label: "Revenue (KES)", value: stats ? `KSh ${stats.revenueByKES.toLocaleString()}` : "—", icon: TrendingUp, color: "text-green-400" },
      ...(stats?.revenueByUSD ? [{ label: "Revenue (USD)", value: `$${stats.revenueByUSD.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-400" }] : []),
      { label: "Consultations", value: stats?.consultations ?? "—", icon: CalendarDays, color: "text-primary" },
      { label: "Invoices", value: stats?.invoices ?? "—", icon: Receipt, color: "text-accent" },
    ] : []),
    ...(isFullAdmin ? [{ label: "Users", value: stats?.users ?? "—", icon: Users, color: "text-primary" }] : []),
  ];

  const Skeleton = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />)}
      </div>
    </div>
  );

  if (isLoading) return <Skeleton />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl">
            {role === "developer" ? "Developer Dashboard" : role === "project_manager" ? "PM Dashboard" : "Admin Dashboard"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 capitalize">{role?.replace("_", " ")} view</p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate("/admin/tasks")} className="gap-1.5">
            <Plus size={14} /> New Task
          </Button>
          {(isFullAdmin || isPM) && (
            <Button size="sm" variant="outline" onClick={() => navigate("/admin/invoices")} className="gap-1.5">
              <Receipt size={14} /> New Invoice
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => navigate("/admin/projects")} className="gap-1.5">
            <FolderKanban size={14} /> New Project
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/admin/time-tracking")} className="gap-1.5">
            <Clock size={14} /> Log Time
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statWidgets.map((w) => (
          <Card key={w.label} className="glass">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{w.label}</CardTitle>
              <w.icon size={18} className={w.color} />
            </CardHeader>
            <CardContent><p className="text-3xl font-display font-bold">{w.value}</p></CardContent>
          </Card>
        ))}
      </div>

      {/* Overdue Alerts */}
      {(overdueItems.tasks > 0 || overdueItems.milestones > 0 || overdueItems.invoices > 0) && (
        <div className="flex flex-wrap gap-3">
          {overdueItems.tasks > 0 && (
            <button onClick={() => navigate("/admin/tasks")} className="focus:outline-none">
              <Badge variant="outline" className="gap-1.5 border-red-500/30 text-red-400 py-1.5 px-3 hover:bg-red-500/10 cursor-pointer transition-colors">
                <AlertTriangle size={14} /> {overdueItems.tasks} Overdue Tasks
              </Badge>
            </button>
          )}
          {overdueItems.milestones > 0 && (
            <button onClick={() => navigate("/admin/milestones")} className="focus:outline-none">
              <Badge variant="outline" className="gap-1.5 border-yellow-500/30 text-yellow-400 py-1.5 px-3 hover:bg-yellow-500/10 cursor-pointer transition-colors">
                <Clock size={14} /> {overdueItems.milestones} Overdue Milestones
              </Badge>
            </button>
          )}
          {overdueItems.invoices > 0 && (
            <button onClick={() => navigate("/admin/invoices")} className="focus:outline-none">
              <Badge variant="outline" className="gap-1.5 border-red-500/30 text-red-400 py-1.5 px-3 hover:bg-red-500/10 cursor-pointer transition-colors">
                <Receipt size={14} /> {overdueItems.invoices} Overdue Invoices
              </Badge>
            </button>
          )}
        </div>
      )}

      {/* Charts Row 1 */}
      {(isFullAdmin || isPM) && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="glass">
            <CardHeader><CardTitle className="text-lg">Revenue Trend</CardTitle></CardHeader>
            <CardContent>
              {revenueData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No revenue data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={revenueData}>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis yAxisId="kes" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <YAxis yAxisId="usd" orientation="right" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number, name: string) => [
                      name === "kes" ? `KSh ${v.toLocaleString()}` : `$${v.toLocaleString()}`,
                      name === "kes" ? "KES Revenue" : "USD Revenue",
                    ]} />
                    <Legend formatter={(val) => <span className="text-xs">{val === "kes" ? "KES" : "USD"}</span>} />
                    <defs>
                      <linearGradient id="kesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.green} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="usdGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area yAxisId="kes" type="monotone" dataKey="kes" stroke={COLORS.green} fill="url(#kesGrad)" strokeWidth={2} />
                    <Area yAxisId="usd" type="monotone" dataKey="usd" stroke={COLORS.primary} fill="url(#usdGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader><CardTitle className="text-lg">Leads & Consultations</CardTitle></CardHeader>
            <CardContent>
              {leadTrend.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={leadTrend}>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Legend formatter={(val) => <span className="text-xs capitalize">{val}</span>} />
                    <Line type="monotone" dataKey="leads" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="consultations" stroke={COLORS.accent} strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="glass">
          <CardHeader><CardTitle className="text-lg">Project Status</CardTitle></CardHeader>
          <CardContent>
            {projectStatusData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No projects</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={projectStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value">
                    {projectStatusData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_PIE_COLORS[entry.name] || COLORS.muted} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend formatter={(val) => <span className="text-xs capitalize">{val}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader><CardTitle className="text-lg">Task Distribution</CardTitle></CardHeader>
          <CardContent>
            {taskStats.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No tasks</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={taskStats} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value">
                    {taskStats.map((entry) => (
                      <Cell key={entry.name} fill={TASK_PIE_COLORS[entry.name] || COLORS.muted} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend formatter={(val) => <span className="text-xs capitalize">{val}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {(isFullAdmin || isPM) && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Recent Leads
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate("/admin/leads")}>View all</Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentLeads.length === 0 ? (
                <p className="text-sm text-muted-foreground">No leads yet</p>
              ) : recentLeads.map((l) => (
                <div key={l.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{l.full_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{l.project_type}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground/60">
                    {new Date(l.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
