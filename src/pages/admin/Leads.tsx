import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Target } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Lead {
  id: string; full_name: string; email: string; phone: string | null;
  company: string | null; project_type: string; budget: string | null;
  timeline: string | null; urgency: string | null; additional_details: string | null;
  created_at: string; country: string | null;
}

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Lead | null>(null);

  useEffect(() => {
    supabase.from("project_inquiries").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setLeads(data || []); setLoading(false); });
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Leads</h1>
        <Badge variant="outline">{leads.length} total</Badge>
      </div>

      {loading ? <p className="text-muted-foreground">Loading...</p> : leads.length === 0 ? (
        <Card className="glass"><CardContent className="py-12 text-center"><Target className="mx-auto text-muted-foreground mb-4" size={48} /><p className="text-muted-foreground">No leads yet.</p></CardContent></Card>
      ) : (
        <Card className="glass overflow-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Type</TableHead>
              <TableHead>Budget</TableHead><TableHead>Date</TableHead><TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {leads.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.full_name}</TableCell>
                  <TableCell>{l.email}</TableCell>
                  <TableCell><Badge variant="outline">{l.project_type}</Badge></TableCell>
                  <TableCell>{l.budget || "—"}</TableCell>
                  <TableCell>{new Date(l.created_at).toLocaleDateString()}</TableCell>
                  <TableCell><Button size="icon" variant="ghost" onClick={() => setSelected(l)}><Eye size={16} /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="glass max-w-lg">
          <DialogHeader><DialogTitle>Lead Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Name:</span> {selected.full_name}</div>
              <div><span className="text-muted-foreground">Email:</span> {selected.email}</div>
              <div><span className="text-muted-foreground">Phone:</span> {selected.phone || "—"}</div>
              <div><span className="text-muted-foreground">Company:</span> {selected.company || "—"}</div>
              <div><span className="text-muted-foreground">Country:</span> {selected.country || "—"}</div>
              <div><span className="text-muted-foreground">Type:</span> {selected.project_type}</div>
              <div><span className="text-muted-foreground">Budget:</span> {selected.budget || "—"}</div>
              <div><span className="text-muted-foreground">Timeline:</span> {selected.timeline || "—"}</div>
              <div><span className="text-muted-foreground">Urgency:</span> {selected.urgency || "—"}</div>
              <div><span className="text-muted-foreground">Details:</span> {selected.additional_details || "—"}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Leads;
