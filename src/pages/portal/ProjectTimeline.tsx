import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, CheckCircle, Clock, AlertCircle, Milestone } from "lucide-react";

interface TimelineItem {
  id: string;
  title: string;
  type: "milestone" | "task";
  status: string;
  due_date: string | null;
  completed_at: string | null;
  project_id: string;
}

interface ProjectOption { id: string; title: string; start_date: string | null; end_date: string | null; }

const statusIcon: Record<string, { icon: typeof Clock; color: string }> = {
  pending: { icon: Clock, color: "text-muted-foreground" },
  "in-progress": { icon: Clock, color: "text-primary" },
  review: { icon: AlertCircle, color: "text-amber-400" },
  completed: { icon: CheckCircle, color: "text-green-400" },
  done: { icon: CheckCircle, color: "text-green-400" },
  todo: { icon: Clock, color: "text-muted-foreground" },
  "in-review": { icon: AlertCircle, color: "text-amber-400" },
};

const ProjectTimeline = () => {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProject, setSelectedProject] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const pRes = await supabase.from("client_projects")
        .select("id, title, start_date, end_date").eq("user_id", user.id);
      const projs = pRes.data || [];
      setProjects(projs);
      if (projs.length === 0) { setLoading(false); return; }

      const pIds = projs.map((p) => p.id);
      const [msRes, taskRes] = await Promise.all([
        supabase.from("project_milestones").select("id, title, status, due_date, completed_at, project_id")
          .in("project_id", pIds),
        supabase.from("project_tasks").select("id, title, status, due_date, completed_at, project_id")
          .in("project_id", pIds),
      ]);

      const all: TimelineItem[] = [
        ...(msRes.data || []).map((m) => ({ ...m, type: "milestone" as const })),
        ...(taskRes.data || []).map((t) => ({ ...t, type: "task" as const })),
      ];

      all.sort((a, b) => {
        const da = a.due_date || a.completed_at || "9999";
        const db = b.due_date || b.completed_at || "9999";
        return da.localeCompare(db);
      });

      setItems(all);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = selectedProject === "all" ? items : items.filter((i) => i.project_id === selectedProject);
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.title]));

  const isOverdue = (d: string | null, s: string) =>
    d && new Date(d) < new Date() && !["completed", "done"].includes(s);

  // Group by month
  const grouped: Record<string, TimelineItem[]> = {};
  filtered.forEach((item) => {
    const date = item.due_date || item.completed_at;
    const key = date
      ? new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long" })
      : "No Date";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-display font-bold text-2xl flex items-center gap-2">
          <CalendarDays size={24} className="text-primary" /> Project Timeline
        </h1>
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Gantt-like bar for selected project */}
      {selectedProject !== "all" && (() => {
        const proj = projects.find((p) => p.id === selectedProject);
        if (!proj?.start_date || !proj?.end_date) return null;
        const start = new Date(proj.start_date).getTime();
        const end = new Date(proj.end_date).getTime();
        const totalDays = Math.max(1, (end - start) / 86400000);
        const now = Date.now();
        const elapsed = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));

        return (
          <Card className="glass">
            <CardContent className="py-4 space-y-3">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{new Date(proj.start_date).toLocaleDateString()}</span>
                <span className="font-medium text-foreground">{proj.title}</span>
                <span>{new Date(proj.end_date).toLocaleDateString()}</span>
              </div>
              <div className="relative h-8 bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all"
                  style={{ width: `${elapsed}%` }}
                />
                {/* Milestone markers */}
                {filtered.filter((i) => i.type === "milestone" && i.due_date).map((m) => {
                  const mDate = new Date(m.due_date!).getTime();
                  const pos = Math.min(100, Math.max(0, ((mDate - start) / (end - start)) * 100));
                  return (
                    <div
                      key={m.id}
                      className="absolute top-0 bottom-0 w-1 bg-amber-400"
                      style={{ left: `${pos}%` }}
                      title={m.title}
                    />
                  );
                })}
                {/* Today marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-destructive"
                  style={{ left: `${elapsed}%` }}
                />
              </div>
              <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Progress</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Milestones</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> Today</span>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {loading ? (
        <p className="text-muted-foreground">Loading timeline…</p>
      ) : filtered.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-12 text-center">
            <CalendarDays className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground">No milestones or tasks with dates yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([month, monthItems]) => (
            <div key={month}>
              <h2 className="font-display font-semibold text-lg mb-3 text-muted-foreground">{month}</h2>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-2">
                  {monthItems.map((item) => {
                    const cfg = statusIcon[item.status] || statusIcon.pending;
                    const Icon = cfg.icon;
                    const overdue = isOverdue(item.due_date, item.status);
                    return (
                      <div key={`${item.type}-${item.id}`} className="relative flex gap-4 pl-1">
                        <div className={`z-10 flex-shrink-0 w-7 h-7 rounded-full bg-background border-2 ${overdue ? "border-destructive" : "border-border"} flex items-center justify-center ${overdue ? "text-destructive" : cfg.color}`}>
                          {item.type === "milestone" ? <Milestone size={13} /> : <Icon size={13} />}
                        </div>
                        <Card className={`glass flex-1 ${overdue ? "border-destructive/30" : ""}`}>
                          <CardContent className="py-3 px-4">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{item.title}</span>
                                <Badge variant={item.type === "milestone" ? "default" : "outline"} className="text-[10px]">
                                  {item.type === "milestone" ? "Milestone" : "Task"}
                                </Badge>
                                {selectedProject === "all" && (
                                  <Badge variant="secondary" className="text-[10px]">{projectMap[item.project_id]}</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {overdue && <Badge variant="destructive" className="text-[10px]">Overdue</Badge>}
                                <Badge variant="outline" className="text-[10px]">{item.status}</Badge>
                                {item.due_date && (
                                  <span className="text-[10px] text-muted-foreground">
                                    {new Date(item.due_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectTimeline;
