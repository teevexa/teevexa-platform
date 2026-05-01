import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { CardRowSkeleton } from "@/components/portal/PortalSkeleton";
import PortalError from "@/components/portal/PortalError";

interface Ticket {
  id: string; subject: string; description: string; category: string;
  priority: string; status: string; created_at: string; closed_at: string | null;
}
interface Reply { id: string; content: string; sender_id: string; created_at: string; }

const statusColor: Record<string, string> = {
  open: "bg-accent/20 text-accent",
  "in-progress": "bg-primary/20 text-primary",
  resolved: "bg-green-500/20 text-green-400",
  closed: "bg-muted text-muted-foreground",
};
const priorityColor: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-yellow-500/20 text-yellow-400",
  high: "bg-orange-500/20 text-orange-400",
  urgent: "bg-destructive/20 text-destructive",
};

const SupportTickets = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState("");
  const [form, setForm] = useState({ subject: "", description: "", category: "general", priority: "medium" });
  const [submitting, setSubmitting] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    staleTime: Infinity,
  });

  const { data: tickets = [], isLoading, error, refetch } = useQuery<Ticket[]>({
    queryKey: ["tickets", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets").select("*")
        .eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Ticket[];
    },
  });

  // Real-time ticket status updates
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel("tickets-realtime")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "support_tickets" },
        (payload) => {
          queryClient.setQueryData<Ticket[]>(["tickets", user.id], (prev) =>
            (prev || []).map((t) => t.id === payload.new.id ? { ...t, ...payload.new as Ticket } : t)
          );
          // Also update selectedTicket if open
          setSelectedTicket((prev) =>
            prev?.id === payload.new.id ? { ...prev, ...payload.new as Ticket } : prev
          );
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, queryClient]);

  // Real-time replies when a ticket is open
  useEffect(() => {
    if (!selectedTicket) return;
    const channel = supabase
      .channel(`replies-${selectedTicket.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ticket_replies", filter: `ticket_id=eq.${selectedTicket.id}` },
        (payload) => setReplies((prev) => [...prev, payload.new as Reply]))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedTicket?.id]);

  const openTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    const { data } = await supabase.from("ticket_replies").select("*").eq("ticket_id", ticket.id).order("created_at");
    setReplies(data || []);
  };

  const createTicket = async () => {
    if (!form.subject.trim() || !form.description.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" }); return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.from("support_tickets").insert({ user_id: user?.id, ...form }).select().single();
    setSubmitting(false);
    if (error) { toast({ title: "Error creating ticket", variant: "destructive" }); return; }
    queryClient.setQueryData<Ticket[]>(["tickets", user?.id], (prev) => [data as Ticket, ...(prev || [])]);
    setForm({ subject: "", description: "", category: "general", priority: "medium" });
    setShowNew(false);
    toast({ title: "Ticket created", description: "We'll respond within 24 hours." });
  };

  const sendReply = async () => {
    if (!newReply.trim() || !selectedTicket || !user) return;
    const { data } = await supabase.from("ticket_replies").insert({
      ticket_id: selectedTicket.id, sender_id: user.id, content: newReply.trim(),
    }).select().single();
    if (data) setReplies((prev) => [...prev, data as Reply]);
    setNewReply("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Support</h1>
        <Button onClick={() => setShowNew(true)}><Plus size={16} className="mr-1" /> New Ticket</Button>
      </div>

      {isLoading ? (
        <CardRowSkeleton rows={4} />
      ) : error ? (
        <PortalError onRetry={refetch} />
      ) : tickets.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-16 text-center">
            <LifeBuoy className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="font-medium mb-1">No support tickets yet</p>
            <p className="text-sm text-muted-foreground mb-4">Open a ticket and our team will respond within 24 hours.</p>
            <Button onClick={() => setShowNew(true)}>Create Your First Ticket</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {tickets.map((t) => (
            <Card key={t.id} className="glass cursor-pointer hover:border-primary/30 transition-colors" onClick={() => openTicket(t)}>
              <CardContent className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <MessageSquare size={18} className="text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{t.subject}</p>
                    <p className="text-xs text-muted-foreground">{t.category} · {new Date(t.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className={priorityColor[t.priority] || ""} variant="outline">{t.priority}</Badge>
                  <Badge className={statusColor[t.status] || ""}>{t.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Ticket Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="glass sm:max-w-md">
          <DialogHeader><DialogTitle>Create Support Ticket</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            <Textarea placeholder="Describe your issue in detail…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={createTicket} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Ticket"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="glass sm:max-w-lg flex flex-col max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="pr-6">{selectedTicket?.subject}</DialogTitle>
            <div className="flex gap-2 mt-1 flex-wrap">
              <Badge variant="outline">{selectedTicket?.category}</Badge>
              <Badge className={priorityColor[selectedTicket?.priority || ""] || ""} variant="outline">{selectedTicket?.priority}</Badge>
              <Badge className={statusColor[selectedTicket?.status || ""] || ""}>{selectedTicket?.status}</Badge>
            </div>
          </DialogHeader>
          <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">{selectedTicket?.description}</p>
          <div className="flex-1 overflow-y-auto space-y-3 py-2 min-h-[160px]">
            {replies.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No replies yet — we'll respond soon.</p>
            ) : replies.map((r) => (
              <div key={r.id} className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${r.sender_id === user?.id ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"}`}>
                {r.content}
                <div className="text-[10px] opacity-60 mt-1">{new Date(r.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
            ))}
          </div>
          {selectedTicket?.status !== "closed" && (
            <div className="border-t border-border pt-3 flex gap-2 shrink-0">
              <Input value={newReply} onChange={(e) => setNewReply(e.target.value)} placeholder="Type a reply…" onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendReply()} />
              <Button onClick={sendReply} size="icon"><Send size={16} /></Button>
            </div>
          )}
          {selectedTicket?.status === "closed" && (
            <p className="text-xs text-muted-foreground text-center pt-2">This ticket is closed.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportTickets;
