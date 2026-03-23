import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollText, Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Json;
  created_at: string;
}

const PAGE_SIZE = 25;

const actionColor: Record<string, string> = {
  create: "bg-green-500/20 text-green-400",
  update: "bg-primary/20 text-primary",
  delete: "bg-destructive/20 text-destructive",
  approve: "bg-green-500/20 text-green-400",
  reject: "bg-yellow-500/20 text-yellow-400",
  login: "bg-muted text-muted-foreground",
};

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const load = async () => {
    setLoading(true);
    let query = supabase
      .from("audit_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (actionFilter !== "all") query = query.eq("action", actionFilter);
    if (entityFilter !== "all") query = query.eq("entity_type", entityFilter);
    if (search.trim()) query = query.or(`action.ilike.%${search}%,entity_type.ilike.%${search}%,entity_id.ilike.%${search}%`);

    const { data, count } = await query;
    const items = (data || []) as AuditLog[];
    setLogs(items);
    setTotal(count || 0);

    // Load actor profiles
    const actorIds = [...new Set(items.map((l) => l.actor_id).filter(Boolean))] as string[];
    if (actorIds.length > 0) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", actorIds);
      const map: Record<string, string> = {};
      (profileData || []).forEach((p) => { map[p.user_id] = p.display_name || "Unknown"; });
      setProfiles((prev) => ({ ...prev, ...map }));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, actionFilter, entityFilter]);

  const handleSearch = () => { setPage(0); load(); };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const renderDetails = (details: Json) => {
    if (!details || typeof details !== "object") return <span className="text-muted-foreground">—</span>;
    return (
      <pre className="text-xs bg-muted/50 p-3 rounded-lg overflow-auto max-h-60 whitespace-pre-wrap">
        {JSON.stringify(details, null, 2)}
      </pre>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display font-bold text-2xl">Audit Logs</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2 flex-1 min-w-[200px]">
          <Input
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button variant="outline" size="icon" onClick={handleSearch}><Search size={16} /></Button>
        </div>
        <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(0); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Action" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="approve">Approve</SelectItem>
            <SelectItem value="reject">Reject</SelectItem>
          </SelectContent>
        </Select>
        <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(0); }}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Entity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            <SelectItem value="project">Project</SelectItem>
            <SelectItem value="milestone">Milestone</SelectItem>
            <SelectItem value="invoice">Invoice</SelectItem>
            <SelectItem value="user_role">User Role</SelectItem>
            <SelectItem value="case_study">Case Study</SelectItem>
            <SelectItem value="blog_post">Blog Post</SelectItem>
            <SelectItem value="job">Job</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? <p className="text-muted-foreground">Loading...</p> : logs.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-12 text-center">
            <ScrollText className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground">No audit logs match your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="glass overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Entity ID</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((l) => (
                  <TableRow key={l.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedLog(l)}>
                    <TableCell className="text-sm">
                      {l.actor_id ? profiles[l.actor_id] || l.actor_id.slice(0, 8) + "..." : "System"}
                    </TableCell>
                    <TableCell>
                      <Badge className={actionColor[l.action] || "bg-muted text-muted-foreground"}>{l.action}</Badge>
                    </TableCell>
                    <TableCell className="capitalize">{l.entity_type.replace(/_/g, " ")}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {l.entity_id ? l.entity_id.slice(0, 8) + "..." : "—"}
                    </TableCell>
                    <TableCell className="text-sm">{new Date(l.created_at).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {l.details ? (
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedLog(l); }}>
                          View
                        </Button>
                      ) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                <ChevronLeft size={16} /> Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                Next <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="glass max-w-lg">
          <DialogHeader><DialogTitle>Audit Log Detail</DialogTitle></DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Actor</p>
                  <p className="font-medium">{selectedLog.actor_id ? profiles[selectedLog.actor_id] || selectedLog.actor_id : "System"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Action</p>
                  <Badge className={actionColor[selectedLog.action] || ""}>{selectedLog.action}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Entity Type</p>
                  <p className="font-medium capitalize">{selectedLog.entity_type.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Entity ID</p>
                  <p className="font-mono text-xs">{selectedLog.entity_id || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Timestamp</p>
                  <p className="font-medium">{new Date(selectedLog.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-2">Details</p>
                {renderDetails(selectedLog.details)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditLogs;
