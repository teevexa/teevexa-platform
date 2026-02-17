import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, ArrowRight } from "lucide-react";

interface Project {
  id: string; title: string; description: string | null; status: string;
  progress: number; start_date: string | null; end_date: string | null;
}

const statusColor: Record<string, string> = {
  planning: "bg-muted text-muted-foreground",
  "in-progress": "bg-primary/20 text-primary",
  review: "bg-accent/20 text-accent",
  completed: "bg-green-500/20 text-green-400",
};

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("client_projects").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setProjects(data || []); setLoading(false); });
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display font-bold text-2xl">My Projects</h1>

      {loading ? <p className="text-muted-foreground">Loading...</p> : projects.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-12 text-center">
            <FolderKanban className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground">No projects yet. Once your project starts, you'll see updates here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map((p) => (
            <Link key={p.id} to={`/client-portal/projects/${p.id}`}>
              <Card className="glass hover:border-primary/40 transition-all group">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">{p.title}</CardTitle>
                    {p.description && <p className="text-sm text-muted-foreground mt-1">{p.description}</p>}
                    <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                      {p.start_date && <span>Start: {new Date(p.start_date).toLocaleDateString()}</span>}
                      {p.end_date && <span>Est. End: {new Date(p.end_date).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColor[p.status] || statusColor.planning}>{p.status}</Badge>
                    <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Progress value={p.progress} className="h-2 flex-1" />
                    <span className="text-sm font-medium text-muted-foreground">{p.progress}%</span>
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
