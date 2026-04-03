import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Target, Rocket, Search, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [projectDescription, setProjectDescription] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    supabase.from("project_inquiries").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setLeads(data || []); setLoading(false); });
  }, []);

  const filteredLeads = leads.filter((l) => {
    const matchesSearch = !search || l.full_name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      (l.company || "").toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || l.project_type === filterType;
    return matchesSearch && matchesType;
  });

  const projectTypes = [...new Set(leads.map((l) => l.project_type))];

  const onboardClient = async (lead: Lead) => {
    if (!projectTitle.trim()) { toast({ title: "Enter a project title", variant: "destructive" }); return; }
    setOnboarding(true);

    try {
      // Look up profile by email stored in display_name (set by handle_new_user trigger)
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .or(`display_name.ilike.${lead.email},display_name.eq.${lead.full_name}`);

      let clientUserId = profiles?.find((p) =>
        p.display_name?.toLowerCase() === lead.email.toLowerCase()
      )?.user_id;

      // Also try matching by full name if email didn't match
      if (!clientUserId) {
        clientUserId = profiles?.find((p) =>
          p.display_name?.toLowerCase() === lead.full_name.toLowerCase()
        )?.user_id;
      }

      if (!clientUserId) {
        toast({
          title: "Client account not found",
          description: `${lead.full_name} (${lead.email}) needs to create an account first. Share the signup link with them.`,
          variant: "destructive",
        });
        setOnboarding(false);
        return;
      }

      // Create the project
      const description = projectDescription.trim() ||
        lead.additional_details ||
        `${lead.project_type} project for ${lead.company || lead.full_name}`;

      const { data: project, error } = await supabase.from("client_projects").insert({
        user_id: clientUserId,
        title: projectTitle.trim(),
        description,
        status: "planning",
        budget: lead.budget,
      }).select().single();

      if (error) throw error;

      // Create initial milestone
      await supabase.from("project_milestones").insert({
        project_id: project.id,
        title: "Project Kickoff",
        status: "pending",
      });

      // Notify the client
      await supabase.from("notifications").insert({
        user_id: clientUserId,
        title: "Welcome to Your Project!",
        message: `Your project "${projectTitle}" has been created. Visit your portal to view details.`,
        type: "info",
        link: `/client-portal/projects/${project.id}`,
      });

      // Notify admins via edge function
      await supabase.functions.invoke("notify-admin", {
        body: {
          type: "client_onboarded",
          data: {
            lead_id: lead.id,
            client_name: lead.full_name,
            project_title: projectTitle,
            project_id: project.id,
          },
        },
      });

      await logAudit({
        action: "onboard_client",
        entity_type: "client_project",
        entity_id: project.id,
        details: { lead_id: lead.id, client_name: lead.full_name, project_title: projectTitle },
      });

      toast({ title: "Client onboarded!", description: `Project "${projectTitle}" created for ${lead.full_name} with a kickoff milestone.` });
      setSelected(null);
      setProjectTitle("");
      setProjectDescription("");
    } catch (err: any) {
      toast({ title: "Onboarding failed", description: err.message, variant: "destructive" });
    }
    setOnboarding(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Leads</h1>
        <Badge variant="outline">{filteredLeads.length} of {leads.length}</Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <Filter size={14} className="mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {projectTypes.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? <p className="text-muted-foreground">Loading...</p> : filteredLeads.length === 0 ? (
        <Card className="glass"><CardContent className="py-12 text-center"><Target className="mx-auto text-muted-foreground mb-4" size={48} /><p className="text-muted-foreground">No leads found.</p></CardContent></Card>
      ) : (
        <Card className="glass overflow-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Company</TableHead><TableHead>Type</TableHead>
              <TableHead>Budget</TableHead><TableHead>Urgency</TableHead><TableHead>Date</TableHead><TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filteredLeads.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.full_name}</TableCell>
                  <TableCell>{l.email}</TableCell>
                  <TableCell>{l.company || "—"}</TableCell>
                  <TableCell><Badge variant="outline">{l.project_type}</Badge></TableCell>
                  <TableCell>{l.budget || "—"}</TableCell>
                  <TableCell>
                    {l.urgency && (
                      <Badge variant={l.urgency === "urgent" ? "destructive" : "secondary"} className="text-xs">
                        {l.urgency}
                      </Badge>
                    )}
                  </TableCell>
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

      <Dialog open={!!selected} onOpenChange={() => { setSelected(null); setProjectTitle(""); setProjectDescription(""); }}>
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

              {/* Enhanced onboarding */}
              <div className="border-t border-border pt-4 space-y-3">
                <h3 className="font-semibold flex items-center gap-2"><Rocket size={16} className="text-primary" /> Quick Onboard</h3>
                <p className="text-xs text-muted-foreground">Convert this lead into a project. The client must have an account. A kickoff milestone and welcome notification will be created automatically.</p>
                <Input
                  placeholder="Project title"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Project description (optional — defaults to lead details)"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={3}
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
