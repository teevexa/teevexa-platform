import { useEffect, useState } from "react";
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
import { Plus, Receipt } from "lucide-react";

interface Invoice {
  id: string; invoice_number: string; amount: number; currency: string;
  status: string; due_date: string | null; user_id: string; created_at: string;
}

const AdminInvoices = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [clients, setClients] = useState<{ user_id: string; display_name: string | null }[]>([]);
  const [form, setForm] = useState({ invoice_number: "", amount: "", user_id: "", due_date: "" });

  const load = async () => {
    const [iRes, cRes] = await Promise.all([
      supabase.from("invoices").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("user_id, display_name"),
    ]);
    setInvoices(iRes.data || []);
    setClients(cRes.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.invoice_number || !form.amount || !form.user_id) { toast({ title: "Required fields missing", variant: "destructive" }); return; }
    const { error } = await supabase.from("invoices").insert({
      invoice_number: form.invoice_number, amount: Number(form.amount),
      user_id: form.user_id, due_date: form.due_date || null,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Invoice created" });
    setShowCreate(false); setForm({ invoice_number: "", amount: "", user_id: "", due_date: "" });
    load();
  };

  const statusStyle: Record<string, string> = { pending: "bg-yellow-500/20 text-yellow-400", paid: "bg-green-500/20 text-green-400", overdue: "bg-destructive/20 text-destructive" };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Invoices</h1>
        <Button onClick={() => setShowCreate(true)}><Plus size={16} className="mr-1" /> New Invoice</Button>
      </div>

      {loading ? <p className="text-muted-foreground">Loading...</p> : invoices.length === 0 ? (
        <Card className="glass"><CardContent className="py-12 text-center"><Receipt className="mx-auto text-muted-foreground mb-4" size={48} /><p className="text-muted-foreground">No invoices yet.</p></CardContent></Card>
      ) : (
        <Card className="glass overflow-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Invoice #</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Due</TableHead><TableHead>Created</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {invoices.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.invoice_number}</TableCell>
                  <TableCell>{i.currency} {Number(i.amount).toLocaleString()}</TableCell>
                  <TableCell><Badge className={statusStyle[i.status] || ""}>{i.status}</Badge></TableCell>
                  <TableCell>{i.due_date ? new Date(i.due_date).toLocaleDateString() : "—"}</TableCell>
                  <TableCell>{new Date(i.created_at).toLocaleDateString()}</TableCell>
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
            <div><Label>Invoice Number</Label><Input value={form.invoice_number} onChange={(e) => setForm((f) => ({ ...f, invoice_number: e.target.value }))} /></div>
            <div><Label>Amount (NGN)</Label><Input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} /></div>
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
