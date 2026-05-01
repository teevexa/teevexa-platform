import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  priority: string; status: string; created_at: string; assigned_to: string | null;
  user_email?: string;
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

const AdminSupportTickets = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState("");
  const [filter, setFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-tickets"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const [ticketsData, profiles, staffData] = await Promise.all([
        supabase.from("support_tickets").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("user_id, display_name"),
        supabase.from("user_roles").select("user_id, role").neq("role", "client"),
      ]);
      const staffIds = (staffData.data || []).map((r) => r.user_id);
      const staffProfiles = (profiles.data || []).filter((p) => staffIds.includes(p.user_id));

      const enriched: Ticket[] = (ticketsData.data || []).map((t) => ({
        ...t,
        user_email: profiles.data?.find((p) => p.user_id === t.user_id)?.display_name || "Unknown",
      }));
      return { tickets: enriched, userId: user?.id, staffProfiles };
    },
    staleTime: 30_000,
  });

  const tickets = data?.tickets ?? [];
  const userId = data?.userId;
  const staffProfiles = data?.staffProfiles ?? [];

  // Real-time reply subscription for selected ticket
  useEffect(() => {
    if (!selected) return;
    const channel = supabase
      .channel(`ticket-replies-${selected.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ticket_replies", filter: `ticket_id=eq.${selected.id}` },
        (payload) => setReplies((prev) => [...prev, payload.new as Reply]))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selected?.id]);

  const openTicket = async (ticket: Ticket) => {
    setSelected(ticket);
    const { data } = await supabase.from("ticket_replies").select("*").eq("ticket_id", ticket.id).order("created_at");
    setReplies(data || []);
  };

  const sendReply = async () => {
    if (!newReply.trim() || !selected || !userId) return;
    const { data } = await supabase.from("ticket_replies").insert({
      ticket_id: selected.id, sender_id: userId, content: newReply.trim(),
    }).select().single();
    if (data) setReplies((prev) => [...prev, data]);
    setNewReply("");
  };

  const updateTicketField = async (ticketId: string, field: "status" | "priority" | "assigned_to", value: string | null) => {
    const update: Record<string, unknown> = { [field]: value };
    if (field === "status" && value === "closed") update.closed_at = new Date().toISOString();
    await supabase.from("support_tickets").update(update).eq("id", ticketId);
    queryClient.setQueryData(["admin-tickets"], (old: typeof data) => {
      if (!old) return old;
      return { ...old, tickets: old.tickets.map((t) => t.id === ticketId ? { ...t, [field]: value } : t) };
    });
    if (selected?.id === ticketId) setSelected((prev) => prev ? { ...prev, [field]: value } : prev);
    if (field === "status") {
      await logAudit({ action: "update_status", entity_type: "support_ticket", entity_id: ticketId, details: { new_status: value } });
      toast({ title: `Ticket ${value}` });
    }
  };

  const filtered = filter === "all" ? tickets : tickets.filter((t) => t.status === filter);
  const staffName = (id: string | null) => id ? (staffProfiles.find((p) => p.user_id === id)?.display_name || id.slice(0, 8)) : "Unassigned";

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

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
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
                <TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Assigned</TableHead>
                <TableHead>Date</TableHead><TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => (
                <TableRow key={t.id} className="cursor-pointer" onClick={() => openTicket(t)}>
                  <TableCell className="font-medium">{t.user_email}</TableCell>
                  <TableCell>{t.subject}</TableCell>
                  <TableCell><Badge variant="outline">{t.category}</Badge></TableCell>
                  <TableCell><Badge className={priorityColor[t.priority] || ""}>{t.priority}</Badge></TableCell>
                  <TableCell><Badge className={statusColor[t.status] || ""}>{t.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{staffName(t.assigned_to)}</TableCell>
                  <TableCell className="text-xs">{new Date(t.created_at).toLocaleDateString()}</TableCell>
                  <TableCell><Button size="icon" variant="ghost"><MessageSquare size={16} /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="glass max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selected?.subject}</DialogTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline">{selected?.category}</Badge>

              {/* Status */}
              <Select value={selected?.status || "open"} onValueChange={(v) => selected && updateTicketField(selected.id, "status", v)}>
                <SelectTrigger className="w-32 h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority */}
              <Select value={selected?.priority || "medium"} onValueChange={(v) => selected && updateTicketField(selected.id, "priority", v)}>
                <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>

              {/* Assign To */}
              <Select
                value={selected?.assigned_to || "unassigned"}
                onValueChange={(v) => selected && updateTicketField(selected.id, "assigned_to", v === "unassigned" ? null : v)}
              >
                <SelectTrigger className="w-36 h-7 text-xs"><SelectValue placeholder="Assign to…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {staffProfiles.map((p) => <SelectItem key={p.user_id} value={p.user_id}>{p.display_name || p.user_id.slice(0, 8)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">From: {selected?.user_email}</p>
          <p className="text-sm">{selected?.description}</p>

          <div className="flex-1 overflow-auto space-y-3 border-t border-border pt-3 min-h-[160px]">
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
            <Input value={newReply} onChange={(e) => setNewReply(e.target.value)} placeholder="Reply to client…" onKeyDown={(e) => e.key === "Enter" && sendReply()} />
            <Button onClick={sendReply} size="icon"><Send size={16} /></Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSupportTickets;
