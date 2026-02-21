import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Milestone, Pencil, Trash2 } from "lucide-react";

interface MilestoneRow {
  id: string; title: string; status: string; due_date: string | null;
  completed_at: string | null; project_id: string; created_at: string;
}
interface ProjectOption { id: string; title: string; }

const statusOptions = ["pending", "in-progress", "review", "completed"];

const AdminMilestones = () => {
  const { toast } = useToast();
  const [milestones, setMilestones] = useState<MilestoneRow[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", project_id: "", status: "pending", due_date: "" });

  const load = async () => {
    const [mRes, pRes] = await Promise.all([
      supabase.from("project_milestones").select("*").order("created_at", { ascending: false }),
      supabase.from("client_projects").select("id, title"),
    ]);
    setMilestones(mRes.data || []);
    setProjects(pRes.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const projectName = (id: string) => projects.find((p) => p.id === id)?.title || "—";

  const openCreate = () => { setEditing(null); setForm({ title: "", project_id: "", status: "pending", due_date: "" }); setShowEditor(true); };
  const openEdit = (m: MilestoneRow) => {
    setEditing(m.id);
    setForm({ title: m.title, project_id: m.project_id, status: m.status, due_date: m.due_date || "" });
    setShowEditor(true);
  };

  const save = async () => {
    if (!form.title.trim() || !form.project_id) { toast({ title: "Title and project required", variant: "destructive" }); return; }
    const payload = {
      title: form.title.trim(), project_id: form.project_id, status: form.status,
      due_date: form.due_date || null,
      completed_at: form.status === "completed" ? new Date().toISOString() : null,
    };
    const { error } = editing
      ? await supabase.from("project_milestones").update(payload).eq("id", editing)
      : await supabase.from("project_milestones").insert(payload);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: editing ? "Milestone updated" : "Milestone created" });
    setShowEditor(false); load();
  };

  const deleteMilestone = async (id: string) => {
    if (!confirm("Delete this milestone?")) return;
    await supabase.from("project_milestones").delete().eq("id", id);
    toast({ title: "Milestone deleted" }); load();
  };

  const statusColor: Record<string, string> = {
    pending: "bg-muted text-muted-foreground", "in-progress": "bg-primary/20 text-primary",
    review: "bg-accent/20 text-accent", completed: "bg-green-500/20 text-green-400",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Milestones</h1>
        <Button onClick={openCreate}><Plus size={16} className="mr-1" /> New Milestone</Button>
      </div>

      {loading ? <p className="text-muted-foreground">Loading...</p> : milestones.length === 0 ? (
        <Card className="glass"><CardContent className="py-12 text-center">
          <Milestone className="mx-auto text-muted-foreground mb-4" size={48} />
          <p className="text-muted-foreground">No milestones yet.</p>
        </CardContent></Card>
      ) : (
        <Card className="glass overflow-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Title</TableHead><TableHead>Project</TableHead><TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead><TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {milestones.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.title}</TableCell>
                  <TableCell>{projectName(m.project_id)}</TableCell>
                  <TableCell><Badge className={statusColor[m.status] || ""}>{m.status}</Badge></TableCell>
                  <TableCell>{m.due_date ? new Date(m.due_date).toLocaleDateString() : "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(m)}><Pencil size={14} /></Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteMilestone(m.id)} className="text-destructive"><Trash2 size={14} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="glass">
          <DialogHeader><DialogTitle>{editing ? "Edit Milestone" : "New Milestone"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Project *</Label>
              <Select value={form.project_id} onValueChange={(v) => setForm((f) => ({ ...f, project_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{statusOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} /></div>
            <Button className="w-full glow-primary" onClick={save}>{editing ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMilestones;
