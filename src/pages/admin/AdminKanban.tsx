import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { logAudit } from "@/lib/audit";
import { GripVertical, Filter, Columns3 } from "lucide-react";

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
  urgent: "border-l-destructive",
  high: "border-l-orange-500",
  medium: "border-l-blue-500",
  low: "border-l-muted-foreground",
};

const AdminKanban = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProject, setFilterProject] = useState("all");
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [tRes, pRes, uRes] = await Promise.all([
      supabase.from("project_tasks").select("id, title, description, status, priority, assigned_to, project_id, due_date, created_at").order("created_at", { ascending: false }),
      supabase.from("client_projects").select("id, title"),
      supabase.from("profiles").select("user_id, display_name"),
    ]);
    setTasks(tRes.data || []);
    setProjects(pRes.data || []);
    setUsers(uRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const userName = (id: string | null) => {
    if (!id) return "Unassigned";
    return users.find((u) => u.user_id === id)?.display_name || id.slice(0, 8);
  };
  const projectName = (id: string) => projects.find((p) => p.id === id)?.title || "—";

  const filtered = filterProject === "all" ? tasks : tasks.filter((t) => t.project_id === filterProject);

  const handleDragStart = (taskId: string) => setDraggedTask(taskId);
  const handleDragEnd = () => setDraggedTask(null);

  const handleDrop = async (newStatus: string) => {
    if (!draggedTask) return;
    const task = tasks.find((t) => t.id === draggedTask);
    if (!task || task.status === newStatus) { setDraggedTask(null); return; }

    const oldStatus = task.status;
    // Optimistic update
    setTasks((prev) => prev.map((t) => t.id === draggedTask ? { ...t, status: newStatus } : t));

    const payload: Record<string, unknown> = { status: newStatus };
    if (newStatus === "done") payload.completed_at = new Date().toISOString();
    else payload.completed_at = null;

    const { error } = await supabase.from("project_tasks").update(payload).eq("id", draggedTask);
    if (error) {
      setTasks((prev) => prev.map((t) => t.id === draggedTask ? { ...t, status: oldStatus } : t));
      toast({ title: "Error moving task", description: error.message, variant: "destructive" });
    } else {
      await logAudit({ action: "update", entity_type: "task", entity_id: draggedTask, details: { title: task.title, from: oldStatus, to: newStatus } });
      toast({ title: `Task moved to ${newStatus}` });
    }
    setDraggedTask(null);
  };

  const isOverdue = (d: string | null, status: string) =>
    d && new Date(d) < new Date() && status !== "done";

  if (loading) return <p className="text-muted-foreground p-6">Loading Kanban…</p>;

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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTasks = filtered.filter((t) => t.status === col.id);
          return (
            <div
              key={col.id}
              className="min-h-[300px] rounded-xl border border-border bg-card/50 flex flex-col"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(col.id)}
            >
              <div className={`px-4 py-3 rounded-t-xl ${col.color} flex items-center justify-between`}>
                <h3 className="font-semibold text-sm">{col.label}</h3>
                <Badge variant="secondary" className="text-xs">{colTasks.length}</Badge>
              </div>
              <div className="flex-1 p-2 space-y-2 overflow-auto max-h-[60vh]">
                {colTasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">Drop tasks here</p>
                ) : (
                  colTasks.map((task) => (
                    <Card
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      onDragEnd={handleDragEnd}
                      className={`cursor-grab active:cursor-grabbing border-l-4 ${priorityBorder[task.priority] || "border-l-border"} transition-all hover:shadow-md ${draggedTask === task.id ? "opacity-50 scale-95" : ""}`}
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start gap-1">
                          <GripVertical size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
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
    </div>
  );
};

export default AdminKanban;
