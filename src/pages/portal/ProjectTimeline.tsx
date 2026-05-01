import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, CheckCircle, Clock, AlertCircle, Milestone } from "lucide-react";
import { useState } from "react";
import { TimelineSkeleton } from "@/components/portal/PortalSkeleton";
import PortalError from "@/components/portal/PortalError";

interface TimelineItem {
  id: string; title: string; type: "milestone" | "task";
  status: string; due_date: string | null; completed_at: string | null; project_id: string;
}

const statusIcon: Record<string, { icon: typeof Clock; color: string }> = {
  pending: { icon: Clock, color: "text-muted-foreground" },
  "in-progress": { icon: Clock, color: "text-primary" },
  review: { icon: AlertCircle, color: "text-amber-400" },
  completed: { icon: CheckCircle, color: "text-green-400" },
  approved: { icon: CheckCircle, color: "text-green-400" },
  done: { icon: CheckCircle, color: "text-green-400" },
  todo: { icon: Clock, color: "text-muted-foreground" },
  "in-review": { icon: AlertCircle, color: "text-amber-400" },
};

const ProjectTimeline = () => {
  const [selectedProject, setSelectedProject] = useState("all");

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    staleTime: Infinity,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["timeline", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const pRes = await supabase.from("client_projects").select("id, title, start_date, end_date").eq("user_id", user!.id);
      const projs = pRes.data || [];
      if (projs.length === 0) return { projects: [], items: [] };
      const pIds = projs.map((p) => p.id);

      const [msRes, taskRes] = await Promise.all([
        supabase.from("project_milestones").select("id, title, status, due_date, completed_at, project_id").in("project_id", pIds),
        supabase.from("project_tasks").select("id, title, status, due_date, completed_at, project_id").in("project_id", pIds),
      ]);

      const all: TimelineItem[] = [
        ...(msRes.data || []).map((m) => ({ ...m, type: "milestone" as const })),
        ...(taskRes.data || []).map((t) => ({ ...t, type: "task" as const })),
      ].sort((a, b) => {
        const da = a.due_date || a.completed_at || "9999";
        const db = b.due_date || b.completed_at || "9999";
        return da.localeCompare(db);
      });

      return { projects: projs, items: all };
    },
  });

  const { projects = [], items = [] } = data || {};
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.title]));
  const filtered = selectedProject === "all" ? items : items.filter((i) => i.project_id === selectedProject);

  const isOverdue = (d: string | null, s: string) =>
    !!d && new Date(d) < new Date() && !["completed", "done", "approved"].includes(s);

  const grouped: Record<string, TimelineItem[]> = {};
  filtered.forEach((item) => {
    const date = item.due_date || item.completed_at;
    const key = date
      ? new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long" })
      : "No Date";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  const ganttProject = selectedProject !== "all" ? projects.find((p) => p.id === selectedProject) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-display font-bold text-2xl flex items-center gap-2">
          <CalendarDays size={24} className="text-primary" /> Project Timeline
        </h1>
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Gantt bar — only when a specific project is selected and has dates */}
      {ganttProject?.start_date && ganttProject?.end_date && (() => {
        const start = new Date(ganttProject.start_date).getTime();
        const end = new Date(ganttProject.end_date).getTime();
        const elapsed = Math.min(100, Math.max(0, ((Date.now() - start) / (end - start)) * 100));
        return (
          <Card className="glass">
            <CardContent className="py-4 space-y-3">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{new Date(ganttProject.start_date).toLocaleDateString()}</span>
                <span className="font-medium text-foreground">{ganttProject.title}</span>
                <span>{new Date(ganttProject.end_date).toLocaleDateString()}</span>
              </div>
              <div className="relative h-8 bg-muted rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all" style={{ width: `${elapsed}%` }} />
                {filtered.filter((i) => i.type === "milestone" && i.due_date).map((m) => {
                  const pos = Math.min(100, Math.max(0, ((new Date(m.due_date!).getTime() - start) / (end - start)) * 100));
                  return <div key={m.id} className="absolute top-0 bottom-0 w-1 bg-amber-400 opacity-80" style={{ left: `${pos}%` }} title={m.title} />;
                })}
                <div className="absolute top-0 bottom-0 w-0.5 bg-destructive" style={{ left: `${elapsed}%` }} />
              </div>
              {/* Legend */}
              <div className="flex items-center gap-5 text-[11px] text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-primary" /> Progress</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-amber-400" /> Milestones</span>
                <span className="flex items-center gap-1.5"><span className="w-0.5 h-3 bg-destructive inline-block" /> Today</span>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {isLoading ? (
        <TimelineSkeleton />
      ) : error ? (
        <PortalError onRetry={refetch} />
      ) : filtered.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-16 text-center">
            <CalendarDays className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="font-medium mb-1">No timeline items yet</p>
            <p className="text-sm text-muted-foreground">Milestones and tasks with due dates will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([month, monthItems]) => (
            <div key={month}>
              <h2 className="font-display font-semibold text-base mb-3 text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary/60 inline-block" />
                {month}
              </h2>
              <div className="relative">
                <div className="absolute left-[14px] top-0 bottom-0 w-px bg-border" />
                <div className="space-y-2">
                  {monthItems.map((item) => {
                    const cfg = statusIcon[item.status] || statusIcon.pending;
                    const Icon = cfg.icon;
                    const overdue = isOverdue(item.due_date, item.status);
                    return (
                      <div key={`${item.type}-${item.id}`} className="relative flex gap-4 pl-1">
                        <div className={`z-10 shrink-0 w-7 h-7 rounded-full bg-background border-2 flex items-center justify-center ${overdue ? "border-destructive text-destructive" : `border-border ${cfg.color}`}`}>
                          {item.type === "milestone" ? <Milestone size={13} /> : <Icon size={13} />}
                        </div>
                        <Card className={`glass flex-1 ${overdue ? "border-destructive/30" : ""}`}>
                          <CardContent className="py-3 px-4">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm">{item.title}</span>
                                <Badge variant={item.type === "milestone" ? "default" : "outline"} className="text-[10px]">
                                  {item.type}
                                </Badge>
                                {selectedProject === "all" && (
                                  <Badge variant="secondary" className="text-[10px]">{projectMap[item.project_id]}</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {overdue && <Badge variant="destructive" className="text-[10px]">Overdue</Badge>}
                                <Badge variant="outline" className="text-[10px]">{item.status}</Badge>
                                {item.due_date && (
                                  <span className="text-[10px] text-muted-foreground">{new Date(item.due_date).toLocaleDateString()}</span>
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
