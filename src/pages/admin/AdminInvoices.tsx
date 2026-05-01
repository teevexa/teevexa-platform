import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { logAudit } from "@/lib/audit";
import { formatCurrency } from "@/lib/format";
import { Plus, Receipt, CheckCircle, Clock, AlertTriangle, Send } from "lucide-react";

interface Invoice {
  id: string; invoice_number: string; amount: number; currency: string;
  status: string; due_date: string | null; paid_at: string | null;
  user_id: string; created_at: string;
}

const statusStyle: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  paid: "bg-green-500/20 text-green-400",
  overdue: "bg-destructive/20 text-destructive",
};

const AdminInvoices = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ invoice_number: "", amount: "", currency: "KES", user_id: "", due_date: "" });
  const [sending, setSending] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-invoices"],
    queryFn: async () => {
      const [iRes, cRes] = await Promise.all([
        supabase.from("invoices").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("user_id, display_name"),
      ]);
      return { invoices: (iRes.data || []) as Invoice[], clients: cRes.data || [] };
    },
    staleTime: 30_000,
  });

  const invoices = data?.invoices ?? [];
  const clients = data?.clients ?? [];

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });

  const create = async () => {
    if (!form.invoice_number || !form.amount || !form.user_id) {
      toast({ title: "Required fields missing", variant: "destructive" }); return;
    }
    const { data: created, error } = await supabase.from("invoices").insert({
      invoice_number: form.invoice_number,
      amount: Number(form.amount),
      currency: form.currency,
      user_id: form.user_id,
      due_date: form.due_date || null,
    }).select("id").single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    await logAudit({ action: "create", entity_type: "invoice", entity_id: created?.id, details: { invoice_number: form.invoice_number, amount: Number(form.amount), currency: form.currency, client_id: form.user_id } });
    toast({ title: "Invoice created" });
    setShowCreate(false);
    setForm({ invoice_number: "", amount: "", currency: "KES", user_id: "", due_date: "" });
    refresh();
  };

  const updateStatus = async (invoice: Invoice, newStatus: string) => {
    const update: Record<string, unknown> = { status: newStatus };
    if (newStatus === "paid") update.paid_at = new Date().toISOString();
    const { error } = await supabase.from("invoices").update(update).eq("id", invoice.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    await logAudit({ action: "update", entity_type: "invoice", entity_id: invoice.id, details: { invoice_number: invoice.invoice_number, new_status: newStatus } });
    toast({ title: `Invoice marked as ${newStatus}` });
    refresh();
  };

  const sendToClient = async (invoice: Invoice) => {
    setSending(invoice.id);
    await supabase.from("notifications").insert({
      user_id: invoice.user_id,
      title: `Invoice ${invoice.invoice_number}`,
      message: `You have a new invoice for ${formatCurrency(Number(invoice.amount), invoice.currency)}${invoice.due_date ? ` due on ${new Date(invoice.due_date).toLocaleDateString()}` : ""}.`,
      type: "invoice",
      link: "/client-portal/invoices",
    });
    await logAudit({ action: "send", entity_type: "invoice", entity_id: invoice.id, details: { invoice_number: invoice.invoice_number } });
    setSending(null);
    toast({ title: "Invoice notification sent to client" });
  };

  const clientName = (userId: string) => clients.find((c) => c.user_id === userId)?.display_name || "—";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Invoices</h1>
        <Button onClick={() => setShowCreate(true)}><Plus size={16} className="mr-1" /> New Invoice</Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : invoices.length === 0 ? (
        <Card className="glass"><CardContent className="py-12 text-center"><Receipt className="mx-auto text-muted-foreground mb-4" size={48} /><p className="text-muted-foreground">No invoices yet.</p></CardContent></Card>
      ) : (
        <Card className="glass overflow-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id} className={inv.status === "overdue" ? "border-l-2 border-l-destructive" : ""}>
                  <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                  <TableCell className="text-sm">{clientName(inv.user_id)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(Number(inv.amount), inv.currency)}</TableCell>
                  <TableCell><Badge className={statusStyle[inv.status] || ""}>{inv.status}</Badge></TableCell>
                  <TableCell className="text-sm">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {inv.paid_at ? new Date(inv.paid_at).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {inv.status !== "paid" && (
                        <Button size="sm" variant="ghost" className="text-green-400 hover:text-green-300 hover:bg-green-500/10 text-xs gap-1"
                          onClick={() => updateStatus(inv, "paid")}>
                          <CheckCircle size={12} /> Paid
                        </Button>
                      )}
                      {inv.status !== "overdue" && inv.status !== "paid" && (
                        <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 text-xs gap-1"
                          onClick={() => updateStatus(inv, "overdue")}>
                          <AlertTriangle size={12} /> Overdue
                        </Button>
                      )}
                      {inv.status !== "pending" && inv.status !== "paid" && (
                        <Button size="sm" variant="ghost" className="text-yellow-400 hover:bg-yellow-500/10 text-xs gap-1"
                          onClick={() => updateStatus(inv, "pending")}>
                          <Clock size={12} /> Pending
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10 text-xs gap-1"
                        onClick={() => sendToClient(inv)} disabled={sending === inv.id}>
                        <Send size={12} /> {sending === inv.id ? "Sending…" : "Notify"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="glass">
          <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Invoice Number</Label><Input value={form.invoice_number} onChange={(e) => setForm((f) => ({ ...f, invoice_number: e.target.value }))} placeholder="INV-001" /></div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label>Currency</Label>
                <Select value={form.currency} onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KES">KES — Kenyan Shilling</SelectItem>
                    <SelectItem value="USD">USD — US Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0" /></div>
            </div>
            <div><Label>Client</Label>
              <Select value={form.user_id} onValueChange={(v) => setForm((f) => ({ ...f, user_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>{clients.map((c) => <SelectItem key={c.user_id} value={c.user_id}>{c.display_name || c.user_id}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} /></div>
            <Button className="w-full glow-primary" onClick={create}>Create Invoice</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInvoices;
