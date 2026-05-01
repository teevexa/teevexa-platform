import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Download } from "lucide-react";

interface Signup { id: string; full_name: string; email: string; company: string | null; industry: string | null; created_at: string; }

const Waitlist = () => {
  const [exporting, setExporting] = useState(false);

  const { data: signups = [], isLoading } = useQuery({
    queryKey: ["waitlist"],
    queryFn: async () => {
      const { data } = await supabase.from("waitlist_signups").select("*").order("created_at", { ascending: false });
      return (data || []) as Signup[];
    },
    staleTime: 60_000,
  });

  const exportCSV = () => {
    setExporting(true);
    const header = ["Name", "Email", "Company", "Industry", "Signed Up"].join(",");
    const rows = signups.map((s) => [
      s.full_name, s.email, s.company || "", s.industry || "",
      new Date(s.created_at).toLocaleString(),
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `teevexa-trace-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl">Teevexa Trace Waitlist</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{signups.length} signups</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} disabled={exporting || signups.length === 0} className="gap-1.5">
          <Download size={14} /> {exporting ? "Exporting…" : "Export CSV"}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : signups.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-12 text-center">
            <Clock className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground">No waitlist signups yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass overflow-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Company</TableHead>
              <TableHead>Industry</TableHead><TableHead>Date</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {signups.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.full_name}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{s.company || "—"}</TableCell>
                  <TableCell>{s.industry ? <Badge variant="outline">{s.industry}</Badge> : "—"}</TableCell>
                  <TableCell className="text-sm">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default Waitlist;
