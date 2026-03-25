import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, FolderKanban, Receipt, CalendarDays, Users, TrendingUp, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
} from "recharts";

const COLORS = {
  primary: "hsl(var(--primary))",
  accent: "hsl(var(--accent))",
  green: "#22c55e",
  yellow: "#eab308",
  red: "#ef4444",
  muted: "hsl(var(--muted-foreground))",
};

const AdminDashboard = () => {
  const { role } = useAuth();
  const isFullAdmin = role === "super_admin" || role === "admin";
  const isPM = role === "project_manager";

  const [stats, setStats] = useState({ leads: 0, projects: 0, invoices: 0, consultations: 0, users: 0, revenue: 0 });
  const [projectStatusData, setProjectStatusData] = useState<{ name: string; value: number }[]>([]);
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number }[]>([]);
  const [leadTrend, setLeadTrend] = useState<{ month: string; leads: number; consultations: number }[]>([]);
  const [taskStats, setTaskStats] = useState<{ name: string; value: number }[]>([]);
  const [recentLeads, setRecentLeads] = useState<{ id: string; full_name: string; project_type: string; created_at: string }[]>([]);
  const [overdueItems, setOverdueItems] = useState<{ tasks: number; milestones: number; invoices: number }>({ tasks: 0, milestones: 0, invoices: 0 });

  useEffect(() => {
    if (!role) return;
    const load = async () => {
      // Basic counts
      const projectsRes = await supabase.from("client_projects").select("id, status, progress", { count: "exact" });
      let leads = 0, consultations = 0, users = 0, invoices = 0, revenue = 0;

      if (isFullAdmin || isPM) {
        const [leadsRes, consultsRes, invoicesRes, paidInvoices, leadsAll, consultsAll, recentLeadsRes] = await Promise.all([
          supabase.from("project_inquiries").select("id", { count: "exact", head: true }),
          supabase.from("consultation_bookings").select("id", { count: "exact", head: true }),
          supabase.from("invoices").select("id, status, amount, due_date", { count: "exact" }),
          supabase.from("invoices").select("amount, paid_at").eq("status", "paid"),
          supabase.from("project_inquiries").select("created_at"),
          supabase.from("consultation_bookings").select("created_at"),
          supabase.from("project_inquiries").select("id, full_name, project_type, created_at").order("created_at", { ascending: false }).limit(5),
        ]);
        leads = leadsRes.count || 0;
        consultations = consultsRes.count || 0;
        invoices = invoicesRes.count || 0;
        revenue = (paidInvoices.data || []).reduce((sum, i) => sum + Number(i.amount), 0);

        // Overdue invoices
        const now = new Date().toISOString().split("T")[0];
        const overdueInvoices = (invoicesRes.data || []).filter(
          (i) => i.status !== "paid" && i.due_date && i.due_date < now
        ).length;

        // Revenue by month (last 6 months)
        const monthlyRev: Record<string, number> = {};
        (paidInvoices.data || []).forEach((inv) => {
          if (inv.paid_at) {
            const m = new Date(inv.paid_at).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
            monthlyRev[m] = (monthlyRev[m] || 0) + Number(inv.amount);
          }
        });
        const revArr = Object.entries(monthlyRev).map(([month, rev]) => ({ month, revenue: rev }));
        setRevenueData(revArr.slice(-6));

        // Lead trend by month
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
        setLeadTrend(Object.entries(leadMonths).map(([month, d]) => ({ month, ...d })).slice(-6));
        setRecentLeads(recentLeadsRes.data || []);
        setOverdueItems((prev) => ({ ...prev, invoices: overdueInvoices }));
      }

      if (isFullAdmin) {
        const usersRes = await supabase.from("profiles").select("id", { count: "exact", head: true });
        users = usersRes.count || 0;
      }

      // Project status distribution
      const statusCounts: Record<string, number> = {};
      (projectsRes.data || []).forEach((p) => {
        statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
      });
      setProjectStatusData(Object.entries(statusCounts).map(([name, value]) => ({ name, value })));

      // Task stats
      const tasksRes = await supabase.from("project_tasks").select("status, due_date");
      const tCounts: Record<string, number> = {};
      let overdueTasks = 0;
      const today = new Date().toISOString().split("T")[0];
      (tasksRes.data || []).forEach((t) => {
        tCounts[t.status] = (tCounts[t.status] || 0) + 1;
        if (t.status !== "done" && t.due_date && t.due_date < today) overdueTasks++;
      });
      setTaskStats(Object.entries(tCounts).map(([name, value]) => ({ name, value })));

      // Overdue milestones
      const milestonesRes = await supabase.from("project_milestones").select("status, due_date").neq("status", "completed");
      const overdueMilestones = (milestonesRes.data || []).filter(
        (m) => m.due_date && m.due_date < today
      ).length;

      setOverdueItems((prev) => ({ ...prev, tasks: overdueTasks, milestones: overdueMilestones }));

      setStats({ leads, projects: projectsRes.count || 0, invoices, consultations, users, revenue });
    };
    load();
  }, [role, isFullAdmin, isPM]);

  const STATUS_PIE_COLORS: Record<string, string> = {
    planning: COLORS.muted,
    "in-progress": COLORS.primary,
    review: COLORS.accent,
    completed: COLORS.green,
  };

  const TASK_PIE_COLORS: Record<string, string> = {
    todo: COLORS.muted,
    "in-progress": COLORS.yellow,
    done: COLORS.green,
  };

  const statWidgets = [
    ...(isFullAdmin || isPM ? [{ label: "Total Leads", value: stats.leads, icon: Target, color: "text-primary" }] : []),
    { label: "Active Projects", value: stats.projects, icon: FolderKanban, color: "text-accent" },
    ...(isFullAdmin || isPM ? [
      { label: "Revenue (NGN)", value: `₦${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: "text-green-400" },
      { label: "Consultations", value: stats.consultations, icon: CalendarDays, color: "text-primary" },
      { label: "Invoices", value: stats.invoices, icon: Receipt, color: "text-accent" },
    ] : []),
    ...(isFullAdmin ? [{ label: "Users", value: stats.users, icon: Users, color: "text-primary" }] : []),
  ];

  const chartTooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 8,
    fontSize: 12,
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl">
          {role === "developer" ? "Developer Dashboard" : role === "project_manager" ? "PM Dashboard" : "Admin Dashboard"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1 capitalize">{role?.replace("_", " ")} view</p>
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
            <Badge variant="outline" className="gap-1.5 border-red-500/30 text-red-400 py-1.5 px-3">
              <AlertTriangle size={14} /> {overdueItems.tasks} Overdue Tasks
            </Badge>
          )}
          {overdueItems.milestones > 0 && (
            <Badge variant="outline" className="gap-1.5 border-yellow-500/30 text-yellow-400 py-1.5 px-3">
              <Clock size={14} /> {overdueItems.milestones} Overdue Milestones
            </Badge>
          )}
          {overdueItems.invoices > 0 && (
            <Badge variant="outline" className="gap-1.5 border-red-500/30 text-red-400 py-1.5 px-3">
              <Receipt size={14} /> {overdueItems.invoices} Overdue Invoices
            </Badge>
          )}
        </div>
      )}

      {/* Charts Row 1: Revenue + Lead Trends */}
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
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => [`₦${v.toLocaleString()}`, "Revenue"]} />
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.green} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="revenue" stroke={COLORS.green} fill="url(#revGrad)" strokeWidth={2} />
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

      {/* Charts Row 2: Project Status + Task Distribution */}
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

        {/* Recent Leads */}
        {(isFullAdmin || isPM) && (
          <Card className="glass">
            <CardHeader><CardTitle className="text-lg">Recent Leads</CardTitle></CardHeader>
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
