import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { logAudit } from "@/lib/audit";
import { Plus, ListTodo, Pencil, Trash2, Filter } from "lucide-react";

interface Task {
  id: string; title: string; description: string | null; status: string;
  priority: string; assigned_to: string | null; created_by: string | null;
  project_id: string; due_date: string | null; completed_at: string | null;
  created_at: string;
}
interface ProjectOption { id: string; title: string; }
interface UserOption { user_id: string; display_name: string | null; }

const statusOptions = ["todo", "in-progress", "in-review", "done"];
const priorityOptions = ["low", "medium", "high", "urgent"];

const statusColor: Record<string, string> = {
  todo: "bg-muted text-muted-foreground",
  "in-progress": "bg-primary/20 text-primary",
  "in-review": "bg-accent/20 text-accent",
  done: "bg-green-500/20 text-green-400",
};
const priorityColor: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-blue-500/20 text-blue-400",
  high: "bg-orange-500/20 text-orange-400",
  urgent: "bg-destructive/20 text-destructive",
};

const AdminTasks = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [teamMembers, setTeamMembers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [filterProject, setFilterProject] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [form, setForm] = useState({
    title: "", description: "", project_id: "", status: "todo",
    priority: "medium", assigned_to: "", due_date: "",
  });

  const load = async () => {
    const [tRes, pRes, uRes] = await Promise.all([
      supabase.from("project_tasks").select("*").order("created_at", { ascending: false }),
      supabase.from("client_projects").select("id, title"),
      supabase.from("profiles").select("user_id, display_name"),
    ]);
    setTasks(tRes.data as Task[] || []);
    setProjects(pRes.data || []);
    setTeamMembers(uRes.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const userName = (id: string | null) => {
    if (!id) return "Unassigned";
    return teamMembers.find((u) => u.user_id === id)?.display_name || id.slice(0, 8);
  };
  const projectName = (id: string) => projects.find((p) => p.id === id)?.title || "—";

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", description: "", project_id: "", status: "todo", priority: "medium", assigned_to: "", due_date: "" });
    setShowEditor(true);
  };
  const openEdit = (t: Task) => {
    setEditing(t.id);
    setForm({
      title: t.title, description: t.description || "", project_id: t.project_id,
      status: t.status, priority: t.priority, assigned_to: t.assigned_to || "", due_date: t.due_date || "",
    });
    setShowEditor(true);
  };

  const save = async () => {
    if (!form.title.trim() || !form.project_id) {
      toast({ title: "Title and project are required", variant: "destructive" }); return;
    }
    const user = (await supabase.auth.getUser()).data.user;
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      project_id: form.project_id,
      status: form.status,
      priority: form.priority,
      assigned_to: form.assigned_to || null,
      due_date: form.due_date || null,
      completed_at: form.status === "done" ? new Date().toISOString() : null,
      ...(editing ? {} : { created_by: user?.id }),
    };
    const { data, error } = editing
      ? await supabase.from("project_tasks").update(payload).eq("id", editing).select("id").single()
      : await supabase.from("project_tasks").insert(payload).select("id").single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    await logAudit({ action: editing ? "update" : "create", entity_type: "task", entity_id: data?.id, details: { title: form.title, project: projectName(form.project_id), assigned_to: userName(form.assigned_to || null) } });
    toast({ title: editing ? "Task updated" : "Task created" });
    setShowEditor(false); load();
  };

  const deleteTask = async (id: string, title: string) => {
    if (!confirm("Delete this task?")) return;
    await supabase.from("project_tasks").delete().eq("id", id);
    await logAudit({ action: "delete", entity_type: "task", entity_id: id, details: { title } });
    toast({ title: "Task deleted" }); load();
  };

  const filtered = tasks.filter((t) => {
    if (filterProject !== "all" && t.project_id !== filterProject) return false;
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    return true;
  });

  // Stats
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  const overdue = tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "done").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Task Management</h1>
        <Button onClick={openCreate}><Plus size={16} className="mr-1" /> New Task</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold">{total}</p><p className="text-xs text-muted-foreground">Total Tasks</p>
        </CardContent></Card>
        <Card className="glass"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-primary">{inProgress}</p><p className="text-xs text-muted-foreground">In Progress</p>
        </CardContent></Card>
        <Card className="glass"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-green-400">{done}</p><p className="text-xs text-muted-foreground">Completed</p>
        </CardContent></Card>
        <Card className="glass"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-destructive">{overdue}</p><p className="text-xs text-muted-foreground">Overdue</p>
        </CardContent></Card>
      </div>

      {total > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Overall Completion</span>
            <span className="text-xs font-medium">{total ? Math.round((done / total) * 100) : 0}%</span>
          </div>
          <Progress value={total ? (done / total) * 100 : 0} className="h-2" />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Filter size={16} className="text-muted-foreground" />
        <Select value={filterProject} onValueChange={setFilterProject}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All projects" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statusOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? <p className="text-muted-foreground">Loading...</p> : filtered.length === 0 ? (
        <Card className="glass"><CardContent className="py-12 text-center">
          <ListTodo className="mx-auto text-muted-foreground mb-4" size={48} />
          <p className="text-muted-foreground">No tasks found.</p>
        </CardContent></Card>
      ) : (
        <Card className="glass overflow-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Task</TableHead><TableHead>Project</TableHead><TableHead>Assigned To</TableHead>
              <TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Due</TableHead><TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{t.title}</p>
                      {t.description && <p className="text-xs text-muted-foreground line-clamp-1">{t.description}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{projectName(t.project_id)}</TableCell>
                  <TableCell className="text-sm">{userName(t.assigned_to)}</TableCell>
                  <TableCell><Badge className={priorityColor[t.priority] || ""}>{t.priority}</Badge></TableCell>
                  <TableCell><Badge className={statusColor[t.status] || ""}>{t.status}</Badge></TableCell>
                  <TableCell className="text-sm">
                    {t.due_date ? (
                      <span className={new Date(t.due_date) < new Date() && t.status !== "done" ? "text-destructive font-medium" : ""}>
                        {new Date(t.due_date).toLocaleDateString()}
                      </span>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(t)}><Pencil size={14} /></Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteTask(t.id, t.title)} className="text-destructive"><Trash2 size={14} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="glass max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Task" : "Create Task"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Project *</Label>
                <Select value={form.project_id} onValueChange={(v) => setForm((f) => ({ ...f, project_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Assign To</Label>
                <Select value={form.assigned_to} onValueChange={(v) => setForm((f) => ({ ...f, assigned_to: v }))}>
                  <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>{teamMembers.map((u) => <SelectItem key={u.user_id} value={u.user_id}>{u.display_name || u.user_id.slice(0, 8)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{priorityOptions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{statusOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} /></div>
            </div>
            <Button className="w-full glow-primary" onClick={save}>{editing ? "Update Task" : "Create Task"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTasks;
