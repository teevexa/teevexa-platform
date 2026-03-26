import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Target, Rocket } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { logAudit } from "@/lib/audit";

interface Lead {
  id: string; full_name: string; email: string; phone: string | null;
  company: string | null; project_type: string; budget: string | null;
  timeline: string | null; urgency: string | null; additional_details: string | null;
  created_at: string; country: string | null; features: string[] | null;
}

const Leads = () => {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [onboarding, setOnboarding] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");

  useEffect(() => {
    supabase.from("project_inquiries").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setLeads(data || []); setLoading(false); });
  }, []);

  const onboardClient = async (lead: Lead) => {
    if (!projectTitle.trim()) { toast({ title: "Enter a project title", variant: "destructive" }); return; }
    setOnboarding(true);

    try {
      // Check if user already exists by looking up profiles
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("user_id")
        .ilike("display_name", lead.email)
        .maybeSingle();

      let clientUserId = existingProfile?.user_id;

      if (!clientUserId) {
        // Try to find by checking if email matches any profile display_name
        const { data: profiles } = await supabase.from("profiles").select("user_id, display_name");
        const match = profiles?.find((p) => p.display_name === lead.email);
        clientUserId = match?.user_id;
      }

      if (!clientUserId) {
        toast({ title: "Client must create an account first", description: `Ask ${lead.full_name} (${lead.email}) to sign up, then try again.`, variant: "destructive" });
        setOnboarding(false);
        return;
      }

      // Create project
      const { data: project, error } = await supabase.from("client_projects").insert({
        user_id: clientUserId,
        title: projectTitle.trim(),
        description: lead.additional_details || `${lead.project_type} project for ${lead.company || lead.full_name}`,
        status: "planning",
        budget: lead.budget,
      }).select().single();

      if (error) throw error;

      await logAudit({
        action: "onboard_client",
        entity_type: "client_project",
        entity_id: project.id,
        details: { lead_id: lead.id, client_name: lead.full_name, project_title: projectTitle },
      });

      toast({ title: "Client onboarded!", description: `Project "${projectTitle}" created for ${lead.full_name}.` });
      setSelected(null);
      setProjectTitle("");
    } catch (err: any) {
      toast({ title: "Onboarding failed", description: err.message, variant: "destructive" });
    }
    setOnboarding(false);
  };

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
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => setSelected(l)}>
                      <Eye size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={!!selected} onOpenChange={() => { setSelected(null); setProjectTitle(""); }}>
        <DialogContent className="glass max-w-lg max-h-[80vh] overflow-auto">
          <DialogHeader><DialogTitle>Lead Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Name:</span> {selected.full_name}</div>
              <div><span className="text-muted-foreground">Email:</span> {selected.email}</div>
              <div><span className="text-muted-foreground">Phone:</span> {selected.phone || "—"}</div>
              <div><span className="text-muted-foreground">Company:</span> {selected.company || "—"}</div>
              <div><span className="text-muted-foreground">Country:</span> {selected.country || "—"}</div>
              <div><span className="text-muted-foreground">Type:</span> <Badge variant="outline">{selected.project_type}</Badge></div>
              <div><span className="text-muted-foreground">Budget:</span> {selected.budget || "—"}</div>
              <div><span className="text-muted-foreground">Timeline:</span> {selected.timeline || "—"}</div>
              <div><span className="text-muted-foreground">Urgency:</span> {selected.urgency || "—"}</div>
              {selected.features && selected.features.length > 0 && (
                <div>
                  <span className="text-muted-foreground block mb-2">Requested Features:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.features.map((f) => <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>)}
                  </div>
                </div>
              )}
              <div><span className="text-muted-foreground">Details:</span> {selected.additional_details || "—"}</div>

              {/* One-click onboarding */}
              <div className="border-t border-border pt-4 space-y-3">
                <h3 className="font-semibold flex items-center gap-2"><Rocket size={16} className="text-primary" /> Quick Onboard</h3>
                <p className="text-xs text-muted-foreground">Convert this lead into a project. The client must have an account already.</p>
                <Input
                  placeholder="Project title"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                />
                <Button className="w-full" onClick={() => onboardClient(selected)} disabled={onboarding}>
                  <Rocket size={14} className="mr-1" /> {onboarding ? "Creating..." : "Create Project & Onboard"}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                Submitted: {new Date(selected.created_at).toLocaleString()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Leads;
