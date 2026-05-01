import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PortalError from "@/components/portal/PortalError";
import { ChatSkeleton } from "@/components/portal/PortalSkeleton";

interface Message {
  id: string; content: string; sender_id: string; created_at: string; attachment_url: string | null;
}

const Messages = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [selectedProject, setSelectedProject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    staleTime: Infinity,
  });

  const { data: projects = [], isLoading, error, refetch } = useQuery({
    queryKey: ["projects", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("client_projects").select("id, title").eq("user_id", user!.id);
      if (error) throw error;
      return data || [];
    },
  });

  // Auto-select first project
  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0].id);
    }
  }, [projects, selectedProject]);

  // Load messages when project changes
  useEffect(() => {
    if (!selectedProject) return;
    setLoadingMsgs(true);
    supabase.from("messages").select("*").eq("project_id", selectedProject)
      .order("created_at", { ascending: true })
      .then(async ({ data }) => {
        const msgs = (data || []) as Message[];
        setMessages(msgs);
        setLoadingMsgs(false);

        // Scroll to bottom after load
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "auto" }), 50);

        // Load profiles
        const senderIds = [...new Set(msgs.map((m) => m.sender_id))];
        if (senderIds.length > 0) {
          const { data: profileData } = await supabase.from("profiles").select("user_id, display_name").in("user_id", senderIds);
          const map: Record<string, string> = {};
          (profileData || []).forEach((p) => { map[p.user_id] = p.display_name || "Team Member"; });
          setProfiles(map);
        }
      });

    const channel = supabase
      .channel(`messages-${selectedProject}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `project_id=eq.${selectedProject}` },
        async (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) => [...prev, msg]);
          chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
          if (msg.sender_id && !profiles[msg.sender_id]) {
            const { data } = await supabase.from("profiles").select("user_id, display_name").eq("user_id", msg.sender_id).single();
            if (data) setProfiles((prev) => ({ ...prev, [data.user_id]: data.display_name || "Team Member" }));
          }
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedProject]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedProject || !user) return;
    await supabase.from("messages").insert({ project_id: selectedProject, sender_id: user.id, content: newMessage.trim() });
    setNewMessage("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !selectedProject || !user) return;
    setUploading(true);
    for (const file of Array.from(e.target.files)) {
      const path = `${selectedProject}/${Date.now()}-${file.name}`;
      const { error: uploadErr } = await supabase.storage.from("project-attachments").upload(path, file);
      if (uploadErr) { toast({ title: "Upload failed", description: uploadErr.message, variant: "destructive" }); continue; }
      await supabase.from("project_files").insert({ project_id: selectedProject, uploaded_by: user.id, file_name: file.name, file_path: path, file_size: file.size, file_type: file.type });
      await supabase.from("messages").insert({ project_id: selectedProject, sender_id: user.id, content: `📎 Shared a file: ${file.name}`, attachment_url: path });
    }
    setUploading(false);
    e.target.value = "";
    toast({ title: "File(s) shared" });
  };

  if (error) return <PortalError onRetry={refetch} />;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in gap-4">
      <h1 className="font-display font-bold text-2xl shrink-0">Messages</h1>

      {isLoading ? (
        <div className="flex-1 glass rounded-xl overflow-hidden"><ChatSkeleton /></div>
      ) : projects.length === 0 ? (
        <Card className="glass flex-1 flex items-center justify-center">
          <div className="text-center py-12">
            <MessageSquare className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="font-medium mb-1">No active projects</p>
            <p className="text-sm text-muted-foreground">Messages will appear once a project is assigned.</p>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
          {/* Project sidebar */}
          <div className="lg:w-56 shrink-0 space-y-1 lg:overflow-y-auto">
            <p className="text-xs text-muted-foreground px-2 mb-2 uppercase tracking-wider">Projects</p>
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProject(p.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  selectedProject === p.id ? "bg-primary/20 text-primary font-medium" : "hover:bg-muted"
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>

          {/* Chat panel — fills remaining height, input pinned to bottom */}
          <Card className="glass flex flex-col flex-1 min-h-0">
            <div className="border-b border-border px-4 py-3 shrink-0">
              <p className="font-medium text-sm">{projects.find((p) => p.id === selectedProject)?.title || "Select a project"}</p>
              <p className="text-xs text-muted-foreground">Visible to admins, project managers, and assigned developers</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {loadingMsgs ? (
                <ChatSkeleton />
              ) : messages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No messages yet. Start the conversation!</p>
              ) : messages.map((m) => {
                const isOwn = m.sender_id === user?.id;
                return (
                  <div key={m.id} className={`max-w-[80%] ${isOwn ? "ml-auto" : ""}`}>
                    {!isOwn && (
                      <p className="text-[11px] text-muted-foreground mb-1 px-1">{profiles[m.sender_id] || "Team Member"}</p>
                    )}
                    <div className={`rounded-lg px-3 py-2 text-sm ${isOwn ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      {m.attachment_url ? (
                        <div className="flex items-center gap-2"><FileText size={14} /><span>{m.content}</span></div>
                      ) : m.content}
                      <div className="text-[10px] opacity-60 mt-1">
                        {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <div className="border-t border-border p-3 flex gap-2 shrink-0">
              <Button variant="ghost" size="icon" disabled={uploading} onClick={() => document.getElementById("msg-file-upload")?.click()} title="Share a file">
                <Upload size={16} />
              </Button>
              <input id="msg-file-upload" type="file" multiple hidden onChange={handleFileUpload} />
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message…"
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                className="flex-1"
              />
              <Button onClick={sendMessage} size="icon"><Send size={16} /></Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Messages;
