import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, FileUp, CheckCircle, Clock, AlertCircle, FolderKanban, Activity } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "message" | "file" | "milestone" | "task" | "project";
  title: string;
  description: string;
  timestamp: string;
  projectTitle?: string;
  projectId?: string;
}

const typeConfig: Record<string, { icon: typeof Activity; color: string; label: string }> = {
  message: { icon: MessageSquare, color: "text-blue-400", label: "Message" },
  file: { icon: FileUp, color: "text-emerald-400", label: "File Upload" },
  milestone: { icon: CheckCircle, color: "text-amber-400", label: "Milestone" },
  task: { icon: Clock, color: "text-purple-400", label: "Task" },
  project: { icon: FolderKanban, color: "text-primary", label: "Project" },
};

const ActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const projectsRes = await supabase
        .from("client_projects")
        .select("id, title")
        .eq("user_id", user.id);
      const projects = projectsRes.data || [];
      if (projects.length === 0) { setLoading(false); return; }

      const projectIds = projects.map((p) => p.id);
      const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.title]));

      const [messagesRes, filesRes, milestonesRes, tasksRes] = await Promise.all([
        supabase.from("messages").select("id, content, created_at, project_id")
          .in("project_id", projectIds).order("created_at", { ascending: false }).limit(50),
        supabase.from("project_files").select("id, file_name, created_at, project_id")
          .in("project_id", projectIds).order("created_at", { ascending: false }).limit(50),
        supabase.from("project_milestones").select("id, title, status, created_at, project_id, completed_at")
          .in("project_id", projectIds).order("created_at", { ascending: false }).limit(50),
        supabase.from("project_tasks").select("id, title, status, created_at, project_id")
          .in("project_id", projectIds).order("created_at", { ascending: false }).limit(50),
      ]);

      const items: ActivityItem[] = [];

      (messagesRes.data || []).forEach((m) =>
        items.push({
          id: `msg-${m.id}`, type: "message",
          title: "New message",
          description: m.content.length > 100 ? m.content.slice(0, 100) + "…" : m.content,
          timestamp: m.created_at, projectTitle: projectMap[m.project_id], projectId: m.project_id,
        })
      );

      (filesRes.data || []).forEach((f) =>
        items.push({
          id: `file-${f.id}`, type: "file",
          title: "File uploaded",
          description: f.file_name,
          timestamp: f.created_at, projectTitle: projectMap[f.project_id], projectId: f.project_id,
        })
      );

      (milestonesRes.data || []).forEach((m) =>
        items.push({
          id: `ms-${m.id}`, type: "milestone",
          title: m.status === "completed" ? "Milestone completed" : "Milestone updated",
          description: m.title,
          timestamp: m.completed_at || m.created_at,
          projectTitle: projectMap[m.project_id], projectId: m.project_id,
        })
      );

      (tasksRes.data || []).forEach((t) =>
        items.push({
          id: `task-${t.id}`, type: "task",
          title: `Task ${t.status === "done" ? "completed" : "updated"}`,
          description: t.title,
          timestamp: t.created_at,
          projectTitle: projectMap[t.project_id], projectId: t.project_id,
        })
      );

      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivities(items);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = filterType === "all" ? activities : activities.filter((a) => a.type === filterType);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl flex items-center gap-2">
          <Activity size={24} className="text-primary" /> Activity Feed
        </h1>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activity</SelectItem>
            <SelectItem value="message">Messages</SelectItem>
            <SelectItem value="file">Files</SelectItem>
            <SelectItem value="milestone">Milestones</SelectItem>
            <SelectItem value="task">Tasks</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading activity...</p>
      ) : filtered.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-12 text-center">
            <Activity className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground">No activity yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-1">
            {filtered.slice(0, 100).map((item) => {
              const cfg = typeConfig[item.type];
              const Icon = cfg.icon;
              return (
                <div key={item.id} className="relative flex gap-4 pl-2">
                  <div className={`z-10 flex-shrink-0 w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center ${cfg.color}`}>
                    <Icon size={14} />
                  </div>
                  <Card className="glass flex-1 mb-2">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{item.title}</span>
                            <Badge variant="outline" className="text-[10px]">{cfg.label}</Badge>
                            {item.projectTitle && (
                              <Badge variant="secondary" className="text-[10px]">{item.projectTitle}</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                          {formatTime(item.timestamp)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
