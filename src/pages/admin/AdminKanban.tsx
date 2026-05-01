import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { logAudit } from "@/lib/audit";
import { useIsMobile } from "@/hooks/use-mobile";
import { GripVertical, Filter, Columns3, Hand, Plus, X } from "lucide-react";

interface Task {
  id: string; title: string; description: string | null; status: string;
  priority: string; assigned_to: string | null; project_id: string;
  due_date: string | null; created_at: string;
}
interface ProjectOption { id: string; title: string; }
interface UserOption { user_id: string; display_name: string | null; }

const columns = [
  { id: "todo", label: "To Do", color: "bg-muted" },
  { id: "in-progress", label: "In Progress", color: "bg-primary/20" },
  { id: "in-review", label: "In Review", color: "bg-accent/20" },
  { id: "done", label: "Done", color: "bg-green-500/20" },
];
const priorityBorder: Record<string, string> = {
  urgent: "border-l-destructive", high: "border-l-orange-500",
  medium: "border-l-blue-500", low: "border-l-muted-foreground",
};
const priorityOptions = ["low", "medium", "high", "urgent"];

const AdminKanban = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterProject, setFilterProject] = useState("all");
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [quickCreate, setQuickCreate] = useState<string | null>(null); // column id being created in
  const [quickForm, setQuickForm] = useState({ title: "", project_id: "", priority: "medium", assigned_to: "" });
  const [saving, setSaving] = useState(false);
  const isMobile = useIsMobile();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-kanban"],
    queryFn: async () => {
      const [tRes, pRes, uRes] = await Promise.all([
        supabase.from("project_tasks").select("id, title, description, status, priority, assigned_to, project_id, due_date, created_at").order("created_at", { ascending: false }),
        supabase.from("client_projects").select("id, title"),
        supabase.from("profiles").select("user_id, display_name"),
      ]);
      const user = (await supabase.auth.getUser()).data.user;
      return { tasks: (tRes.data || []) as Task[], projects: (pRes.data || []) as ProjectOption[], users: (uRes.data || []) as UserOption[], userId: user?.id };
    },
    staleTime: 30_000,
  });

  const tasks = data?.tasks ?? [];
  const projects = data?.projects ?? [];
  const users = data?.users ?? [];
  const userId = data?.userId;

  const userName = (id: string | null) => id ? (users.find((u) => u.user_id === id)?.display_name || id.slice(0, 8)) : "Unassigned";
  const projectName = (id: string) => projects.find((p) => p.id === id)?.title || "—";
  const filtered = filterProject === "all" ? tasks : tasks.filter((t) => t.project_id === filterProject);

  const handleDragStart = (taskId: string) => setDraggedTask(taskId);
  const handleDragEnd = () => setDraggedTask(null);
  const handleMobileTap = (taskId: string) => setSelectedTask((prev) => prev === taskId ? null : taskId);

  const handleDrop = useCallback(async (newStatus: string) => {
    const activeTask = isMobile ? selectedTask : draggedTask;
    if (!activeTask) return;
    const task = tasks.find((t) => t.id === activeTask);
    if (!task || task.status === newStatus) { setDraggedTask(null); setSelectedTask(null); return; }

    const oldStatus = task.status;
    queryClient.setQueryData(["admin-kanban"], (old: typeof data) => {
      if (!old) return old;
      return { ...old, tasks: old.tasks.map((t) => t.id === activeTask ? { ...t, status: newStatus } : t) };
    });

    const payload: Record<string, unknown> = { status: newStatus };
    if (newStatus === "done") payload.completed_at = new Date().toISOString();
    else payload.completed_at = null;

    const { error } = await supabase.from("project_tasks").update(payload).eq("id", activeTask);
    if (error) {
      queryClient.setQueryData(["admin-kanban"], (old: typeof data) => {
        if (!old) return old;
        return { ...old, tasks: old.tasks.map((t) => t.id === activeTask ? { ...t, status: oldStatus } : t) };
      });
      toast({ title: "Error moving task", description: error.message, variant: "destructive" });
    } else {
      await logAudit({ action: "update", entity_type: "task", entity_id: activeTask, details: { title: task.title, from: oldStatus, to: newStatus } });
    }
    setDraggedTask(null);
    setSelectedTask(null);
  }, [isMobile, selectedTask, draggedTask, tasks, queryClient, data, toast]);

  const openQuickCreate = (colId: string) => {
    setQuickCreate(colId);
    setQuickForm({ title: "", project_id: filterProject !== "all" ? filterProject : "", priority: "medium", assigned_to: "" });
  };

  const saveQuickTask = async () => {
    if (!quickForm.title.trim() || !quickForm.project_id) {
      toast({ title: "Title and project are required", variant: "destructive" }); return;
    }
    setSaving(true);
    const { data: created, error } = await supabase.from("project_tasks").insert({
      title: quickForm.title.trim(),
      project_id: quickForm.project_id,
      status: quickCreate!,
      priority: quickForm.priority,
      assigned_to: quickForm.assigned_to || null,
      created_by: userId,
    }).select().single();
    setSaving(false);
    if (error) { toast({ title: "Error creating task", description: error.message, variant: "destructive" }); return; }
    await logAudit({ action: "create", entity_type: "task", entity_id: created.id, details: { title: quickForm.title, status: quickCreate } });
    queryClient.setQueryData(["admin-kanban"], (old: typeof data) => {
      if (!old) return old;
      return { ...old, tasks: [{ ...created, description: null, due_date: null } as Task, ...old.tasks] };
    });
    setQuickCreate(null);
    toast({ title: "Task created" });
  };

  const isOverdue = (d: string | null, status: string) => d && new Date(d) < new Date() && status !== "done";

  if (isLoading) return <p className="text-muted-foreground p-6">Loading Kanban…</p>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-display font-bold text-2xl flex items-center gap-2">
          <Columns3 size={24} className="text-primary" /> Kanban Board
        </h1>
        <div className="flex items-center gap-3">
          <Filter size={16} className="text-muted-foreground" />
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="w-48"><SelectValue placeholder="All projects" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isMobile && selectedTask && (
        <p className="text-sm text-primary text-center animate-pulse py-1">
          Tap a column below to move the selected task
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTasks = filtered.filter((t) => t.status === col.id);
          const isDropTarget = isMobile && selectedTask && tasks.find((t) => t.id === selectedTask)?.status !== col.id;
          return (
            <div
              key={col.id}
              className={`min-h-[300px] rounded-xl border flex flex-col transition-all ${
                isDropTarget ? "border-primary/60 bg-primary/5 shadow-lg shadow-primary/10" : "border-border bg-card/50"
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(col.id)}
              onClick={() => isMobile && selectedTask && handleDrop(col.id)}
            >
              {/* Column header */}
              <div className={`px-3 py-2.5 rounded-t-xl ${col.color} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{col.label}</h3>
                  <Badge variant="secondary" className="text-xs">{colTasks.length}</Badge>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 hover:bg-white/20"
                  onClick={(e) => { e.stopPropagation(); openQuickCreate(col.id); }}
                  title={`Add task to ${col.label}`}
                >
                  <Plus size={14} />
                </Button>
              </div>

              <div className="flex-1 p-2 space-y-2 overflow-auto max-h-[60vh]">
                {colTasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    {isMobile && selectedTask ? "Tap here to move" : "Drop tasks here"}
                  </p>
                ) : (
                  colTasks.map((task) => (
                    <Card
                      key={task.id}
                      draggable={!isMobile}
                      onDragStart={() => !isMobile && handleDragStart(task.id)}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => { e.stopPropagation(); isMobile && handleMobileTap(task.id); }}
                      className={`border-l-4 ${priorityBorder[task.priority] || "border-l-border"} transition-all hover:shadow-md ${
                        isMobile ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
                      } ${
                        (isMobile ? selectedTask === task.id : draggedTask === task.id) ? "opacity-50 scale-95 ring-2 ring-primary" : ""
                      }`}
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start gap-1">
                          {isMobile
                            ? <Hand size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                            : <GripVertical size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                          }
                          <div className="min-w-0">
                            <p className="font-medium text-sm leading-tight">{task.title}</p>
                            {task.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{task.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <Badge variant="outline" className="text-[10px]">{projectName(task.project_id)}</Badge>
                          <Badge variant="secondary" className="text-[10px]">{task.priority}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>{userName(task.assigned_to)}</span>
                          {task.due_date && (
                            <span className={isOverdue(task.due_date, task.status) ? "text-destructive font-medium" : ""}>
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick-create dialog */}
      <Dialog open={!!quickCreate} onOpenChange={(open) => !open && setQuickCreate(null)}>
        <DialogContent className="glass max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Add Task to {columns.find((c) => c.id === quickCreate)?.label}
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setQuickCreate(null)}><X size={14} /></Button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title *</Label>
              <Input
                value={quickForm.title}
                onChange={(e) => setQuickForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Task title"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && saveQuickTask()}
              />
            </div>
            <div>
              <Label>Project *</Label>
              <Select value={quickForm.project_id} onValueChange={(v) => setQuickForm((f) => ({ ...f, project_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Priority</Label>
                <Select value={quickForm.priority} onValueChange={(v) => setQuickForm((f) => ({ ...f, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{priorityOptions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assign To</Label>
                <Select value={quickForm.assigned_to} onValueChange={(v) => setQuickForm((f) => ({ ...f, assigned_to: v }))}>
                  <SelectTrigger><SelectValue placeholder="Anyone" /></SelectTrigger>
                  <SelectContent>{users.map((u) => <SelectItem key={u.user_id} value={u.user_id}>{u.display_name || u.user_id.slice(0, 8)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full glow-primary" onClick={saveQuickTask} disabled={saving}>
              {saving ? "Creating…" : "Create Task"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminKanban;
