import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Plus, Send, Eye, Inbox, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ProposalStatus = "draft" | "sent" | "approved" | "rejected";

interface Proposal {
  id: string;
  client_id: string;
  project_id: string | null;
  title: string;
  summary: string | null;
  scope: string | null;
  amount: number | null;
  currency: string;
  status: ProposalStatus;
  notes: string | null;
  valid_until: string | null;
  sent_at: string | null;
  responded_at: string | null;
  created_at: string;
}

interface ClientUser {
  id: string;
  email: string;
}

const STATUS_STYLES: Record<ProposalStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-primary/20 text-primary",
  approved: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
};

const emptyForm = {
  client_id: "",
  project_id: "",
  title: "",
  summary: "",
  scope: "",
  amount: "",
  currency: "USD",
  notes: "",
  valid_until: "",
};

const AdminProposals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewProposal, setViewProposal] = useState<Proposal | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [sending, setSending] = useState<string | null>(null);

  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ["admin-proposals"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("proposals").select("*").order("created_at", { ascending: false });
      return (data || []) as Proposal[];
    },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["client-users"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("user_id").eq("role", "client");
      if (!data?.length) return [] as ClientUser[];
      const ids = data.map((r) => r.user_id);
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name");
      return ids.map((id) => ({
        id,
        email: profiles?.find((p) => p.user_id === id)?.display_name || id,
      })) as ClientUser[];
    },
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["all-projects-select"],
    queryFn: async () => {
      const { data } = await supabase.from("client_projects").select("id, title, user_id");
      return data || [];
    },
  });

  const clientProjects = form.client_id
    ? projects.filter((p) => p.user_id === form.client_id)
    : projects;

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        client_id: form.client_id,
        project_id: form.project_id || null,
        title: form.title,
        summary: form.summary || null,
        scope: form.scope || null,
        amount: form.amount ? Number(form.amount) : null,
        currency: form.currency,
        notes: form.notes || null,
        valid_until: form.valid_until || null,
        created_by: user?.id,
      };
      if (editId) {
        await (supabase as any).from("proposals").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editId);
      } else {
        await (supabase as any).from("proposals").insert([{ ...payload, status: "draft" }]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-proposals"] });
      toast({ title: editId ? "Proposal updated" : "Proposal created" });
      setDialogOpen(false);
      setEditId(null);
      setForm(emptyForm);
    },
    onError: () => toast({ title: "Failed to save proposal", variant: "destructive" }),
  });

  const sendProposal = async (id: string) => {
    setSending(id);
    await (supabase as any).from("proposals").update({ status: "sent", sent_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin-proposals"] });
    setSending(null);
    toast({ title: "Proposal sent to client" });
  };

  const openEdit = (p: Proposal) => {
    setEditId(p.id);
    setForm({
      client_id: p.client_id,
      project_id: p.project_id || "",
      title: p.title,
      summary: p.summary || "",
      scope: p.scope || "",
      amount: p.amount?.toString() || "",
      currency: p.currency,
      notes: p.notes || "",
      valid_until: p.valid_until || "",
    });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl">Proposals & Quotes</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and send proposals for clients to approve</p>
        </div>
        <Button className="glow-primary" onClick={openNew}>
          <Plus size={16} className="mr-2" /> New Proposal
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : proposals.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-16 text-center">
            <Inbox className="mx-auto text-muted-foreground mb-4 opacity-40" size={48} />
            <p className="font-display font-semibold mb-1">No proposals yet</p>
            <p className="text-sm text-muted-foreground">Create your first proposal to send to a client.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {clients.find((c) => c.id === p.client_id)?.email || p.client_id.slice(0, 8) + "…"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {p.amount ? `${p.currency} ${Number(p.amount).toLocaleString()}` : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.valid_until ? new Date(p.valid_until).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_STYLES[p.status]}>{p.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setViewProposal(p)}>
                        <Eye size={14} />
                      </Button>
                      {p.status === "draft" && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                            <Pencil size={14} />
                          </Button>
                          <Button size="sm" variant="outline" disabled={sending === p.id} onClick={() => sendProposal(p.id)}>
                            <Send size={12} className="mr-1.5" />
                            {sending === p.id ? "Sending…" : "Send"}
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditId(null); setForm(emptyForm); } }}>
        <DialogContent className="glass max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{editId ? "Edit Proposal" : "New Proposal"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Client *</Label>
                <Select value={form.client_id} onValueChange={(v) => setForm((f) => ({ ...f, client_id: v, project_id: "" }))}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.email}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Project (optional)</Label>
                <Select value={form.project_id} onValueChange={(v) => setForm((f) => ({ ...f, project_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {clientProjects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Website Redesign Proposal" />
            </div>
            <div className="space-y-1.5">
              <Label>Summary</Label>
              <Textarea rows={3} value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} placeholder="Brief overview of the engagement…" />
            </div>
            <div className="space-y-1.5">
              <Label>Scope of Work</Label>
              <Textarea rows={4} value={form.scope} onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value }))} placeholder="Describe what's included and excluded…" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Amount</Label>
                <Input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="KES">KES</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Valid Until</Label>
                <Input type="date" value={form.valid_until} onChange={(e) => setForm((f) => ({ ...f, valid_until: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Internal Notes</Label>
              <Textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Notes visible to your team only…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); setEditId(null); setForm(emptyForm); }}>Cancel</Button>
            <Button className="glow-primary" disabled={!form.client_id || !form.title || saveMutation.isPending} onClick={() => saveMutation.mutate()}>
              {saveMutation.isPending ? "Saving…" : editId ? "Save Changes" : "Create Proposal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewProposal} onOpenChange={() => setViewProposal(null)}>
        {viewProposal && (
          <DialogContent className="glass max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                {viewProposal.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={STATUS_STYLES[viewProposal.status]}>{viewProposal.status}</Badge>
                {viewProposal.amount && <span className="font-semibold">{viewProposal.currency} {Number(viewProposal.amount).toLocaleString()}</span>}
                {viewProposal.valid_until && <span className="text-muted-foreground">Valid until {new Date(viewProposal.valid_until).toLocaleDateString()}</span>}
              </div>
              {viewProposal.summary && <div><p className="font-medium mb-1">Summary</p><p className="text-muted-foreground leading-relaxed">{viewProposal.summary}</p></div>}
              {viewProposal.scope && <div><p className="font-medium mb-1">Scope of Work</p><p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{viewProposal.scope}</p></div>}
              {viewProposal.sent_at && <p className="text-xs text-muted-foreground">Sent {new Date(viewProposal.sent_at).toLocaleString()}</p>}
              {viewProposal.responded_at && <p className="text-xs text-muted-foreground">Responded {new Date(viewProposal.responded_at).toLocaleString()}</p>}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default AdminProposals;
