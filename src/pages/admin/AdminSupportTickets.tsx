import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, LifeBuoy } from "lucide-react";
import { logAudit } from "@/lib/audit";

interface Ticket {
  id: string; user_id: string; subject: string; description: string; category: string;
  priority: string; status: string; created_at: string; user_email?: string;
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

const AdminSupportTickets = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState("");
  const [userId, setUserId] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      const { data: ticketsData } = await supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name");

      const enriched = (ticketsData || []).map((t) => ({
        ...t,
        user_email: profiles?.find((p) => p.user_id === t.user_id)?.display_name || "Unknown",
      }));
      setTickets(enriched);
      setLoading(false);
    };
    load();
  }, []);

  const openTicket = async (ticket: Ticket) => {
    setSelected(ticket);
    const { data } = await supabase.from("ticket_replies").select("*").eq("ticket_id", ticket.id).order("created_at");
    setReplies(data || []);
  };

  const sendReply = async () => {
    if (!newReply.trim() || !selected) return;
    const { data } = await supabase.from("ticket_replies").insert({
      ticket_id: selected.id, sender_id: userId, content: newReply.trim(),
    }).select().single();
    if (data) setReplies((prev) => [...prev, data]);
    setNewReply("");
  };

  const updateStatus = async (ticketId: string, newStatus: string) => {
    await supabase.from("support_tickets").update({
      status: newStatus,
      ...(newStatus === "closed" ? { closed_at: new Date().toISOString() } : {}),
    }).eq("id", ticketId);
    setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, status: newStatus } : t));
    if (selected?.id === ticketId) setSelected({ ...selected, status: newStatus });
    await logAudit({ action: "update_status", entity_type: "support_ticket", entity_id: ticketId, details: { new_status: newStatus } });
    toast({ title: `Ticket ${newStatus}` });
  };

  const filtered = filter === "all" ? tickets : tickets.filter((t) => t.status === filter);

  if (loading) return <div className="animate-pulse-glow text-primary p-8">Loading...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Support Tickets</h1>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline">{filtered.length} tickets</Badge>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-12 text-center">
            <LifeBuoy className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground">No support tickets.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead><TableHead>Subject</TableHead><TableHead>Category</TableHead>
                <TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => (
                <TableRow key={t.id} className="cursor-pointer" onClick={() => openTicket(t)}>
                  <TableCell className="font-medium">{t.user_email}</TableCell>
                  <TableCell>{t.subject}</TableCell>
                  <TableCell><Badge variant="outline">{t.category}</Badge></TableCell>
                  <TableCell><Badge variant="outline">{t.priority}</Badge></TableCell>
                  <TableCell><Badge className={statusColor[t.status] || ""}>{t.status}</Badge></TableCell>
                  <TableCell className="text-xs">{new Date(t.created_at).toLocaleDateString()}</TableCell>
                  <TableCell><Button size="icon" variant="ghost"><MessageSquare size={16} /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="glass max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selected?.subject}</DialogTitle>
            <div className="flex gap-2 mt-1">
              <Badge variant="outline">{selected?.category}</Badge>
              <Select value={selected?.status || "open"} onValueChange={(v) => selected && updateStatus(selected.id, v)}>
                <SelectTrigger className="w-32 h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">From: {selected?.user_email}</p>
          <p className="text-sm">{selected?.description}</p>
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
          <div className="border-t border-border pt-3 flex gap-2">
            <Input value={newReply} onChange={(e) => setNewReply(e.target.value)} placeholder="Reply to client..." onKeyDown={(e) => e.key === "Enter" && sendReply()} />
            <Button onClick={sendReply} size="icon"><Send size={16} /></Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSupportTickets;
