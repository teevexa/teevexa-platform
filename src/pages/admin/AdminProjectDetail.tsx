import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { logAudit } from "@/lib/audit";
import { Pencil, Plus, Trash2, UserPlus, MessageSquare, Send } from "lucide-react";

const statusOptions = ["planning", "in-progress", "review", "completed"];

const AdminProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Editing states
  const [editProject, setEditProject] = useState(false);
  const [projectForm, setProjectForm] = useState({ status: "", progress: 0, budget: "" });
  const [newNote, setNewNote] = useState("");
  const [showAssign, setShowAssign] = useState(false);
  const [assignUserId, setAssignUserId] = useState("");
  const [assignRole, setAssignRole] = useState("developer");

  const load = async () => {
    if (!id) return;
    const [pRes, tRes, mRes, aRes, nRes, uRes] = await Promise.all([
      supabase.from("client_projects").select("*").eq("id", id).single(),
      supabase.from("project_tasks").select("*").eq("project_id", id).order("created_at", { ascending: false }),
      supabase.from("project_milestones").select("*").eq("project_id", id).order("created_at", { ascending: false }),
      supabase.from("project_assignments").select("*").eq("project_id", id),
      supabase.from("project_notes").select("*").eq("project_id", id).order("created_at", { ascending: false }),
      supabase.from("profiles").select("user_id, display_name"),
    ]);
    setProject(pRes.data);
    setTasks(tRes.data as any[] || []);
    setMilestones(mRes.data || []);
    setAssignments(aRes.data as any[] || []);
    setNotes(nRes.data as any[] || []);
    setTeamMembers(uRes.data || []);
    if (pRes.data) {
      setProjectForm({ status: pRes.data.status, progress: pRes.data.progress, budget: pRes.data.budget || "" });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const userName = (uid: string | null) => {
    if (!uid) return "—";
    return teamMembers.find((u) => u.user_id === uid)?.display_name || uid.slice(0, 8);
  };

  const updateProject = async () => {
    if (!id) return;
    const { error } = await supabase.from("client_projects").update({
      status: projectForm.status,
      progress: projectForm.progress,
      budget: projectForm.budget || null,
    }).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    await logAudit({ action: "update", entity_type: "project", entity_id: id, details: { status: projectForm.status, progress: projectForm.progress } });
    toast({ title: "Project updated" });
    setEditProject(false); load();
  };

  const assignMember = async () => {
    if (!assignUserId || !id) return;
    const user = (await supabase.auth.getUser()).data.user;
    const { error } = await supabase.from("project_assignments").insert({
      project_id: id, user_id: assignUserId, role: assignRole, assigned_by: user?.id,
    });
    if (error) {
      toast({ title: error.message.includes("duplicate") ? "Already assigned" : "Error", description: error.message, variant: "destructive" });
      return;
    }
    await logAudit({ action: "assign", entity_type: "project", entity_id: id, details: { assigned_user: userName(assignUserId), role: assignRole } });
    toast({ title: "Team member assigned" });
    setShowAssign(false); setAssignUserId(""); load();
  };

  const removeAssignment = async (aId: string, uid: string) => {
    await supabase.from("project_assignments").delete().eq("id", aId);
    await logAudit({ action: "unassign", entity_type: "project", entity_id: id, details: { removed_user: userName(uid) } });
    toast({ title: "Member removed" }); load();
  };

  const addNote = async () => {
    if (!newNote.trim() || !id) return;
    const user = (await supabase.auth.getUser()).data.user;
    const { error } = await supabase.from("project_notes").insert({
      project_id: id, author_id: user?.id!, content: newNote.trim(), note_type: "feedback",
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setNewNote(""); load();
  };

  if (loading) return <p className="text-muted-foreground p-6">Loading...</p>;
  if (!project) return <p className="text-destructive p-6">Project not found.</p>;

  const tasksDone = tasks.filter((t) => t.status === "done").length;
  const milestonesDone = milestones.filter((m) => m.status === "completed").length;

  const statusColor: Record<string, string> = {
    planning: "bg-muted text-muted-foreground", "in-progress": "bg-primary/20 text-primary",
    review: "bg-accent/20 text-accent", completed: "bg-green-500/20 text-green-400",
    todo: "bg-muted text-muted-foreground", "in-review": "bg-accent/20 text-accent",
    done: "bg-green-500/20 text-green-400", pending: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl">{project.title}</h1>
          <p className="text-sm text-muted-foreground">{project.description || "No description"}</p>
        </div>
        <Button variant="outline" onClick={() => setEditProject(!editProject)}>
          <Pencil size={14} className="mr-1" /> Edit Project
        </Button>
      </div>

      {/* Project Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass"><CardContent className="pt-4 text-center">
          <Badge className={statusColor[project.status] || ""}>{project.status}</Badge>
          <p className="text-xs text-muted-foreground mt-1">Status</p>
        </CardContent></Card>
        <Card className="glass"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold">{project.progress}%</p>
          <Progress value={project.progress} className="h-2 mt-1" />
          <p className="text-xs text-muted-foreground mt-1">Progress</p>
        </CardContent></Card>
        <Card className="glass"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold">{tasksDone}/{tasks.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Tasks Done</p>
        </CardContent></Card>
        <Card className="glass"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold">{milestonesDone}/{milestones.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Milestones</p>
        </CardContent></Card>
      </div>

      {/* Edit project form */}
      {editProject && (
        <Card className="glass">
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Status</Label>
                <Select value={projectForm.status} onValueChange={(v) => setProjectForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{statusOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Progress (%)</Label>
                <Input type="number" min={0} max={100} value={projectForm.progress} onChange={(e) => setProjectForm((f) => ({ ...f, progress: Number(e.target.value) }))} />
              </div>
              <div><Label>Budget</Label>
                <Input value={projectForm.budget} onChange={(e) => setProjectForm((f) => ({ ...f, budget: e.target.value }))} placeholder="e.g. $5,000" />
              </div>
            </div>
            <Button onClick={updateProject}>Save Changes</Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="team" className="w-full">
        <TabsList>
          <TabsTrigger value="team">Team ({assignments.length})</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="milestones">Milestones ({milestones.length})</TabsTrigger>
          <TabsTrigger value="feedback">Feedback ({notes.length})</TabsTrigger>
        </TabsList>

        {/* Team tab */}
        <TabsContent value="team" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Assigned team members</p>
            <Button size="sm" onClick={() => setShowAssign(true)}><UserPlus size={14} className="mr-1" /> Assign Member</Button>
          </div>
          {assignments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No team members assigned yet.</p>
          ) : (
            <Card className="glass overflow-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Member</TableHead><TableHead>Role</TableHead><TableHead>Assigned</TableHead><TableHead></TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {assignments.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{userName(a.user_id)}</TableCell>
                      <TableCell><Badge variant="outline">{a.role}</Badge></TableCell>
                      <TableCell className="text-sm">{new Date(a.assigned_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeAssignment(a.id, a.user_id)}>
                          <Trash2 size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* Tasks tab */}
        <TabsContent value="tasks">
          {tasks.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No tasks yet. Create tasks from the Task Management page.</p>
          ) : (
            <Card className="glass overflow-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Task</TableHead><TableHead>Assigned</TableHead><TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead><TableHead>Due</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {tasks.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.title}</TableCell>
                      <TableCell className="text-sm">{userName(t.assigned_to)}</TableCell>
                      <TableCell><Badge className={
                        t.priority === "urgent" ? "bg-destructive/20 text-destructive" :
                        t.priority === "high" ? "bg-orange-500/20 text-orange-400" :
                        "bg-muted text-muted-foreground"
                      }>{t.priority}</Badge></TableCell>
                      <TableCell><Badge className={statusColor[t.status] || ""}>{t.status}</Badge></TableCell>
                      <TableCell className="text-sm">{t.due_date ? new Date(t.due_date).toLocaleDateString() : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* Milestones tab */}
        <TabsContent value="milestones">
          {milestones.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No milestones yet.</p>
          ) : (
            <Card className="glass overflow-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Milestone</TableHead><TableHead>Status</TableHead><TableHead>Due</TableHead><TableHead>Completed</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {milestones.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.title}</TableCell>
                      <TableCell><Badge className={statusColor[m.status] || ""}>{m.status}</Badge></TableCell>
                      <TableCell className="text-sm">{m.due_date ? new Date(m.due_date).toLocaleDateString() : "—"}</TableCell>
                      <TableCell className="text-sm">{m.completed_at ? new Date(m.completed_at).toLocaleDateString() : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* Feedback tab */}
        <TabsContent value="feedback" className="space-y-4">
          <div className="flex gap-2">
            <Textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Write feedback or notes about this project..." className="flex-1" rows={2} />
            <Button onClick={addNote} disabled={!newNote.trim()} className="self-end"><Send size={14} className="mr-1" /> Send</Button>
          </div>
          {notes.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No feedback yet.</p>
          ) : (
            <div className="space-y-3">
              {notes.map((n) => (
                <Card key={n.id} className="glass">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">{userName(n.author_id)}</p>
                        <p className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{n.note_type}</Badge>
                    </div>
                    <p className="mt-2 text-sm">{n.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Assign dialog */}
      <Dialog open={showAssign} onOpenChange={setShowAssign}>
        <DialogContent className="glass">
          <DialogHeader><DialogTitle>Assign Team Member</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Member</Label>
              <Select value={assignUserId} onValueChange={setAssignUserId}>
                <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                <SelectContent>{teamMembers.map((u) => <SelectItem key={u.user_id} value={u.user_id}>{u.display_name || u.user_id.slice(0, 8)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Role</Label>
              <Select value={assignRole} onValueChange={setAssignRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="project_manager">Project Manager</SelectItem>
                  <SelectItem value="designer">Designer</SelectItem>
                  <SelectItem value="qa">QA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full glow-primary" onClick={assignMember}>Assign</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProjectDetail;
