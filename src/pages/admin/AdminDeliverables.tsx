import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Plus, Upload, FileCheck, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { logAudit } from "@/lib/audit";

interface Deliverable {
  id: string; project_id: string; title: string; description: string | null;
  file_path: string | null; file_name: string | null; status: string;
  submitted_at: string; project_title?: string; client_user_id?: string;
}
interface Project { id: string; title: string; user_id: string; }

const statusColor: Record<string, string> = {
  pending: "bg-accent/20 text-accent",
  approved: "bg-green-500/20 text-green-400",
  rejected: "bg-destructive/20 text-destructive",
};

const AdminDeliverables = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ project_id: "", title: "", description: "" });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-deliverables"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const [dRes, pRes] = await Promise.all([
        supabase.from("deliverables").select("*").order("submitted_at", { ascending: false }),
        supabase.from("client_projects").select("id, title, user_id"),
      ]);
      const projs = (pRes.data || []) as Project[];
      const deliverables: Deliverable[] = (dRes.data || []).map((d) => {
        const proj = projs.find((p) => p.id === d.project_id);
        return { ...d, project_title: proj?.title || "Unknown", client_user_id: proj?.user_id };
      });
      return { deliverables, projects: projs, userId: user?.id };
    },
    staleTime: 30_000,
  });

  const deliverables = data?.deliverables ?? [];
  const projects = data?.projects ?? [];
  const userId = data?.userId;

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-deliverables"] });

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

    const { data: created, error } = await supabase.from("deliverables").insert({
      project_id: form.project_id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      submitted_by: userId,
      file_path: filePath,
      file_name: fileName,
    }).select().single();

    if (error) { toast({ title: "Error submitting", variant: "destructive" }); setUploading(false); return; }

    // Notify the client
    const proj = projects.find((p) => p.id === form.project_id);
    if (proj?.user_id) {
      await supabase.from("notifications").insert({
        user_id: proj.user_id,
        title: "New Deliverable Ready for Review",
        message: `"${form.title.trim()}" has been submitted for your review on project "${proj.title}".`,
        type: "info",
        link: "/client-portal/deliverables",
      });
    }

    await logAudit({ action: "create", entity_type: "deliverable", entity_id: created.id, details: { title: form.title, project_id: form.project_id } });
    setForm({ project_id: "", title: "", description: "" });
    setFile(null);
    setShowNew(false);
    setUploading(false);
    refresh();
    toast({ title: "Deliverable submitted for client review" });
  };

  const updateStatus = async (d: Deliverable, newStatus: "approved" | "rejected") => {
    setActionLoading(d.id);
    const { error } = await supabase.from("deliverables").update({ status: newStatus }).eq("id", d.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setActionLoading(null); return; }

    // Notify client
    if (d.client_user_id) {
      await supabase.from("notifications").insert({
        user_id: d.client_user_id,
        title: newStatus === "approved" ? "Deliverable Approved" : "Deliverable Needs Changes",
        message: newStatus === "approved"
          ? `"${d.title}" has been approved.`
          : `"${d.title}" requires changes. Please check your portal for details.`,
        type: "info",
        link: "/client-portal/deliverables",
      });
    }

    await logAudit({ action: newStatus, entity_type: "deliverable", entity_id: d.id, details: { title: d.title } });
    queryClient.setQueryData(["admin-deliverables"], (old: typeof data) => {
      if (!old) return old;
      return { ...old, deliverables: old.deliverables.map((item) => item.id === d.id ? { ...item, status: newStatus } : item) };
    });
    setActionLoading(null);
    toast({ title: newStatus === "approved" ? "Deliverable approved" : "Deliverable marked for changes" });
  };

  const getFileUrl = async (filePath: string) => {
    const { data } = await supabase.storage.from("project-attachments").createSignedUrl(filePath, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Deliverables</h1>
        <Button onClick={() => setShowNew(true)}><Plus size={16} className="mr-1" /> Submit Deliverable</Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : deliverables.length === 0 ? (
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
                <TableHead>Title</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliverables.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">
                    <div>
                      <p>{d.title}</p>
                      {d.description && <p className="text-xs text-muted-foreground line-clamp-1">{d.description}</p>}
                    </div>
                  </TableCell>
                  <TableCell>{d.project_title}</TableCell>
                  <TableCell>
                    {d.file_name && d.file_path ? (
                      <Button variant="ghost" size="sm" className="text-xs gap-1 h-7 px-2"
                        onClick={() => getFileUrl(d.file_path!)}>
                        <ExternalLink size={12} /> {d.file_name.length > 20 ? d.file_name.slice(0, 20) + "…" : d.file_name}
                      </Button>
                    ) : "—"}
                  </TableCell>
                  <TableCell><Badge className={statusColor[d.status] || ""}>{d.status}</Badge></TableCell>
                  <TableCell className="text-xs">{new Date(d.submitted_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {d.status === "pending" && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="text-green-400 hover:bg-green-500/10 text-xs gap-1 h-7"
                          onClick={() => updateStatus(d, "approved")} disabled={actionLoading === d.id}>
                          <CheckCircle size={12} /> Approve
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 text-xs gap-1 h-7"
                          onClick={() => updateStatus(d, "rejected")} disabled={actionLoading === d.id}>
                          <XCircle size={12} /> Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
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
              {uploading ? "Submitting…" : "Submit for Client Review"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDeliverables;
