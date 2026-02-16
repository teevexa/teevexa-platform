import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

const Messages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState<string>("");

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
      setMessages(data || []);
    };
    loadMessages();

    // Realtime subscription
    const channel = supabase
      .channel(`messages-${selectedProject}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `project_id=eq.${selectedProject}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedProject]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedProject) return;
    await supabase.from("messages").insert({
      project_id: selectedProject,
      sender_id: userId,
      content: newMessage.trim(),
    });
    setNewMessage("");
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
          <Card className="glass flex flex-col" style={{ height: "60vh" }}>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    m.sender_id === userId
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {m.content}
                  <div className="text-[10px] opacity-60 mt-1">
                    {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border p-3 flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button onClick={sendMessage} size="icon">
                <Send size={16} />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Messages;
