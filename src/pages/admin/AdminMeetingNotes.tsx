import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NotebookText, Plus, Pencil, Trash2, Inbox, CheckSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MeetingNote {
  id: string;
  project_id: string;
  title: string;
  meeting_date: string;
  attendees: string[];
  summary: string;
  action_items: string[];
  created_at: string;
}

const emptyForm = {
  project_id: "",
  title: "",
  meeting_date: new Date().toISOString().split("T")[0],
  attendees: "",
  summary: "",
  action_items: "",
};

const AdminMeetingNotes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [projectFilter, setProjectFilter] = useState("all");
  const [form, setForm] = useState(emptyForm);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data: projects = [] } = useQuery({
    queryKey: ["all-projects-select"],
    queryFn: async () => {
      const { data } = await supabase.from("client_projects").select("id, title");
      return data || [];
    },
  });

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["admin-meeting-notes", projectFilter],
    queryFn: async () => {
      let q = supabase.from("meeting_notes").select("*").order("meeting_date", { ascending: false });
      if (projectFilter !== "all") q = q.eq("project_id", projectFilter);
      const { data } = await q;
      return (data || []) as MeetingNote[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        project_id: form.project_id,
        title: form.title,
        meeting_date: form.meeting_date,
        attendees: form.attendees.split(",").map((s) => s.trim()).filter(Boolean),
        summary: form.summary,
        action_items: form.action_items.split("\n").map((s) => s.trim()).filter(Boolean),
        created_by: user?.id,
      };
      if (editId) {
        await supabase.from("meeting_notes").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editId);
      } else {
        await supabase.from("meeting_notes").insert([payload]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-meeting-notes"] });
      toast({ title: editId ? "Notes updated" : "Meeting notes saved" });
      setDialogOpen(false);
      setEditId(null);
      setForm(emptyForm);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteNote = async (id: string) => {
    setDeleting(id);
    await supabase.from("meeting_notes").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin-meeting-notes"] });
    setDeleting(null);
    toast({ title: "Meeting note deleted" });
  };

  const openEdit = (n: MeetingNote) => {
    setEditId(n.id);
    setForm({
      project_id: n.project_id,
      title: n.title,
      meeting_date: n.meeting_date,
      attendees: n.attendees.join(", "),
      summary: n.summary,
      action_items: n.action_items.join("\n"),
    });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const getProjectTitle = (id: string) => projects.find((p) => p.id === id)?.title || "—";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl">Meeting Notes</h1>
          <p className="text-sm text-muted-foreground mt-1">Notes and action items from client calls</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button className="glow-primary" onClick={openNew}>
            <Plus size={16} className="mr-2" /> Add Notes
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : notes.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-16 text-center">
            <Inbox className="mx-auto text-muted-foreground mb-4 opacity-40" size={48} />
            <p className="font-display font-semibold mb-1">No meeting notes yet</p>
            <p className="text-sm text-muted-foreground">Add notes after each client call so they appear in the client portal.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Action Items</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notes.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="font-medium">{n.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{getProjectTitle(n.project_id)}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(n.meeting_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </TableCell>
                  <TableCell>
                    {n.action_items?.length > 0 ? (
                      <span className="flex items-center gap-1.5 text-xs text-primary/80">
                        <CheckSquare size={12} /> {n.action_items.length}
                      </span>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(n)}>
                        <Pencil size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={deleting === n.id} onClick={() => deleteNote(n.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditId(null); setForm(emptyForm); } }}>
        <DialogContent className="glass max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <NotebookText size={18} className="text-primary" />
              {editId ? "Edit Meeting Notes" : "Add Meeting Notes"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Project *</Label>
                <Select value={form.project_id} onValueChange={(v) => setForm((f) => ({ ...f, project_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Meeting Date *</Label>
                <Input type="date" value={form.meeting_date} onChange={(e) => setForm((f) => ({ ...f, meeting_date: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Sprint Review — Week 4" />
            </div>
            <div className="space-y-1.5">
              <Label>Attendees</Label>
              <Input value={form.attendees} onChange={(e) => setForm((f) => ({ ...f, attendees: e.target.value }))} placeholder="Benjamin Baya, Alex Smith (comma-separated)" />
            </div>
            <div className="space-y-1.5">
              <Label>Summary *</Label>
              <Textarea rows={4} value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} placeholder="What was discussed, decisions made, blockers raised…" />
            </div>
            <div className="space-y-1.5">
              <Label>Action Items</Label>
              <Textarea rows={4} value={form.action_items} onChange={(e) => setForm((f) => ({ ...f, action_items: e.target.value }))} placeholder={"One action item per line:\nReview the staging environment\nSend revised copy by Friday"} />
              <p className="text-xs text-muted-foreground">One item per line. These appear as a numbered checklist for the client.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); setEditId(null); setForm(emptyForm); }}>Cancel</Button>
            <Button className="glow-primary" disabled={!form.project_id || !form.title || !form.summary || saveMutation.isPending} onClick={() => saveMutation.mutate()}>
              {saveMutation.isPending ? "Saving…" : editId ? "Save Changes" : "Save Notes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMeetingNotes;
