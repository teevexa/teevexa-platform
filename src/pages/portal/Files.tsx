import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, FolderOpen } from "lucide-react";

interface ProjectFile {
  id: string; file_name: string; file_type: string | null; file_size: number;
  created_at: string; file_path: string; project_id: string;
}
interface Project { id: string; title: string; }

const Files = () => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [pRes, fRes] = await Promise.all([
        supabase.from("client_projects").select("id, title"),
        supabase.from("project_files").select("*").order("created_at", { ascending: false }),
      ]);
      setProjects(pRes.data || []);
      setFiles(fRes.data || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = filter === "all" ? files : files.filter((f) => f.project_id === filter);
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.title]));
  const formatSize = (b: number) => b < 1024 ? `${b}B` : b < 1048576 ? `${(b/1024).toFixed(1)}KB` : `${(b/1048576).toFixed(1)}MB`;

  const download = async (path: string, name: string) => {
    const { data } = await supabase.storage.from("project-attachments").createSignedUrl(path, 300);
    if (data?.signedUrl) { const a = document.createElement("a"); a.href = data.signedUrl; a.download = name; a.click(); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Files</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48 glass"><SelectValue placeholder="Filter by project" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? <p className="text-muted-foreground">Loading...</p> : filtered.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-12 text-center">
            <FolderOpen className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground">No files found. Upload files from your project pages.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((f) => (
            <Card key={f.id} className="glass">
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-primary" />
                  <div>
                    <p className="text-sm font-medium">{f.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {projectMap[f.project_id] || "Unknown"} · {formatSize(f.file_size)} · {new Date(f.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => download(f.file_path, f.file_name)}>
                  <Download size={16} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Files;
