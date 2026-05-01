import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { logAudit } from "@/lib/audit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Clock, Calendar, User, BarChart3, Trash2, Pencil } from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

interface Entry {
  id: string; project_id: string; task_id: string | null; user_id: string;
  hours: number; date: string; description: string | null;
}

const emptyForm = () => ({ project_id: "", task_id: "", hours: "", date: format(new Date(), "yyyy-MM-dd"), description: "" });

const AdminTimeTracking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [filterProject, setFilterProject] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-time-tracking"],
    queryFn: async () => {
      const [entriesRes, projectsRes, tasksRes, profilesRes] = await Promise.all([
        supabase.from("time_entries").select("*").order("date", { ascending: false }),
        supabase.from("client_projects").select("id, title"),
        supabase.from("project_tasks").select("id, title, project_id"),
        supabase.from("profiles").select("user_id, display_name"),
      ]);
      return {
        entries: (entriesRes.data || []) as Entry[],
        projects: projectsRes.data || [],
        tasks: tasksRes.data || [],
        profiles: profilesRes.data || [],
      };
    },
    staleTime: 30_000,
  });

  const entries = data?.entries ?? [];
  const projects = data?.projects ?? [];
  const tasks = data?.tasks ?? [];
  const profiles = data?.profiles ?? [];

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-time-tracking"] });

  const getProjectTitle = (id: string) => projects.find((p) => p.id === id)?.title || "Unknown";
  const getTaskTitle = (id: string | null) => id ? (tasks.find((t) => t.id === id)?.title || "—") : "—";
  const getUserName = (id: string) => profiles.find((p) => p.user_id === id)?.display_name || "Unknown";

  const projectTasks = tasks.filter((t) => t.project_id === form.project_id);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (entry: Entry) => {
    setEditingId(entry.id);
    setForm({
      project_id: entry.project_id,
      task_id: entry.task_id || "",
      hours: String(entry.hours),
      date: entry.date,
      description: entry.description || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.project_id || !form.hours || !form.date) {
      toast({ title: "Missing fields", description: "Project, hours and date are required.", variant: "destructive" }); return;
    }
    const payload = {
      project_id: form.project_id,
      task_id: form.task_id || null,
      hours: parseFloat(form.hours),
      date: form.date,
      description: form.description || null,
    };

    if (editingId) {
      const { error } = await supabase.from("time_entries").update(payload).eq("id", editingId);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      await logAudit({ action: "update", entity_type: "time_entry", entity_id: editingId, details: { hours: form.hours, date: form.date } });
      toast({ title: "Entry updated" });
    } else {
      const { data: created, error } = await supabase.from("time_entries").insert({ ...payload, user_id: user!.id }).select("id").single();
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      await logAudit({ action: "created", entity_type: "time_entry", entity_id: created?.id, details: { hours: form.hours, date: form.date } });
      toast({ title: "Time logged successfully" });
    }

    setDialogOpen(false);
    setForm(emptyForm());
    setEditingId(null);
    refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this time entry?")) return;
    const { error } = await supabase.from("time_entries").delete().eq("id", id);
    if (!error) {
      await logAudit({ action: "deleted", entity_type: "time_entry", entity_id: id });
      toast({ title: "Entry deleted" });
      refresh();
    }
  };

  const filteredEntries = entries.filter((e) => {
    if (filterProject !== "all" && e.project_id !== filterProject) return false;
    if (filterPeriod === "week") {
      const start = startOfWeek(new Date(), { weekStartsOn: 1 });
      const end = endOfWeek(new Date(), { weekStartsOn: 1 });
      const d = parseISO(e.date);
      if (d < start || d > end) return false;
    } else if (filterPeriod === "month") {
      const start = startOfMonth(new Date());
      const end = endOfMonth(new Date());
      const d = parseISO(e.date);
      if (d < start || d > end) return false;
    }
    return true;
  });

  const totalHours = filteredEntries.reduce((sum, e) => sum + Number(e.hours), 0);
  const hoursByProject = projects.map((p) => ({
    name: p.title.length > 15 ? p.title.slice(0, 15) + "…" : p.title,
    hours: filteredEntries.filter((e) => e.project_id === p.id).reduce((s, e) => s + Number(e.hours), 0),
  })).filter((p) => p.hours > 0);

  const hoursByUser = Array.from(new Set(filteredEntries.map((e) => e.user_id))).map((uid) => ({
    name: getUserName(uid),
    hours: filteredEntries.filter((e) => e.user_id === uid).reduce((s, e) => s + Number(e.hours), 0),
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Time Tracking</h1>
          <p className="text-muted-foreground text-sm">Log and monitor hours per task and project</p>
        </div>
        <Button onClick={openCreate}><Plus size={16} className="mr-1" /> Log Time</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass"><CardContent className="pt-6 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10"><Clock className="text-primary" size={24} /></div>
          <div><p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p><p className="text-sm text-muted-foreground">Total Hours</p></div>
        </CardContent></Card>
        <Card className="glass"><CardContent className="pt-6 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10"><Calendar className="text-primary" size={24} /></div>
          <div><p className="text-2xl font-bold">{filteredEntries.length}</p><p className="text-sm text-muted-foreground">Entries</p></div>
        </CardContent></Card>
        <Card className="glass"><CardContent className="pt-6 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10"><User className="text-primary" size={24} /></div>
          <div><p className="text-2xl font-bold">{hoursByUser.length}</p><p className="text-sm text-muted-foreground">Team Members</p></div>
        </CardContent></Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 size={16} /> Hours by Project</CardTitle></CardHeader>
          <CardContent>
            {hoursByProject.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={hoursByProject}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>}
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><User size={16} /> Hours by Team Member</CardTitle></CardHeader>
          <CardContent>
            {hoursByUser.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={hoursByUser} cx="50%" cy="50%" outerRadius={90} dataKey="hours" nameKey="name" label={({ name, hours }) => `${name}: ${hours}h`}>
                    {hoursByUser.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={filterProject} onValueChange={setFilterProject}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Projects" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterPeriod} onValueChange={setFilterPeriod}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="glass">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-10 rounded bg-muted animate-pulse" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead><TableHead>Project</TableHead><TableHead>Task</TableHead>
                  <TableHead>Team Member</TableHead><TableHead>Hours</TableHead><TableHead>Description</TableHead><TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No time entries found</TableCell></TableRow>
                ) : filteredEntries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="whitespace-nowrap">{format(parseISO(e.date), "MMM d, yyyy")}</TableCell>
                    <TableCell><Badge variant="outline">{getProjectTitle(e.project_id)}</Badge></TableCell>
                    <TableCell className="text-sm">{getTaskTitle(e.task_id)}</TableCell>
                    <TableCell className="text-sm">{getUserName(e.user_id)}</TableCell>
                    <TableCell><span className="font-semibold">{Number(e.hours).toFixed(1)}h</span></TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{e.description || "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {e.user_id === user?.id && (
                          <>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(e)}><Pencil size={13} /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(e.id)}><Trash2 size={13} /></Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setDialogOpen(false); setEditingId(null); setForm(emptyForm()); } }}>
        <DialogContent className="glass">
          <DialogHeader><DialogTitle>{editingId ? "Edit Time Entry" : "Log Time Entry"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Select value={form.project_id} onValueChange={(v) => setForm((f) => ({ ...f, project_id: v, task_id: "" }))}>
              <SelectTrigger><SelectValue placeholder="Select Project" /></SelectTrigger>
              <SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
            </Select>
            {projectTasks.length > 0 && (
              <Select value={form.task_id} onValueChange={(v) => setForm((f) => ({ ...f, task_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select Task (optional)" /></SelectTrigger>
                <SelectContent>{projectTasks.map((t) => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}</SelectContent>
              </Select>
            )}
            <div className="grid grid-cols-2 gap-4">
              <Input type="number" step="0.25" min="0.25" placeholder="Hours" value={form.hours} onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))} />
              <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </div>
            <Textarea placeholder="What did you work on?" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            <Button onClick={handleSubmit} className="w-full glow-primary">{editingId ? "Update Entry" : "Save Entry"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTimeTracking;
