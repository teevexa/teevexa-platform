import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, FolderOpen, Image, FileSpreadsheet, Film, Archive, File, Search } from "lucide-react";
import { CardRowSkeleton } from "@/components/portal/PortalSkeleton";
import PortalError from "@/components/portal/PortalError";
import { formatFileSize, fileKind } from "@/lib/format";

interface ProjectFile {
  id: string; file_name: string; file_type: string | null; file_size: number;
  created_at: string; file_path: string; project_id: string;
}

const kindIcon: Record<string, typeof FileText> = {
  pdf: FileText,
  image: Image,
  spreadsheet: FileSpreadsheet,
  doc: FileText,
  video: Film,
  archive: Archive,
  generic: File,
};

const kindColor: Record<string, string> = {
  pdf: "text-red-400",
  image: "text-emerald-400",
  spreadsheet: "text-green-400",
  doc: "text-blue-400",
  video: "text-purple-400",
  archive: "text-amber-400",
  generic: "text-primary",
};

const Files = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    staleTime: Infinity,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["files", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data: projectData } = await supabase.from("client_projects").select("id, title").eq("user_id", user!.id);
      const projects = projectData || [];
      const projectIds = projects.map((p) => p.id);
      if (projectIds.length === 0) return { files: [], projects: [] };

      const { data: fileData, error } = await supabase.from("project_files").select("*")
        .in("project_id", projectIds).order("created_at", { ascending: false });
      if (error) throw error;
      return { files: (fileData || []) as ProjectFile[], projects };
    },
  });

  const { files = [], projects = [] } = data || {};
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.title]));

  const filtered = files
    .filter((f) => filter === "all" || f.project_id === filter)
    .filter((f) => !search || f.file_name.toLowerCase().includes(search.toLowerCase()));

  const download = async (path: string, name: string) => {
    const { data } = await supabase.storage.from("project-attachments").createSignedUrl(path, 300);
    if (data?.signedUrl) { const a = document.createElement("a"); a.href = data.signedUrl; a.download = name; a.click(); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl">Files</h1>
        {!isLoading && files.length > 0 && (
          <span className="text-sm text-muted-foreground">{filtered.length} of {files.length} files</span>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files…"
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48 glass"><SelectValue placeholder="Filter by project" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <CardRowSkeleton rows={6} />
      ) : error ? (
        <PortalError onRetry={refetch} />
      ) : filtered.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-16 text-center">
            <FolderOpen className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="font-medium mb-1">{search ? "No files match your search" : "No files yet"}</p>
            <p className="text-sm text-muted-foreground">
              {search ? "Try a different search term." : "Files uploaded in your projects will appear here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((f) => {
            const kind = fileKind(f.file_type, f.file_name);
            const Icon = kindIcon[kind];
            const iconColor = kindColor[kind];
            return (
              <Card key={f.id} className="glass hover:border-primary/30 transition-colors">
                <CardContent className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon size={20} className={`${iconColor} shrink-0`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{f.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {projectMap[f.project_id] || "Unknown project"} · {formatFileSize(f.file_size)} · {new Date(f.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => download(f.file_path, f.file_name)} title="Download">
                    <Download size={16} />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Files;
