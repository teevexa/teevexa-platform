import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Target, Rocket, Search, Filter, Paperclip, ExternalLink, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { logAudit } from "@/lib/audit";

type LeadStatus = "new" | "contacted" | "proposal_sent" | "onboarded" | "rejected";

interface Lead {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  project_type: string;
  budget: string | null;
  timeline: string | null;
  urgency: string | null;
  additional_details: string | null;
  created_at: string;
  country: string | null;
  features: string[] | null;
  attachment_urls: string[] | null;
  status: LeadStatus;
}

const STATUS_STYLES: Record<LeadStatus, string> = {
  new:           "bg-primary/20 text-primary",
  contacted:     "bg-yellow-500/20 text-yellow-400",
  proposal_sent: "bg-accent/20 text-accent",
  onboarded:     "bg-green-500/20 text-green-400",
  rejected:      "bg-red-500/20 text-red-400",
};

const STATUS_LABELS: Record<LeadStatus, string> = {
  new:           "New",
  contacted:     "Contacted",
  proposal_sent: "Proposal Sent",
  onboarded:     "Onboarded",
  rejected:      "Rejected",
};

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
  const [filterStatus, setFilterStatus] = useState("all");
  const [attachmentUrls, setAttachmentUrls] = useState<{ path: string; url: string }[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    supabase
      .from("project_inquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setLeads((data as Lead[]) || []);
        setLoading(false);
      });
  }, []);

  const filteredLeads = leads.filter((l) => {
    const q = search.toLowerCase();
    const matchesSearch = !search ||
      l.full_name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      (l.company || "").toLowerCase().includes(q);
    const matchesType   = filterType   === "all" || l.project_type === filterType;
    const matchesStatus = filterStatus === "all" || l.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const projectTypes = [...new Set(leads.map((l) => l.project_type))];

  // Resolve signed download URLs for attachments when a lead is opened
  const openLead = async (lead: Lead) => {
    setSelected(lead);
    setProjectTitle("");
    setProjectDescription("");
    setAttachmentUrls([]);
    if (lead.attachment_urls && lead.attachment_urls.length > 0) {
      const resolved = await Promise.all(
        lead.attachment_urls.map(async (path) => {
          const { data } = await supabase.storage
            .from("project-attachments")
            .createSignedUrl(path, 3600);
          return { path, url: data?.signedUrl || "" };
        })
      );
      setAttachmentUrls(resolved.filter((r) => r.url));
    }
  };

  const updateStatus = async (lead: Lead, status: LeadStatus) => {
    setUpdatingStatus(true);
    const { error } = await supabase
      .from("project_inquiries")
      .update({ status })
      .eq("id", lead.id);
    if (error) {
      toast({ title: "Failed to update status", variant: "destructive" });
    } else {
      setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, status } : l));
      setSelected((prev) => prev?.id === lead.id ? { ...prev, status } : prev);
    }
    setUpdatingStatus(false);
  };

  const onboardClient = async (lead: Lead) => {
    if (!projectTitle.trim()) {
      toast({ title: "Enter a project title", variant: "destructive" });
      return;
    }

    // Guard: already onboarded
    if (lead.status === "onboarded") {
      toast({ title: "This lead has already been onboarded", variant: "destructive" });
      return;
    }

    setOnboarding(true);

    try {
      // Resolve client user_id — use the stored user_id first (new leads),
      // fall back to email lookup for pre-migration leads
      let clientUserId = lead.user_id ?? null;

      if (!clientUserId) {
        // Pre-migration lead: try matching profile display_name against email
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .or(`display_name.ilike.${lead.email},display_name.eq.${lead.full_name}`);

        clientUserId =
          profiles?.find((p) => p.display_name?.toLowerCase() === lead.email.toLowerCase())?.user_id ||
          profiles?.find((p) => p.display_name?.toLowerCase() === lead.full_name.toLowerCase())?.user_id ||
          null;

        if (!clientUserId) {
          toast({
            title: "Client account not found",
            description: `${lead.full_name} (${lead.email}) must sign up at teevexa.com/auth before they can be onboarded.`,
            variant: "destructive",
          });
          setOnboarding(false);
          return;
        }
      }

      const description =
        projectDescription.trim() ||
        lead.additional_details ||
        `${lead.project_type} project for ${lead.company || lead.full_name}`;

      const { data: project, error } = await supabase
        .from("client_projects")
        .insert({
          user_id: clientUserId,
          title: projectTitle.trim(),
          description,
          status: "planning",
          budget: lead.budget,
        })
        .select()
        .single();

      if (error) throw error;

      // Create kickoff milestone
      await supabase.from("project_milestones").insert({
        project_id: project.id,
        title: "Project Kickoff",
        status: "pending",
      });

      // In-app notification for client
      await supabase.from("notifications").insert({
        user_id: clientUserId,
        title: "Welcome to Your Project!",
        message: `Your project "${projectTitle}" has been created. Visit your portal to view details.`,
        type: "info",
        link: `/client-portal/projects/${project.id}`,
      });

      // Email client + in-app admin notification via edge function
      await supabase.functions.invoke("notify-admin", {
        body: {
          type: "client_onboarded",
          data: {
            lead_id:       lead.id,
            client_name:   lead.full_name,
            client_email:  lead.email,
            project_title: projectTitle,
            project_id:    project.id,
          },
        },
      });

      // Mark lead as onboarded
      await updateStatus(lead, "onboarded");

      await logAudit({
        action: "onboard_client",
        entity_type: "client_project",
        entity_id: project.id,
        details: { lead_id: lead.id, client_name: lead.full_name, project_title: projectTitle },
      });

      toast({
        title: "Client onboarded!",
        description: `Project "${projectTitle}" created for ${lead.full_name}. A confirmation email has been sent.`,
      });
      setSelected(null);
      setProjectTitle("");
      setProjectDescription("");
    } catch (err: unknown) {
      toast({ title: "Onboarding failed", description: (err as Error).message, variant: "destructive" });
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
            placeholder="Search by name, email, or company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[160px]">
            <Filter size={14} className="mr-2" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {projectTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filteredLeads.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-12 text-center">
            <Target className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground">No leads found.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((l) => (
                <TableRow key={l.id} className={l.status === "onboarded" ? "opacity-60" : ""}>
                  <TableCell className="font-medium">{l.full_name}</TableCell>
                  <TableCell>{l.email}</TableCell>
                  <TableCell>{l.company || "—"}</TableCell>
                  <TableCell><Badge variant="outline">{l.project_type}</Badge></TableCell>
                  <TableCell className="text-sm">{l.budget || "—"}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_STYLES[l.status] || ""}>{STATUS_LABELS[l.status] || l.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(l.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => openLead(l)}>
                      <Eye size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) { setSelected(null); setProjectTitle(""); setProjectDescription(""); setAttachmentUrls([]); } }}>
        <DialogContent className="glass max-w-lg max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-6">
              <span>Lead Details</span>
              {selected && (
                <Badge className={STATUS_STYLES[selected.status]}>{STATUS_LABELS[selected.status]}</Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div><span className="text-muted-foreground">Name</span><p className="font-medium">{selected.full_name}</p></div>
                <div><span className="text-muted-foreground">Email</span><p><a href={`mailto:${selected.email}`} className="text-primary hover:underline">{selected.email}</a></p></div>
                <div><span className="text-muted-foreground">Phone</span><p>{selected.phone || "—"}</p></div>
                <div><span className="text-muted-foreground">Company</span><p>{selected.company || "—"}</p></div>
                <div><span className="text-muted-foreground">Country</span><p>{selected.country || "—"}</p></div>
                <div><span className="text-muted-foreground">Type</span><p><Badge variant="outline">{selected.project_type}</Badge></p></div>
                <div><span className="text-muted-foreground">Budget</span><p>{selected.budget || "—"}</p></div>
                <div><span className="text-muted-foreground">Timeline</span><p>{selected.timeline || "—"}</p></div>
                <div><span className="text-muted-foreground">Urgency</span><p>{selected.urgency || "—"}</p></div>
                <div><span className="text-muted-foreground">Account linked</span><p>{selected.user_id ? <span className="text-green-400">✓ Yes</span> : <span className="text-yellow-400">⚠ Legacy lead</span>}</p></div>
              </div>

              {selected.features && selected.features.length > 0 && (
                <div>
                  <span className="text-muted-foreground block mb-2">Requested Features</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.features.map((f) => <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>)}
                  </div>
                </div>
              )}

              {selected.additional_details && (
                <div>
                  <span className="text-muted-foreground block mb-1">Additional Details</span>
                  <p className="text-muted-foreground leading-relaxed">{selected.additional_details}</p>
                </div>
              )}

              {/* Attachments */}
              {attachmentUrls.length > 0 && (
                <div>
                  <span className="text-muted-foreground flex items-center gap-1.5 mb-2">
                    <Paperclip size={13} /> Attachments ({attachmentUrls.length})
                  </span>
                  <div className="space-y-1.5">
                    {attachmentUrls.map((a) => (
                      <a
                        key={a.path}
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-primary hover:underline glass rounded-lg px-3 py-2"
                      >
                        <Paperclip size={12} />
                        <span className="truncate flex-1">{a.path.replace(/^\d+-/, "")}</span>
                        <ExternalLink size={11} className="flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div className="border-t border-border pt-4 space-y-2">
                <span className="text-muted-foreground text-xs uppercase tracking-wide font-medium">Update Status</span>
                <Select
                  value={selected.status}
                  disabled={updatingStatus || selected.status === "onboarded"}
                  onValueChange={(v) => updateStatus(selected, v as LeadStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Onboarding */}
              {selected.status !== "onboarded" ? (
                <div className="border-t border-border pt-4 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Rocket size={16} className="text-primary" /> Onboard to Project
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Creates a project in the client portal, adds a Kickoff milestone, and sends the client a welcome email.
                    {!selected.user_id && (
                      <span className="block mt-1 text-yellow-400">⚠ This is a legacy lead — the client must have an account with this email address for onboarding to succeed.</span>
                    )}
                  </p>
                  <Input
                    placeholder="Project title *"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                  />
                  <Textarea
                    placeholder="Project description (optional — defaults to lead details)"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    rows={3}
                  />
                  <Button className="w-full glow-primary" onClick={() => onboardClient(selected)} disabled={onboarding}>
                    <Rocket size={14} className="mr-2" />
                    {onboarding ? "Creating project…" : "Create Project & Onboard"}
                  </Button>
                </div>
              ) : (
                <div className="border-t border-border pt-4">
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle2 size={16} />
                    This lead has been onboarded. The project is live in the client portal.
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground pt-1 border-t border-border">
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
