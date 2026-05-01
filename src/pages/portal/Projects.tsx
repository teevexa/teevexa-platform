import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, ArrowRight } from "lucide-react";
import { ProjectCardSkeleton } from "@/components/portal/PortalSkeleton";
import PortalError from "@/components/portal/PortalError";

const statusColor: Record<string, string> = {
  planning: "bg-muted text-muted-foreground",
  "in-progress": "bg-primary/20 text-primary",
  review: "bg-accent/20 text-accent",
  completed: "bg-green-500/20 text-green-400",
};

const Projects = () => {
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    staleTime: Infinity,
  });

  const { data: projects = [], isLoading, error, refetch } = useQuery({
    queryKey: ["projects", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_projects")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">My Projects</h1>
        {projects.length > 0 && (
          <span className="text-sm text-muted-foreground">{projects.length} project{projects.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {isLoading ? (
        <ProjectCardSkeleton rows={4} />
      ) : error ? (
        <PortalError onRetry={refetch} />
      ) : projects.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-16 text-center">
            <FolderKanban className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="font-medium mb-1">No projects yet</p>
            <p className="text-sm text-muted-foreground">Once your project starts, all updates will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map((p) => (
            <Link key={p.id} to={`/client-portal/projects/${p.id}`}>
              <Card className="glass hover:border-primary/40 transition-all group">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">{p.title}</CardTitle>
                    {p.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.description}</p>}
                    <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                      {p.start_date && <span>Start: {new Date(p.start_date).toLocaleDateString()}</span>}
                      {p.end_date && <span>Est. End: {new Date(p.end_date).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={statusColor[p.status] || statusColor.planning}>{p.status}</Badge>
                    <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Progress value={p.progress} className="h-2 flex-1" />
                    <span className="text-sm font-medium text-muted-foreground w-10 text-right">{p.progress}%</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
