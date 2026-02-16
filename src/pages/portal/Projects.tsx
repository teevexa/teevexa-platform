import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FolderKanban } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  progress: number;
  start_date: string | null;
  end_date: string | null;
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
    const load = async () => {
      const { data } = await supabase.from("client_projects").select("*").order("created_at", { ascending: false });
      setProjects(data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display font-bold text-2xl">Projects</h1>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : projects.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-12 text-center">
            <FolderKanban className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground">No projects yet. Once your project starts, you'll see updates here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map((p) => (
            <Card key={p.id} className="glass">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{p.title}</CardTitle>
                  {p.description && <p className="text-sm text-muted-foreground mt-1">{p.description}</p>}
                </div>
                <Badge className={statusColor[p.status] || statusColor.planning}>{p.status}</Badge>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Progress value={p.progress} className="h-2 flex-1" />
                  <span className="text-sm font-medium text-muted-foreground">{p.progress}%</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
