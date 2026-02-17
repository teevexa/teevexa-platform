import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, FolderKanban } from "lucide-react";

interface Project {
  id: string; title: string; description: string | null; status: string;
  progress: number; user_id: string; start_date: string | null;
  end_date: string | null; created_at: string;
}

const statusOptions = ["planning", "in-progress", "review", "completed"];

const AdminProjects = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", status: "planning", user_id: "" });
  const [clients, setClients] = useState<{ user_id: string; display_name: string | null }[]>([]);

  const load = async () => {
    const [pRes, cRes] = await Promise.all([
      supabase.from("client_projects").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("user_id, display_name"),
    ]);
    setProjects(pRes.data || []);
    setClients(cRes.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createProject = async () => {
    if (!form.title.trim() || !form.user_id) { toast({ title: "Title and client are required", variant: "destructive" }); return; }
    const { error } = await supabase.from("client_projects").insert({
      title: form.title.trim(), description: form.description.trim() || null,
      status: form.status, user_id: form.user_id,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Project created" });
    setShowCreate(false);
    setForm({ title: "", description: "", status: "planning", user_id: "" });
    load();
  };

  const statusColor: Record<string, string> = {
    planning: "bg-muted text-muted-foreground", "in-progress": "bg-primary/20 text-primary",
    review: "bg-accent/20 text-accent", completed: "bg-green-500/20 text-green-400",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Projects</h1>
        <Button onClick={() => setShowCreate(true)}><Plus size={16} className="mr-1" /> New Project</Button>
      </div>

      {loading ? <p className="text-muted-foreground">Loading...</p> : projects.length === 0 ? (
        <Card className="glass"><CardContent className="py-12 text-center"><FolderKanban className="mx-auto text-muted-foreground mb-4" size={48} /><p className="text-muted-foreground">No projects yet.</p></CardContent></Card>
      ) : (
        <Card className="glass overflow-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead>Progress</TableHead><TableHead>Created</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell><Badge className={statusColor[p.status] || ""}>{p.status}</Badge></TableCell>
                  <TableCell><div className="flex items-center gap-2"><Progress value={p.progress} className="h-2 w-20" /><span className="text-xs">{p.progress}%</span></div></TableCell>
                  <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="glass">
          <DialogHeader><DialogTitle>Create Project</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
            <div><Label>Client</Label>
              <Select value={form.user_id} onValueChange={(v) => setForm((f) => ({ ...f, user_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>{clients.map((c) => <SelectItem key={c.user_id} value={c.user_id}>{c.display_name || c.user_id}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{statusOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button className="w-full glow-primary" onClick={createProject}>Create Project</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProjects;
