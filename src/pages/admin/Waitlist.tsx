import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock } from "lucide-react";

interface Signup { id: string; full_name: string; email: string; company: string | null; industry: string | null; created_at: string; }

const Waitlist = () => {
  const [signups, setSignups] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("waitlist_signups").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setSignups(data || []); setLoading(false); });
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Teevexa Trace Waitlist</h1>
        <Badge variant="outline">{signups.length} signups</Badge>
      </div>

      {loading ? <p className="text-muted-foreground">Loading...</p> : signups.length === 0 ? (
        <Card className="glass"><CardContent className="py-12 text-center"><Clock className="mx-auto text-muted-foreground mb-4" size={48} /><p className="text-muted-foreground">No waitlist signups yet.</p></CardContent></Card>
      ) : (
        <Card className="glass overflow-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Company</TableHead><TableHead>Industry</TableHead><TableHead>Date</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {signups.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.full_name}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{s.company || "—"}</TableCell>
                  <TableCell>{s.industry ? <Badge variant="outline">{s.industry}</Badge> : "—"}</TableCell>
                  <TableCell>{new Date(s.created_at).toLocaleDateString()}</TableCell>
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
