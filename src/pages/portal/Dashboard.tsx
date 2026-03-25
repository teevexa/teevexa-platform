import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderKanban, Receipt, MessageSquare, CalendarDays, Download, CheckCircle, Clock } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ProjectSummary { id: string; title: string; status: string; progress: number; budget: string | null; }
interface MilestoneSummary { id: string; title: string; status: string; due_date: string | null; project_id: string; }
interface InvoiceSummary { id: string; invoice_number: string; amount: number; currency: string; status: string; pdf_url: string | null; }

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

const Dashboard = () => {
  const [profile, setProfile] = useState<{ display_name: string | null } | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [milestones, setMilestones] = useState<MilestoneSummary[]>([]);
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [stats, setStats] = useState({ projects: 0, invoices: 0, messages: 0, unpaidAmount: 0 });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, projectsRes, milestonesRes, invoicesRes, msgCount] = await Promise.all([
        supabase.from("profiles").select("display_name").eq("user_id", user.id).single(),
        supabase.from("client_projects").select("id, title, status, progress, budget").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("project_milestones").select("id, title, status, due_date, project_id").in("status", ["review", "pending", "in-progress"]).order("due_date").limit(5),
        supabase.from("invoices").select("id, invoice_number, amount, currency, status, pdf_url").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
        supabase.from("messages").select("id", { count: "exact", head: true }),
      ]);

      setProfile(profileRes.data);
      setProjects(projectsRes.data || []);
      setMilestones(milestonesRes.data || []);
      setInvoices(invoicesRes.data || []);
      const unpaid = (invoicesRes.data || []).filter((i) => i.status !== "paid").reduce((sum, i) => sum + Number(i.amount), 0);
      setStats({
        projects: (projectsRes.data || []).length,
        invoices: (invoicesRes.data || []).length,
        messages: msgCount.count || 0,
        unpaidAmount: unpaid,
      });
    };
    load();
  }, []);

  const statusColor: Record<string, string> = {
    planning: "bg-muted text-muted-foreground",
    "in-progress": "bg-primary/20 text-primary",
    review: "bg-accent/20 text-accent",
    completed: "bg-green-500/20 text-green-400",
  };

  const widgets = [
    { label: "Active Projects", value: stats.projects, icon: FolderKanban, color: "text-primary", href: "/client-portal/projects" },
    { label: "Invoices", value: stats.invoices, icon: Receipt, color: "text-accent", href: "/client-portal/invoices" },
    { label: "Messages", value: stats.messages, icon: MessageSquare, color: "text-primary", href: "/client-portal/messages" },
    { label: "Outstanding (NGN)", value: stats.unpaidAmount.toLocaleString(), icon: CalendarDays, color: "text-accent", href: "/client-portal/invoices" },
  ];

  // Chart data
  const projectStatusData = Object.entries(
    projects.reduce<Record<string, number>>((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const projectProgressData = projects.slice(0, 6).map((p) => ({
    name: p.title.length > 15 ? p.title.slice(0, 15) + "…" : p.title,
    progress: p.progress,
  }));

  const invoiceStatusData = Object.entries(
    invoices.reduce<Record<string, number>>((acc, i) => {
      acc[i.status] = (acc[i.status] || 0) + Number(i.amount);
      return acc;
    }, {})
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
            <Card className="glass hover:border-primary/40 transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{w.label}</CardTitle>
                <w.icon size={18} className={w.color} />
              </CardHeader>
              <CardContent><p className="text-3xl font-display font-bold">{w.value}</p></CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Project Status Pie */}
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

        {/* Project Progress Bar */}
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

        {/* Invoice Breakdown */}
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
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(val: number) => [`₦${val.toLocaleString()}`, "Amount"]} />
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
              <Link key={p.id} to={`/client-portal/projects/${p.id}`} className="block">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{p.title}</span>
                  <Badge className={statusColor[p.status] || ""}>{p.status}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={p.progress} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground">{p.progress}%</span>
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
                  {m.status === "review" ? <CheckCircle size={16} className="text-accent" /> : <Clock size={16} className="text-muted-foreground" />}
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
          {invoices.filter((i) => i.status !== "paid").length === 0 ? (
            <p className="text-sm text-muted-foreground">All invoices are paid. 🎉</p>
          ) : (
            <div className="space-y-2">
              {invoices.filter((i) => i.status !== "paid").map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{inv.invoice_number}</p>
                    <p className="text-xs text-muted-foreground">{inv.currency} {Number(inv.amount).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-500/20 text-yellow-400">{inv.status}</Badge>
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
    </div>
  );
};

export default Dashboard;
