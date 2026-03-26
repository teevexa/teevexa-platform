import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, FileText, Download, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Deliverable {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  file_path: string | null;
  file_name: string | null;
  status: string;
  submitted_by: string;
  review_comment: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  project_title?: string;
}

const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
  pending: { color: "bg-muted text-muted-foreground", icon: Clock },
  approved: { color: "bg-green-500/20 text-green-400", icon: CheckCircle },
  rejected: { color: "bg-destructive/20 text-destructive", icon: XCircle },
  revision: { color: "bg-accent/20 text-accent", icon: Clock },
};

const Deliverables = () => {
  const { toast } = useToast();
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: projects } = await supabase.from("client_projects").select("id, title").eq("user_id", user.id);
      if (!projects || projects.length === 0) { setLoading(false); return; }

      const projectIds = projects.map((p) => p.id);
      const { data } = await supabase
        .from("deliverables")
        .select("*")
        .in("project_id", projectIds)
        .order("submitted_at", { ascending: false });

      const enriched = (data || []).map((d) => ({
        ...d,
        project_title: projects.find((p) => p.id === d.project_id)?.title || "Unknown",
      }));
      setDeliverables(enriched);
      setLoading(false);
    };
    load();
  }, []);

  const handleReview = async (id: string, action: "approved" | "rejected") => {
    if (action === "rejected" && !comment.trim()) {
      toast({ title: "Please provide feedback for rejection", variant: "destructive" });
      return;
    }

    await supabase.from("deliverables").update({
      status: action,
      reviewed_by: userId,
      review_comment: comment.trim() || null,
      reviewed_at: new Date().toISOString(),
    }).eq("id", id);

    setDeliverables((prev) =>
      prev.map((d) => d.id === id ? { ...d, status: action, review_comment: comment.trim() || null, reviewed_at: new Date().toISOString() } : d)
    );
    setReviewId(null);
    setComment("");
    toast({ title: `Deliverable ${action}` });
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    const { data } = await supabase.storage.from("project-attachments").createSignedUrl(filePath, 300);
    if (data?.signedUrl) {
      const a = document.createElement("a");
      a.href = data.signedUrl; a.download = fileName; a.click();
    }
  };

  if (loading) return <div className="animate-pulse-glow text-primary p-8">Loading...</div>;

  const pending = deliverables.filter((d) => d.status === "pending");
  const reviewed = deliverables.filter((d) => d.status !== "pending");

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display font-bold text-2xl">Deliverables & Approvals</h1>

      {deliverables.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground">No deliverables submitted yet.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock size={18} className="text-accent" /> Awaiting Your Review ({pending.length})
              </h2>
              {pending.map((d) => (
                <Card key={d.id} className="glass border-accent/30">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium">{d.title}</p>
                        <p className="text-xs text-muted-foreground">Project: {d.project_title}</p>
                        {d.description && <p className="text-sm text-muted-foreground mt-1">{d.description}</p>}
                        <p className="text-xs text-muted-foreground mt-1">
                          Submitted: {new Date(d.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {d.file_path && d.file_name && (
                          <Button size="sm" variant="outline" onClick={() => downloadFile(d.file_path!, d.file_name!)}>
                            <Download size={14} className="mr-1" /> File
                          </Button>
                        )}
                        <Button size="sm" onClick={() => handleReview(d.id, "approved")}>
                          <CheckCircle size={14} className="mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setReviewId(d.id)}>
                          <XCircle size={14} className="mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {reviewed.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Review History</h2>
              {reviewed.map((d) => {
                const cfg = statusConfig[d.status] || statusConfig.pending;
                const Icon = cfg.icon;
                return (
                  <Card key={d.id} className="glass">
                    <CardContent className="py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon size={18} className={d.status === "approved" ? "text-green-400" : "text-destructive"} />
                        <div>
                          <p className="font-medium">{d.title}</p>
                          <p className="text-xs text-muted-foreground">{d.project_title}</p>
                          {d.review_comment && (
                            <p className="text-xs text-muted-foreground mt-1 italic">"{d.review_comment}"</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={cfg.color}>{d.status}</Badge>
                        {d.file_path && d.file_name && (
                          <Button size="icon" variant="ghost" onClick={() => downloadFile(d.file_path!, d.file_name!)}>
                            <Download size={16} />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      <Dialog open={!!reviewId} onOpenChange={() => { setReviewId(null); setComment(""); }}>
        <DialogContent className="glass">
          <DialogHeader><DialogTitle>Reject Deliverable</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Please explain what needs to be changed..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => { setReviewId(null); setComment(""); }}>Cancel</Button>
              <Button variant="destructive" onClick={() => reviewId && handleReview(reviewId, "rejected")}>
                Reject with Feedback
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Deliverables;
