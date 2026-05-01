import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Upload, Download, CheckCircle, XCircle, Clock, FileText, ChevronUp } from "lucide-react";
import { logAudit } from "@/lib/audit";
import { formatFileSize } from "@/lib/format";
import PortalError from "@/components/portal/PortalError";

const MSG_PAGE_SIZE = 50;

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
  const queryClient = useQueryClient();

  const [newMsg, setNewMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState("");
  const [messages, setMessages] = useState<{ id: string; content: string; sender_id: string; created_at: string }[]>([]);
  const [hasMoreMsgs, setHasMoreMsgs] = useState(false);
  const [loadingMoreMsgs, setLoadingMoreMsgs] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const initialScrollDone = useRef(false);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    staleTime: Infinity,
  });

  const { data: project, isLoading: projectLoading, error: projectError, refetch: refetchProject } = useQuery({
    queryKey: ["project", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("client_projects").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: milestones = [], refetch: refetchMilestones } = useQuery({
    queryKey: ["milestones", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await supabase.from("project_milestones").select("*").eq("project_id", id!).order("due_date");
      return data || [];
    },
  });

  const { data: files = [], refetch: refetchFiles } = useQuery({
    queryKey: ["projectFiles", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await supabase.from("project_files").select("*").eq("project_id", id!).order("created_at", { ascending: false });
      return data || [];
    },
  });

  // Initial message load (last MSG_PAGE_SIZE, oldest first)
  useEffect(() => {
    if (!id) return;
    initialScrollDone.current = false;
    supabase
      .from("messages")
      .select("*", { count: "exact" })
      .eq("project_id", id)
      .order("created_at", { ascending: false })
      .limit(MSG_PAGE_SIZE)
      .then(({ data, count }) => {
        const sorted = (data || []).slice().reverse();
        setMessages(sorted);
        setHasMoreMsgs((count || 0) > MSG_PAGE_SIZE);
      });
  }, [id]);

  // Auto-scroll to bottom on initial load and new messages
  useEffect(() => {
    if (messages.length === 0) return;
    if (!initialScrollDone.current) {
      chatEndRef.current?.scrollIntoView({ behavior: "auto" });
      initialScrollDone.current = true;
    } else {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Real-time messages
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`proj-msgs-${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `project_id=eq.${id}` },
        (payload) => setMessages((prev) => [...prev, payload.new as typeof prev[0]]))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const loadMoreMessages = async () => {
    if (!id || !hasMoreMsgs) return;
    setLoadingMoreMsgs(true);
    const oldest = messages[0];
    const { data, count } = await supabase
      .from("messages")
      .select("*", { count: "exact" })
      .eq("project_id", id)
      .lt("created_at", oldest.created_at)
      .order("created_at", { ascending: false })
      .limit(MSG_PAGE_SIZE);
    const sorted = (data || []).slice().reverse();
    setMessages((prev) => [...sorted, ...prev]);
    setHasMoreMsgs((count || 0) > MSG_PAGE_SIZE);
    setLoadingMoreMsgs(false);
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !id || !user) return;
    await supabase.from("messages").insert({ project_id: id, sender_id: user.id, content: newMsg.trim() });
    setNewMsg("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !id || !user) return;
    setUploading(true);
    for (const file of Array.from(e.target.files)) {
      const path = `${id}/${Date.now()}-${file.name}`;
      const { error: uploadErr } = await supabase.storage.from("project-attachments").upload(path, file);
      if (uploadErr) {
        toast({ title: `Failed to upload ${file.name}`, variant: "destructive" });
        continue;
      }
      await supabase.from("project_files").insert({
        project_id: id, uploaded_by: user.id, file_name: file.name,
        file_path: path, file_size: file.size, file_type: file.type,
      });
    }
    refetchFiles();
    setUploading(false);
    toast({ title: "Files uploaded" });
    e.target.value = "";
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    const { data } = await supabase.storage.from("project-attachments").createSignedUrl(filePath, 300);
    if (data?.signedUrl) {
      const a = document.createElement("a");
      a.href = data.signedUrl; a.download = fileName; a.click();
    }
  };

  const approveMilestone = async (msId: string) => {
    const milestone = milestones.find((m) => m.id === msId);
    await supabase.from("project_milestones").update({ status: "approved", completed_at: new Date().toISOString() }).eq("id", msId);
    await logAudit({ action: "approve", entity_type: "milestone", entity_id: msId, details: { title: milestone?.title, project_id: id } });
    refetchMilestones();
    toast({ title: "Milestone approved" });
  };

  const rejectMilestone = async (msId: string) => {
    if (!rejectComment.trim()) { toast({ title: "Please provide a reason", variant: "destructive" }); return; }
    const milestone = milestones.find((m) => m.id === msId);
    await supabase.from("project_milestones").update({ status: "pending" }).eq("id", msId);
    if (id && user) await supabase.from("messages").insert({ project_id: id, sender_id: user.id, content: `Milestone rejected: ${rejectComment}` });
    await logAudit({ action: "reject", entity_type: "milestone", entity_id: msId, details: { title: milestone?.title, reason: rejectComment, project_id: id } });
    setRejectId(null); setRejectComment("");
    refetchMilestones();
    toast({ title: "Milestone rejected" });
  };

  if (projectLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild><Link to="/client-portal/projects"><ArrowLeft size={18} /></Link></Button>
          <div className="animate-pulse h-7 w-56 bg-muted rounded" />
        </div>
        <div className="animate-pulse h-2 w-full bg-muted rounded-full" />
        <div className="animate-pulse h-64 w-full bg-muted rounded-xl" />
      </div>
    );
  }
  if (projectError || !project) return <PortalError onRetry={refetchProject} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="icon" asChild><Link to="/client-portal/projects"><ArrowLeft size={18} /></Link></Button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-bold text-2xl truncate">{project.title}</h1>
          {project.description && <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>}
        </div>
        <Badge className={statusColor[project.status] || ""}>{project.status}</Badge>
      </div>

      <div className="flex items-center gap-4">
        <Progress value={project.progress} className="h-2 flex-1" />
        <span className="text-sm font-medium w-10 text-right">{project.progress}%</span>
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

        {/* ── Milestones ── */}
        <TabsContent value="milestones" className="space-y-3 mt-4">
          {milestones.length === 0 ? (
            <div className="glass rounded-xl py-12 text-center">
              <Clock className="mx-auto text-muted-foreground mb-3" size={40} />
              <p className="text-sm text-muted-foreground">No milestones defined yet.</p>
            </div>
          ) : milestones.map((m) => (
            <Card key={m.id} className="glass">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    {m.status === "approved" ? <CheckCircle size={18} className="text-green-400" /> :
                     m.status === "review" ? <Clock size={18} className="text-accent" /> :
                     <Clock size={18} className="text-muted-foreground" />}
                    <div>
                      <p className="font-medium">{m.title}</p>
                      {m.due_date && <p className="text-xs text-muted-foreground">Due: {new Date(m.due_date).toLocaleDateString()}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={statusColor[m.status] || ""}>{m.status}</Badge>
                    {m.status === "review" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => approveMilestone(m.id)}>
                          <CheckCircle size={14} className="mr-1" /> Approve
                        </Button>
                        {rejectId === m.id ? (
                          <div className="flex gap-2 w-full mt-2">
                            <Input placeholder="Reason for rejection..." value={rejectComment} onChange={(e) => setRejectComment(e.target.value)} className="flex-1" />
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
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── Files ── */}
        <TabsContent value="files" className="space-y-4 mt-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" disabled={uploading} onClick={() => document.getElementById("file-upload")?.click()}>
              <Upload size={14} className="mr-1" /> {uploading ? "Uploading…" : "Upload Files"}
            </Button>
            <input id="file-upload" type="file" multiple hidden onChange={handleFileUpload} />
          </div>
          {files.length === 0 ? (
            <div className="glass rounded-xl py-12 text-center">
              <FileText className="mx-auto text-muted-foreground mb-3" size={40} />
              <p className="text-sm text-muted-foreground">No files uploaded yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((f) => (
                <Card key={f.id} className="glass">
                  <CardContent className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText size={18} className="text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{f.file_name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(f.file_size)} · {new Date(f.created_at).toLocaleDateString()}</p>
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

        {/* ── Discussion ── */}
        <TabsContent value="discussion" className="mt-4">
          <Card className="glass flex flex-col h-[min(60vh,500px)]">
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {hasMoreMsgs && (
                <div className="text-center">
                  <Button variant="ghost" size="sm" onClick={loadMoreMessages} disabled={loadingMoreMsgs} className="gap-1 text-xs">
                    <ChevronUp size={14} /> {loadingMoreMsgs ? "Loading…" : "Load earlier messages"}
                  </Button>
                </div>
              )}
              {messages.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No messages yet. Start the conversation!</p>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.sender_id === user?.id ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {m.content}
                  <div className="text-[10px] opacity-60 mt-1">{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="border-t border-border p-3 flex gap-2 shrink-0">
              <Input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} placeholder="Type a message…" onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()} />
              <Button onClick={sendMessage} size="icon"><Send size={16} /></Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetail;
