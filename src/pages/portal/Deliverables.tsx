import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, FileText, Download, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { CardRowSkeleton } from "@/components/portal/PortalSkeleton";
import PortalError from "@/components/portal/PortalError";

interface Deliverable {
  id: string; project_id: string; title: string; description: string | null;
  file_path: string | null; file_name: string | null; status: string;
  submitted_by: string; review_comment: string | null;
  submitted_at: string; reviewed_at: string | null; project_title?: string;
}

const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
  pending: { color: "bg-muted text-muted-foreground", icon: Clock },
  approved: { color: "bg-green-500/20 text-green-400", icon: CheckCircle },
  rejected: { color: "bg-destructive/20 text-destructive", icon: XCircle },
  revision: { color: "bg-accent/20 text-accent", icon: Clock },
};

const Deliverables = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState("");

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    staleTime: Infinity,
  });

  const { data: deliverables = [], isLoading, error, refetch } = useQuery<Deliverable[]>({
    queryKey: ["deliverables", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data: projects } = await supabase.from("client_projects").select("id, title").eq("user_id", user!.id);
      if (!projects || projects.length === 0) return [];
      const projectIds = projects.map((p) => p.id);
      const { data, error } = await supabase.from("deliverables").select("*")
        .in("project_id", projectIds).order("submitted_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((d) => ({
        ...d,
        project_title: projects.find((p) => p.id === d.project_id)?.title || "Unknown",
      })) as Deliverable[];
    },
  });

  // Real-time: new deliverables submitted by admin
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel("deliverables-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "deliverables" },
        () => queryClient.invalidateQueries({ queryKey: ["deliverables", user.id] }))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, queryClient]);

  const handleReview = async (id: string, action: "approved" | "rejected") => {
    if (action === "rejected" && !comment.trim()) {
      toast({ title: "Please provide feedback for rejection", variant: "destructive" }); return;
    }
    const { error } = await supabase.from("deliverables").update({
      status: action,
      reviewed_by: user?.id,
      review_comment: comment.trim() || null,
      reviewed_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) { toast({ title: "Update failed", variant: "destructive" }); return; }
    queryClient.setQueryData<Deliverable[]>(["deliverables", user?.id], (prev) =>
      (prev || []).map((d) => d.id === id ? { ...d, status: action, review_comment: comment.trim() || null } : d)
    );
    setReviewId(null); setComment("");
    toast({ title: `Deliverable ${action}` });
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    const { data } = await supabase.storage.from("project-attachments").createSignedUrl(filePath, 300);
    if (data?.signedUrl) { const a = document.createElement("a"); a.href = data.signedUrl; a.download = fileName; a.click(); }
  };

  const previewFile = async (filePath: string, fileName: string) => {
    const { data } = await supabase.storage.from("project-attachments").createSignedUrl(filePath, 300);
    if (data?.signedUrl) { setPreviewUrl(data.signedUrl); setPreviewName(fileName); }
  };

  const isImageFile = (name: string) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);
  const isPdfFile = (name: string) => /\.pdf$/i.test(name);

  const pending = deliverables.filter((d) => d.status === "pending");
  const reviewed = deliverables.filter((d) => d.status !== "pending");

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display font-bold text-2xl">Deliverables & Approvals</h1>

      {isLoading ? (
        <CardRowSkeleton rows={4} />
      ) : error ? (
        <PortalError onRetry={refetch} />
      ) : deliverables.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-16 text-center">
            <FileText className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="font-medium mb-1">No deliverables yet</p>
            <p className="text-sm text-muted-foreground">When our team submits work for your review, it will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock size={18} className="text-accent" /> Awaiting Your Review
                <Badge className="bg-accent/20 text-accent">{pending.length}</Badge>
              </h2>
              {pending.map((d) => (
                <Card key={d.id} className="glass border-accent/30">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{d.title}</p>
                        <p className="text-xs text-muted-foreground">Project: {d.project_title}</p>
                        {d.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{d.description}</p>}
                        <p className="text-xs text-muted-foreground mt-1">Submitted: {new Date(d.submitted_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {d.file_path && d.file_name && (
                          <>
                            {(isImageFile(d.file_name) || isPdfFile(d.file_name)) && (
                              <Button size="sm" variant="outline" onClick={() => previewFile(d.file_path!, d.file_name!)}>
                                <Eye size={14} className="mr-1" /> Preview
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => downloadFile(d.file_path!, d.file_name!)}>
                              <Download size={14} className="mr-1" /> Download
                            </Button>
                          </>
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
                    <CardContent className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon size={18} className={d.status === "approved" ? "text-green-400 shrink-0" : "text-destructive shrink-0"} />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{d.title}</p>
                          <p className="text-xs text-muted-foreground">{d.project_title}</p>
                          {d.review_comment && <p className="text-xs text-muted-foreground mt-0.5 italic">"{d.review_comment}"</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
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

      {/* Reject Dialog */}
      <Dialog open={!!reviewId} onOpenChange={() => { setReviewId(null); setComment(""); }}>
        <DialogContent className="glass">
          <DialogHeader><DialogTitle>Reject Deliverable</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Textarea placeholder="Please explain what needs to be changed or improved…" value={comment} onChange={(e) => setComment(e.target.value)} rows={4} />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => { setReviewId(null); setComment(""); }}>Cancel</Button>
              <Button variant="destructive" onClick={() => reviewId && handleReview(reviewId, "rejected")}>Reject with Feedback</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => { setPreviewUrl(null); setPreviewName(""); }}>
        <DialogContent className="glass max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader><DialogTitle className="truncate">{previewName}</DialogTitle></DialogHeader>
          <div className="flex-1 overflow-auto min-h-0">
            {previewUrl && isImageFile(previewName) && (
              <img src={previewUrl} alt={previewName} className="max-w-full h-auto rounded-lg mx-auto" />
            )}
            {previewUrl && isPdfFile(previewName) && (
              <iframe src={previewUrl} title={previewName} className="w-full h-[60vh] rounded-lg border-0" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Deliverables;
