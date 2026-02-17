import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollText } from "lucide-react";

interface AuditLog { id: string; actor_id: string | null; action: string; entity_type: string; entity_id: string | null; details: unknown; created_at: string; }

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => { setLogs(data || []); setLoading(false); });
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display font-bold text-2xl">Audit Logs</h1>

      {loading ? <p className="text-muted-foreground">Loading...</p> : logs.length === 0 ? (
        <Card className="glass"><CardContent className="py-12 text-center"><ScrollText className="mx-auto text-muted-foreground mb-4" size={48} /><p className="text-muted-foreground">No audit logs yet.</p></CardContent></Card>
      ) : (
        <Card className="glass overflow-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Action</TableHead><TableHead>Entity</TableHead><TableHead>Timestamp</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {logs.map((l) => (
                <TableRow key={l.id}>
                  <TableCell><Badge variant="outline">{l.action}</Badge></TableCell>
                  <TableCell>{l.entity_type} {l.entity_id ? `#${l.entity_id.slice(0, 8)}` : ""}</TableCell>
                  <TableCell>{new Date(l.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default AuditLogs;
