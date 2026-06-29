import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FileText, CheckCircle, XCircle, Clock, Inbox } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ProposalStatus = "draft" | "sent" | "approved" | "rejected";

interface Proposal {
  id: string;
  title: string;
  summary: string | null;
  scope: string | null;
  amount: number | null;
  currency: string;
  status: ProposalStatus;
  valid_until: string | null;
  sent_at: string | null;
  created_at: string;
}

const STATUS_STYLES: Record<ProposalStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-primary/20 text-primary",
  approved: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
};

const STATUS_ICONS: Record<ProposalStatus, React.ReactNode> = {
  draft: <Clock size={14} />,
  sent: <FileText size={14} />,
  approved: <CheckCircle size={14} />,
  rejected: <XCircle size={14} />,
};

const Proposals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Proposal | null>(null);
  const [responding, setResponding] = useState<"approved" | "rejected" | null>(null);

  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ["portal-proposals", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("proposals")
        .select("id, title, summary, scope, amount, currency, status, valid_until, sent_at, created_at")
        .eq("client_id", user!.id)
        .neq("status", "draft")
        .order("created_at", { ascending: false });
      return (data || []) as Proposal[];
    },
  });

  const respondMutation = useMutation({
    mutationFn: async (status: "approved" | "rejected") => {
      await supabase
        .from("proposals")
        .update({ status, responded_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", selected!.id)
        .eq("client_id", user!.id);
    },
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ["portal-proposals", user?.id] });
      toast({ title: status === "approved" ? "Proposal approved" : "Proposal rejected" });
      setSelected(null);
      setResponding(null);
    },
    onError: () => {
      toast({ title: "Could not submit response. Please try again.", variant: "destructive" });
      setResponding(null);
    },
  });

  const isExpired = (p: Proposal) => p.valid_until ? new Date(p.valid_until) < new Date() : false;
  const canRespond = (p: Proposal) => p.status === "sent" && !isExpired(p);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl">Proposals & Quotes</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and approve proposals from the Teevexa team</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : proposals.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-16 text-center">
            <Inbox className="mx-auto text-muted-foreground mb-4 opacity-40" size={48} />
            <p className="font-display font-semibold mb-1">No proposals yet</p>
            <p className="text-sm text-muted-foreground">When Teevexa sends you a proposal, it will appear here for your review.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {proposals.map((p) => (
            <Card key={p.id} className={`glass hover:border-primary/30 transition-all cursor-pointer ${p.status === "sent" && !isExpired(p) ? "border-primary/30" : ""}`} onClick={() => setSelected(p)}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-base">{p.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Sent {p.sent_at ? new Date(p.sent_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    {p.valid_until && !isExpired(p) && ` · Valid until ${new Date(p.valid_until).toLocaleDateString()}`}
                    {isExpired(p) && " · Expired"}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {p.amount && (
                    <span className="text-sm font-semibold">{p.currency} {Number(p.amount).toLocaleString()}</span>
                  )}
                  <Badge className={`flex items-center gap-1.5 ${STATUS_STYLES[p.status]}`}>
                    {STATUS_ICONS[p.status]} {p.status}
                  </Badge>
                </div>
              </CardHeader>
              {p.summary && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2">{p.summary}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* View + Respond Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) { setSelected(null); setResponding(null); } }}>
        {selected && (
          <DialogContent className="glass max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                {selected.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 text-sm">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={`flex items-center gap-1.5 ${STATUS_STYLES[selected.status]}`}>
                  {STATUS_ICONS[selected.status]} {selected.status}
                </Badge>
                {selected.amount && (
                  <span className="font-semibold text-base">{selected.currency} {Number(selected.amount).toLocaleString()}</span>
                )}
                {selected.valid_until && (
                  <span className={`text-xs ${isExpired(selected) ? "text-destructive" : "text-muted-foreground"}`}>
                    {isExpired(selected) ? "Expired" : `Valid until ${new Date(selected.valid_until).toLocaleDateString()}`}
                  </span>
                )}
              </div>

              {selected.summary && (
                <div>
                  <p className="font-semibold mb-1.5">Overview</p>
                  <p className="text-muted-foreground leading-relaxed">{selected.summary}</p>
                </div>
              )}

              {selected.scope && (
                <div>
                  <p className="font-semibold mb-1.5">Scope of Work</p>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{selected.scope}</p>
                </div>
              )}
            </div>

            {canRespond(selected) && (
              <DialogFooter className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                  disabled={respondMutation.isPending}
                  onClick={() => { setResponding("rejected"); respondMutation.mutate("rejected"); }}
                >
                  <XCircle size={14} className="mr-1.5" />
                  {responding === "rejected" && respondMutation.isPending ? "Declining…" : "Decline"}
                </Button>
                <Button
                  className="flex-1 glow-primary"
                  disabled={respondMutation.isPending}
                  onClick={() => { setResponding("approved"); respondMutation.mutate("approved"); }}
                >
                  <CheckCircle size={14} className="mr-1.5" />
                  {responding === "approved" && respondMutation.isPending ? "Approving…" : "Approve Proposal"}
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default Proposals;
