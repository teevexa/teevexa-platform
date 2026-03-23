import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  attachment_url: string | null;
}

const Messages = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: projectData } = await supabase.from("client_projects").select("id, title");
      setProjects(projectData || []);
      if (projectData && projectData.length > 0) {
        setSelectedProject(projectData[0].id);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedProject) return;

    const loadMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("project_id", selectedProject)
        .order("created_at", { ascending: true });
      const msgs = (data || []) as Message[];
      setMessages(msgs);

      // Load sender profiles
      const senderIds = [...new Set(msgs.map((m) => m.sender_id))];
      if (senderIds.length > 0) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", senderIds);
        const map: Record<string, string> = {};
        (profileData || []).forEach((p) => { map[p.user_id] = p.display_name || "Team Member"; });
        setProfiles(map);
      }
    };
    loadMessages();

    const channel = supabase
      .channel(`messages-${selectedProject}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `project_id=eq.${selectedProject}`,
      }, async (payload) => {
        const msg = payload.new as Message;
        setMessages((prev) => [...prev, msg]);
        // Load profile for new sender if needed
        if (!profiles[msg.sender_id]) {
          const { data } = await supabase
            .from("profiles")
            .select("user_id, display_name")
            .eq("user_id", msg.sender_id)
            .single();
          if (data) {
            setProfiles((prev) => ({ ...prev, [data.user_id]: data.display_name || "Team Member" }));
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedProject]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedProject) return;
    await supabase.from("messages").insert({
      project_id: selectedProject,
      sender_id: userId,
      content: newMessage.trim(),
    });
    setNewMessage("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !selectedProject) return;
    setUploading(true);
    for (const file of Array.from(e.target.files)) {
      const path = `${selectedProject}/${Date.now()}-${file.name}`;
      const { error: uploadErr } = await supabase.storage.from("project-attachments").upload(path, file);
      if (uploadErr) {
        toast({ title: "Upload failed", description: uploadErr.message, variant: "destructive" });
        continue;
      }
      // Save file record
      await supabase.from("project_files").insert({
        project_id: selectedProject,
        uploaded_by: userId,
        file_name: file.name,
        file_path: path,
        file_size: file.size,
        file_type: file.type,
      });
      // Send a message about the file
      await supabase.from("messages").insert({
        project_id: selectedProject,
        sender_id: userId,
        content: `📎 Shared a file: ${file.name}`,
        attachment_url: path,
      });
    }
    setUploading(false);
    toast({ title: "File(s) shared successfully" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display font-bold text-2xl">Messages</h1>

      {projects.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-12 text-center">
            <MessageSquare className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground">No active projects. Messages will appear once a project is assigned.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-[250px_1fr] gap-4">
          {/* Project list */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground px-3 mb-2 uppercase tracking-wider">Projects</p>
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProject(p.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedProject === p.id ? "bg-primary/20 text-primary font-medium" : "hover:bg-muted"
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>

          {/* Chat */}
          <Card className="glass flex flex-col" style={{ height: "65vh" }}>
            <div className="border-b border-border px-4 py-3">
              <p className="font-medium text-sm">
                {projects.find((p) => p.id === selectedProject)?.title || "Select a project"}
              </p>
              <p className="text-xs text-muted-foreground">
                Messages are visible to admins, project managers, and assigned developers
              </p>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {messages.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No messages yet. Start the conversation!</p>
              )}
              {messages.map((m) => {
                const isOwn = m.sender_id === userId;
                return (
                  <div key={m.id} className={`max-w-[80%] ${isOwn ? "ml-auto" : ""}`}>
                    {!isOwn && (
                      <p className="text-[11px] text-muted-foreground mb-1 px-1">
                        {profiles[m.sender_id] || "Team Member"}
                      </p>
                    )}
                    <div className={`rounded-lg px-3 py-2 text-sm ${
                      isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}>
                      {m.attachment_url ? (
                        <div className="flex items-center gap-2">
                          <FileText size={14} />
                          <span>{m.content}</span>
                        </div>
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
            <div className="border-t border-border p-3 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                disabled={uploading}
                onClick={() => document.getElementById("msg-file-upload")?.click()}
                title="Share a file"
              >
                <Upload size={16} />
              </Button>
              <input id="msg-file-upload" type="file" multiple hidden onChange={handleFileUpload} />
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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
