import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarDays } from "lucide-react";

interface Booking {
  id: string; full_name: string; email: string; phone: string | null;
  company: string | null; selected_date: string; selected_time: string;
  meeting_type: string; notes: string | null; created_at: string;
}

const Consultations = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("consultation_bookings").select("*").order("selected_date", { ascending: false })
      .then(({ data }) => { setBookings(data || []); setLoading(false); });
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display font-bold text-2xl">Consultations</h1>

      {loading ? <p className="text-muted-foreground">Loading...</p> : bookings.length === 0 ? (
        <Card className="glass"><CardContent className="py-12 text-center"><CalendarDays className="mx-auto text-muted-foreground mb-4" size={48} /><p className="text-muted-foreground">No consultations booked yet.</p></CardContent></Card>
      ) : (
        <Card className="glass overflow-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Date</TableHead>
              <TableHead>Time</TableHead><TableHead>Type</TableHead><TableHead>Company</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.full_name}</TableCell>
                  <TableCell>{b.email}</TableCell>
                  <TableCell>{new Date(b.selected_date).toLocaleDateString()}</TableCell>
                  <TableCell>{b.selected_time}</TableCell>
                  <TableCell><Badge variant="outline">{b.meeting_type}</Badge></TableCell>
                  <TableCell>{b.company || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default Consultations;
