import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Upload, FileCheck } from "lucide-react";
import { logAudit } from "@/lib/audit";

interface Deliverable {
  id: string; project_id: string; title: string; description: string | null;
  file_path: string | null; file_name: string | null; status: string;
  submitted_at: string; project_title?: string;
}
interface Project { id: string; title: string; }

const statusColor: Record<string, string> = {
  pending: "bg-accent/20 text-accent",
  approved: "bg-green-500/20 text-green-400",
  rejected: "bg-destructive/20 text-destructive",
};

const AdminDeliverables = () => {
  const { toast } = useToast();
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [userId, setUserId] = useState("");
  const [form, setForm] = useState({ project_id: "", title: "", description: "" });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      const [dRes, pRes] = await Promise.all([
        supabase.from("deliverables").select("*").order("submitted_at", { ascending: false }),
        supabase.from("client_projects").select("id, title"),
      ]);
      const projs = pRes.data || [];
      setProjects(projs);
      setDeliverables((dRes.data || []).map((d) => ({
        ...d,
        project_title: projs.find((p) => p.id === d.project_id)?.title || "Unknown",
      })));
      setLoading(false);
    };
    load();
  }, []);

  const submitDeliverable = async () => {
    if (!form.project_id || !form.title.trim()) {
      toast({ title: "Project and title are required", variant: "destructive" }); return;
    }
    setUploading(true);
    let filePath: string | null = null;
    let fileName: string | null = null;

    if (file) {
      const path = `${form.project_id}/deliverables/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("project-attachments").upload(path, file);
      if (!error) { filePath = path; fileName = file.name; }
    }

    const { data, error } = await supabase.from("deliverables").insert({
      project_id: form.project_id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      submitted_by: userId,
      file_path: filePath,
      file_name: fileName,
    }).select().single();

    if (error) { toast({ title: "Error submitting", variant: "destructive" }); setUploading(false); return; }

    setDeliverables((prev) => [{
      ...data,
      project_title: projects.find((p) => p.id === data.project_id)?.title || "Unknown",
    }, ...prev]);
    await logAudit({ action: "create", entity_type: "deliverable", entity_id: data.id, details: { title: form.title, project_id: form.project_id } });
    setForm({ project_id: "", title: "", description: "" });
    setFile(null);
    setShowNew(false);
    setUploading(false);
    toast({ title: "Deliverable submitted for client review" });
  };

  if (loading) return <div className="animate-pulse-glow text-primary p-8">Loading...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Deliverables</h1>
        <Button onClick={() => setShowNew(true)}><Plus size={16} className="mr-1" /> Submit Deliverable</Button>
      </div>

      {deliverables.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-12 text-center">
            <FileCheck className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground">No deliverables submitted yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead><TableHead>Project</TableHead>
                <TableHead>Status</TableHead><TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliverables.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.title}</TableCell>
                  <TableCell>{d.project_title}</TableCell>
                  <TableCell><Badge className={statusColor[d.status] || ""}>{d.status}</Badge></TableCell>
                  <TableCell className="text-xs">{new Date(d.submitted_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="glass">
          <DialogHeader><DialogTitle>Submit Deliverable for Review</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Select value={form.project_id} onValueChange={(v) => setForm({ ...form, project_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent>
                {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Deliverable title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            <div>
              <Button variant="outline" size="sm" onClick={() => document.getElementById("del-file")?.click()} disabled={uploading}>
                <Upload size={14} className="mr-1" /> {file ? file.name : "Attach File"}
              </Button>
              <input id="del-file" type="file" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            <Button className="w-full" onClick={submitDeliverable} disabled={uploading}>
              {uploading ? "Submitting..." : "Submit for Client Review"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDeliverables;
