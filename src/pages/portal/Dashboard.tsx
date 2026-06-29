import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderKanban, Receipt, MessageSquare, Download, CheckCircle, Clock, AlertCircle, FileText, Loader2, Users } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { DashboardSkeleton } from "@/components/portal/PortalSkeleton";
import PortalError from "@/components/portal/PortalError";
import { formatCurrency } from "@/lib/format";

const STATUS_COLORS: Record<string, string> = {
  planning: "hsl(var(--muted-foreground))",
  "in-progress": "hsl(var(--primary))",
  review: "hsl(var(--accent))",
  completed: "#22c55e",
};

const INVOICE_COLORS: Record<string, string> = {
  paid: "#22c55e",
  pending: "#eab308",
  overdue: "#ef4444",
  sent: "hsl(var(--primary))",
};

const statusBadge: Record<string, string> = {
  planning: "bg-muted text-muted-foreground",
  "in-progress": "bg-primary/20 text-primary",
  review: "bg-accent/20 text-accent",
  completed: "bg-green-500/20 text-green-400",
};

const Dashboard = () => {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    staleTime: Infinity,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const uid = user!.id;
      const [profileRes, projectsRes, invoicesRes] = await Promise.all([
        supabase.from("profiles").select("display_name").eq("user_id", uid).single(),
        supabase.from("client_projects").select("id, title, status, progress, budget")
          .eq("user_id", uid).order("created_at", { ascending: false }).limit(10),
        supabase.from("invoices").select("id, invoice_number, amount, currency, status, pdf_url")
          .eq("user_id", uid).order("created_at", { ascending: false }).limit(20),
      ]);

      const projects = projectsRes.data || [];
      const invoices = invoicesRes.data || [];
      const projectIds = projects.map((p) => p.id);

      const [milestonesRes, msgCount, assignmentsRes] = await Promise.all([
        projectIds.length > 0
          ? supabase.from("project_milestones").select("id, title, status, due_date, project_id")
              .in("status", ["review", "pending", "in-progress"])
              .in("project_id", projectIds).order("due_date").limit(5)
          : { data: [] },
        projectIds.length > 0
          ? supabase.from("messages").select("id", { count: "exact", head: true }).in("project_id", projectIds)
          : { count: 0 },
        projectIds.length > 0
          ? supabase.from("project_assignments").select("user_id, role").in("project_id", projectIds)
          : { data: [] },
      ]);

      // Deduplicate assigned team members and fetch their profiles
      const teamUserIds = [...new Set((assignmentsRes.data || []).map((a: { user_id: string; role: string }) => a.user_id))];
      const teamRoles = Object.fromEntries((assignmentsRes.data || []).map((a: { user_id: string; role: string }) => [a.user_id, a.role]));
      const profilesRes = teamUserIds.length > 0
        ? await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", teamUserIds)
        : { data: [] };
      const team = (profilesRes.data || []).map((p) => ({ ...p, role: teamRoles[p.user_id] || "team" }));

      const unpaidInvoices = invoices.filter((i) => i.status !== "paid");
      return {
        profile: profileRes.data,
        projects,
        milestones: milestonesRes.data || [],
        invoices,
        unpaidInvoices,
        unpaidCount: unpaidInvoices.length,
        messageCount: msgCount.count || 0,
        team,
      };
    },
  });

  // Real-time: invalidate dashboard when milestones or invoices change
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "project_milestones" },
        () => queryClient.invalidateQueries({ queryKey: ["dashboard", user.id] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "invoices" },
        () => queryClient.invalidateQueries({ queryKey: ["dashboard", user.id] }))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, queryClient]);

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <PortalError onRetry={refetch} />;
  if (!data) return null;

  const { profile, projects, milestones, invoices, unpaidInvoices, unpaidCount, messageCount, team = [] } = data;

  const [reportDownloading, setReportDownloading] = useState(false);

  const handleDownloadComplianceReport = async () => {
    setReportDownloading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const to = now.toISOString().slice(0, 10);
      const fnUrl = `${supabaseUrl}/functions/v1/generate-compliance-report?from=${from}&to=${to}`;
      const res = await fetch(fnUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Report generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Teevexa-Compliance-Report-${from}_${to}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Could not generate the compliance report. Please try again.");
    } finally {
      setReportDownloading(false);
    }
  };

  const widgets = [
    { label: "Active Projects", value: projects.length, icon: FolderKanban, color: "text-primary", href: "/client-portal/projects" },
    { label: "Total Invoices", value: invoices.length, icon: Receipt, color: "text-accent", href: "/client-portal/invoices" },
    { label: "Messages", value: messageCount, icon: MessageSquare, color: "text-primary", href: "/client-portal/messages" },
    { label: "Unpaid Invoices", value: unpaidCount, icon: AlertCircle, color: unpaidCount > 0 ? "text-destructive" : "text-muted-foreground", href: "/client-portal/invoices" },
  ];

  const projectStatusData = Object.entries(
    projects.reduce<Record<string, number>>((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const projectProgressData = projects.slice(0, 6).map((p) => ({
    name: p.title.length > 15 ? p.title.slice(0, 15) + "…" : p.title,
    progress: p.progress,
  }));

  const invoiceStatusData = Object.entries(
    invoices.reduce<Record<string, number>>((acc, i) => { acc[i.status] = (acc[i.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl">
          Welcome{profile?.display_name ? `, ${profile.display_name}` : ""}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Here's your project overview</p>
      </div>

      {/* Stat Widgets */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {widgets.map((w) => (
          <Link key={w.label} to={w.href}>
            <Card className={`glass hover:border-primary/40 transition-all ${w.label === "Unpaid Invoices" && unpaidCount > 0 ? "border-destructive/30" : ""}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{w.label}</CardTitle>
                <w.icon size={18} className={w.color} />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-display font-bold">{w.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="glass">
          <CardHeader><CardTitle className="text-lg">Project Status</CardTitle></CardHeader>
          <CardContent>
            {projectStatusData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No projects yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={projectStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {projectStatusData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "hsl(var(--muted))"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend formatter={(val) => <span className="text-xs capitalize">{val}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader><CardTitle className="text-lg">Progress Overview</CardTitle></CardHeader>
          <CardContent>
            {projectProgressData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No projects yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={projectProgressData} layout="vertical" margin={{ left: 0, right: 16 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(val: number) => [`${val}%`, "Progress"]} />
                  <Bar dataKey="progress" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader><CardTitle className="text-lg">Invoice Breakdown</CardTitle></CardHeader>
          <CardContent>
            {invoiceStatusData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No invoices yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={invoiceStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {invoiceStatusData.map((entry) => (
                      <Cell key={entry.name} fill={INVOICE_COLORS[entry.name] || "hsl(var(--muted))"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(val: number) => [`${val} invoices`, ""]} />
                  <Legend formatter={(val) => <span className="text-xs capitalize">{val}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Projects & Milestones */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Active Projects</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link to="/client-portal/projects">View All</Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active projects yet.</p>
            ) : projects.slice(0, 5).map((p) => (
              <Link key={p.id} to={`/client-portal/projects/${p.id}`} className="block group">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">{p.title}</span>
                  <Badge className={statusBadge[p.status] || ""}>{p.status}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={p.progress} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground w-8 text-right">{p.progress}%</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader><CardTitle className="text-lg">Milestones Awaiting Action</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {milestones.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending milestones.</p>
            ) : milestones.map((m) => (
              <div key={m.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {m.status === "review"
                    ? <CheckCircle size={16} className="text-accent" />
                    : <Clock size={16} className="text-muted-foreground" />}
                  <span className="text-sm">{m.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  {m.due_date && <span className="text-xs text-muted-foreground">{new Date(m.due_date).toLocaleDateString()}</span>}
                  <Badge variant="outline" className="text-xs">{m.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Outstanding Invoices */}
      <Card className="glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Outstanding Invoices</CardTitle>
          <Button variant="ghost" size="sm" asChild><Link to="/client-portal/invoices">View All</Link></Button>
        </CardHeader>
        <CardContent>
          {unpaidInvoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">All invoices are paid. 🎉</p>
          ) : (
            <div className="space-y-2">
              {unpaidInvoices.map((inv) => (
                <div key={inv.id} className={`flex items-center justify-between py-2 border-b border-border/50 last:border-0 pl-2 ${inv.status === "overdue" ? "border-l-2 border-l-destructive" : ""}`}>
                  <div>
                    <p className="text-sm font-medium">{inv.invoice_number}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(Number(inv.amount), inv.currency)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={inv.status === "overdue" ? "bg-destructive/20 text-destructive" : "bg-yellow-500/20 text-yellow-400"}>
                      {inv.status}
                    </Badge>
                    {inv.pdf_url && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={inv.pdf_url} target="_blank" rel="noopener noreferrer"><Download size={14} /></a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Your Team */}
      {team.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users size={18} className="text-primary" /> Your Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.map((member) => (
                <div key={member.user_id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.display_name || ""} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-semibold text-primary">
                        {(member.display_name || "?")[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{member.display_name || "Team Member"}</p>
                    <p className="text-xs text-muted-foreground capitalize">{member.role.replace(/_/g, " ")}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trace Compliance Report */}
      <Card className="glass border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText size={16} className="text-primary" />
            Supply Chain Compliance Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-4">
            Download a PDF compliance report for this billing period covering all supply chain events, blockchain verification status, and GPS-tagged locations. Suitable for EUDR, ISO 22005, and customs documentation.
          </p>
          <Button
            onClick={handleDownloadComplianceReport}
            disabled={reportDownloading}
            className="w-full gap-2 glow-primary"
          >
            {reportDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {reportDownloading ? "Generating Report…" : "Download Compliance Report (PDF)"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
