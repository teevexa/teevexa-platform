import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, MessageSquare, Send, LifeBuoy } from "lucide-react";

interface Ticket {
  id: string; subject: string; description: string; category: string;
  priority: string; status: string; created_at: string; closed_at: string | null;
}
interface Reply {
  id: string; content: string; sender_id: string; created_at: string;
}

const statusColor: Record<string, string> = {
  open: "bg-accent/20 text-accent",
  "in-progress": "bg-primary/20 text-primary",
  resolved: "bg-green-500/20 text-green-400",
  closed: "bg-muted text-muted-foreground",
};

const SupportTickets = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState("");
  const [form, setForm] = useState({ subject: "", description: "", category: "general", priority: "medium" });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase.from("support_tickets").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setTickets(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const createTicket = async () => {
    if (!form.subject.trim() || !form.description.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" }); return;
    }
    const { data, error } = await supabase.from("support_tickets").insert({
      user_id: userId, ...form,
    }).select().single();
    if (error) { toast({ title: "Error creating ticket", variant: "destructive" }); return; }
    setTickets((prev) => [data, ...prev]);
    setForm({ subject: "", description: "", category: "general", priority: "medium" });
    setShowNew(false);
    toast({ title: "Ticket created" });
  };

  const openTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    const { data } = await supabase.from("ticket_replies").select("*").eq("ticket_id", ticket.id).order("created_at");
    setReplies(data || []);
  };

  const sendReply = async () => {
    if (!newReply.trim() || !selectedTicket) return;
    const { data } = await supabase.from("ticket_replies").insert({
      ticket_id: selectedTicket.id, sender_id: userId, content: newReply.trim(),
    }).select().single();
    if (data) setReplies((prev) => [...prev, data]);
    setNewReply("");
  };

  if (loading) return <div className="animate-pulse-glow text-primary p-8">Loading...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Support Tickets</h1>
        <Button onClick={() => setShowNew(true)}><Plus size={16} className="mr-1" /> New Ticket</Button>
      </div>

      {tickets.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-12 text-center">
            <LifeBuoy className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground">No support tickets yet.</p>
            <Button className="mt-4" onClick={() => setShowNew(true)}>Create Your First Ticket</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {tickets.map((t) => (
            <Card key={t.id} className="glass cursor-pointer hover:border-primary/30 transition-colors" onClick={() => openTicket(t)}>
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare size={18} className="text-primary" />
                  <div>
                    <p className="font-medium">{t.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.category} · {new Date(t.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{t.priority}</Badge>
                  <Badge className={statusColor[t.status] || ""}>{t.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Ticket Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="glass">
          <DialogHeader><DialogTitle>Create Support Ticket</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            <Textarea placeholder="Describe your issue..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={createTicket}>Submit Ticket</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="glass max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.subject}</DialogTitle>
            <div className="flex gap-2 mt-1">
              <Badge variant="outline">{selectedTicket?.category}</Badge>
              <Badge className={statusColor[selectedTicket?.status || ""] || ""}>{selectedTicket?.status}</Badge>
            </div>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{selectedTicket?.description}</p>
          <div className="flex-1 overflow-auto space-y-3 border-t border-border pt-3 min-h-[200px]">
            {replies.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No replies yet</p>
            ) : replies.map((r) => (
              <div key={r.id} className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${r.sender_id === userId ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"}`}>
                {r.content}
                <div className="text-[10px] opacity-60 mt-1">{new Date(r.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
            ))}
          </div>
          {selectedTicket?.status !== "closed" && (
            <div className="border-t border-border pt-3 flex gap-2">
              <Input value={newReply} onChange={(e) => setNewReply(e.target.value)} placeholder="Type a reply..." onKeyDown={(e) => e.key === "Enter" && sendReply()} />
              <Button onClick={sendReply} size="icon"><Send size={16} /></Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportTickets;
