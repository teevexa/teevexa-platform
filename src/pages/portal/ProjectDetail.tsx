import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Upload, Download, CheckCircle, XCircle, Clock, FileText } from "lucide-react";

interface Project {
  id: string; title: string; description: string | null; status: string;
  progress: number; start_date: string | null; end_date: string | null;
}
interface Milestone {
  id: string; title: string; status: string; due_date: string | null; completed_at: string | null;
}
interface ProjectFile {
  id: string; file_name: string; file_type: string | null; file_size: number; created_at: string; file_path: string;
}
interface Message {
  id: string; content: string; sender_id: string; created_at: string;
}

const statusColor: Record<string, string> = {
  planning: "bg-muted text-muted-foreground",
  "in-progress": "bg-primary/20 text-primary",
  review: "bg-accent/20 text-accent",
  completed: "bg-green-500/20 text-green-400",
  pending: "bg-muted text-muted-foreground",
  approved: "bg-green-500/20 text-green-400",
};

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [userId, setUserId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState("");

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const [pRes, mRes, fRes, msgRes] = await Promise.all([
        supabase.from("client_projects").select("*").eq("id", id).single(),
        supabase.from("project_milestones").select("*").eq("project_id", id).order("due_date"),
        supabase.from("project_files").select("*").eq("project_id", id).order("created_at", { ascending: false }),
        supabase.from("messages").select("*").eq("project_id", id).order("created_at"),
      ]);
      setProject(pRes.data);
      setMilestones(mRes.data || []);
      setFiles(fRes.data || []);
      setMessages(msgRes.data || []);
    };
    load();

    const channel = supabase
      .channel(`proj-msgs-${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `project_id=eq.${id}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Message]))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !id) return;
    await supabase.from("messages").insert({ project_id: id, sender_id: userId, content: newMsg.trim() });
    setNewMsg("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !id) return;
    setUploading(true);
    for (const file of Array.from(e.target.files)) {
      const path = `${id}/${Date.now()}-${file.name}`;
      const { error: uploadErr } = await supabase.storage.from("project-attachments").upload(path, file);
      if (!uploadErr) {
        await supabase.from("project_files").insert({
          project_id: id, uploaded_by: userId, file_name: file.name,
          file_path: path, file_size: file.size, file_type: file.type,
        });
      }
    }
    const { data } = await supabase.from("project_files").select("*").eq("project_id", id).order("created_at", { ascending: false });
    setFiles(data || []);
    setUploading(false);
    toast({ title: "Files uploaded" });
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    const { data } = await supabase.storage.from("project-attachments").createSignedUrl(filePath, 300);
    if (data?.signedUrl) {
      const a = document.createElement("a");
      a.href = data.signedUrl; a.download = fileName; a.click();
    }
  };

  const approveMilestone = async (msId: string) => {
    await supabase.from("project_milestones").update({ status: "approved", completed_at: new Date().toISOString() }).eq("id", msId);
    setMilestones((prev) => prev.map((m) => m.id === msId ? { ...m, status: "approved", completed_at: new Date().toISOString() } : m));
    toast({ title: "Milestone approved" });
  };

  const rejectMilestone = async (msId: string) => {
    if (!rejectComment.trim()) { toast({ title: "Please provide a reason", variant: "destructive" }); return; }
    await supabase.from("project_milestones").update({ status: "pending" }).eq("id", msId);
    if (id) await supabase.from("messages").insert({ project_id: id, sender_id: userId, content: `Milestone rejected: ${rejectComment}` });
    setMilestones((prev) => prev.map((m) => m.id === msId ? { ...m, status: "pending" } : m));
    setRejectId(null); setRejectComment("");
    toast({ title: "Milestone rejected" });
  };

  if (!project) return <div className="animate-pulse-glow text-primary p-8">Loading...</div>;

  const formatSize = (bytes: number) => bytes < 1024 ? `${bytes}B` : bytes < 1048576 ? `${(bytes/1024).toFixed(1)}KB` : `${(bytes/1048576).toFixed(1)}MB`;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link to="/client-portal/projects"><ArrowLeft size={18} /></Link></Button>
        <div className="flex-1">
          <h1 className="font-display font-bold text-2xl">{project.title}</h1>
          {project.description && <p className="text-sm text-muted-foreground">{project.description}</p>}
        </div>
        <Badge className={statusColor[project.status] || ""}>{project.status}</Badge>
      </div>

      <div className="flex items-center gap-4">
        <Progress value={project.progress} className="h-2 flex-1" />
        <span className="text-sm font-medium">{project.progress}%</span>
      </div>

      <div className="flex gap-4 text-sm text-muted-foreground">
        {project.start_date && <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>}
        {project.end_date && <span>Est. End: {new Date(project.end_date).toLocaleDateString()}</span>}
      </div>

      <Tabs defaultValue="milestones">
        <TabsList className="glass">
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="discussion">Discussion</TabsTrigger>
        </TabsList>

        <TabsContent value="milestones" className="space-y-3 mt-4">
          {milestones.length === 0 ? (
            <p className="text-sm text-muted-foreground">No milestones defined yet.</p>
          ) : milestones.map((m) => (
            <Card key={m.id} className="glass">
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {m.status === "approved" ? <CheckCircle size={18} className="text-green-400" /> :
                   m.status === "review" ? <Clock size={18} className="text-accent" /> :
                   <Clock size={18} className="text-muted-foreground" />}
                  <div>
                    <p className="font-medium">{m.title}</p>
                    {m.due_date && <p className="text-xs text-muted-foreground">Due: {new Date(m.due_date).toLocaleDateString()}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColor[m.status] || ""}>{m.status}</Badge>
                  {m.status === "review" && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => approveMilestone(m.id)}>
                        <CheckCircle size={14} className="mr-1" /> Approve
                      </Button>
                      {rejectId === m.id ? (
                        <div className="flex gap-2">
                          <Input placeholder="Reason..." value={rejectComment} onChange={(e) => setRejectComment(e.target.value)} className="w-40" />
                          <Button size="sm" variant="destructive" onClick={() => rejectMilestone(m.id)}>Send</Button>
                          <Button size="sm" variant="ghost" onClick={() => setRejectId(null)}>Cancel</Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => setRejectId(m.id)}>
                          <XCircle size={14} className="mr-1" /> Reject
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="files" className="space-y-4 mt-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" disabled={uploading} onClick={() => document.getElementById("file-upload")?.click()}>
              <Upload size={14} className="mr-1" /> {uploading ? "Uploading..." : "Upload Files"}
            </Button>
            <input id="file-upload" type="file" multiple hidden onChange={handleFileUpload} />
          </div>
          {files.length === 0 ? (
            <p className="text-sm text-muted-foreground">No files uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {files.map((f) => (
                <Card key={f.id} className="glass">
                  <CardContent className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-primary" />
                      <div>
                        <p className="text-sm font-medium">{f.file_name}</p>
                        <p className="text-xs text-muted-foreground">{formatSize(f.file_size)} · {new Date(f.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => downloadFile(f.file_path, f.file_name)}>
                      <Download size={16} />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="discussion" className="mt-4">
          <Card className="glass flex flex-col" style={{ height: "50vh" }}>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.sender_id === userId ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {m.content}
                  <div className="text-[10px] opacity-60 mt-1">{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-border p-3 flex gap-2">
              <Input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} placeholder="Type a message..." onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
              <Button onClick={sendMessage} size="icon"><Send size={16} /></Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetail;
