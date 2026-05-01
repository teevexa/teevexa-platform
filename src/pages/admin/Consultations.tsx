import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarDays, Eye, Video } from "lucide-react";

interface Booking {
  id: string; full_name: string; email: string; phone: string | null;
  company: string | null; selected_date: string; selected_time: string;
  timezone: string; meeting_type: string; notes: string | null; created_at: string;
  zoom_join_url: string | null; zoom_start_url: string | null; zoom_meeting_id: string | null;
}

const Consultations = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Booking | null>(null);

  useEffect(() => {
    supabase.from("consultation_bookings").select("*").order("selected_date", { ascending: false })
      .then(({ data }) => { setBookings(data || []); setLoading(false); });

    // Realtime subscription
    const channel = supabase
      .channel("consultation-realtime")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "consultation_bookings",
      }, (payload) => {
        setBookings((prev) => [payload.new as Booking, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Consultations</h1>
        <Badge variant="outline">{bookings.length} total</Badge>
      </div>

      {loading ? <p className="text-muted-foreground">Loading...</p> : bookings.length === 0 ? (
        <Card className="glass"><CardContent className="py-12 text-center"><CalendarDays className="mx-auto text-muted-foreground mb-4" size={48} /><p className="text-muted-foreground">No consultations booked yet.</p></CardContent></Card>
      ) : (
        <Card className="glass overflow-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Date</TableHead>
              <TableHead>Time</TableHead><TableHead>Company</TableHead><TableHead>Zoom</TableHead><TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.full_name}</TableCell>
                  <TableCell>{b.email}</TableCell>
                  <TableCell>{new Date(b.selected_date).toLocaleDateString()}</TableCell>
                  <TableCell>{b.selected_time}</TableCell>
                  <TableCell>{b.company || "—"}</TableCell>
                  <TableCell>
                    {b.zoom_start_url ? (
                      <a href={b.zoom_start_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="gap-1.5 text-xs"><Video size={13} /> Start</Button>
                      </a>
                    ) : <span className="text-muted-foreground text-xs">—</span>}
                  </TableCell>
                  <TableCell><Button size="icon" variant="ghost" onClick={() => setSelected(b)}><Eye size={16} /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="glass max-w-lg">
          <DialogHeader><DialogTitle>Consultation Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Name:</span> {selected.full_name}</div>
              <div><span className="text-muted-foreground">Email:</span> {selected.email}</div>
              <div><span className="text-muted-foreground">Phone:</span> {selected.phone || "—"}</div>
              <div><span className="text-muted-foreground">Company:</span> {selected.company || "—"}</div>
              <div><span className="text-muted-foreground">Date:</span> {new Date(selected.selected_date).toLocaleDateString()}</div>
              <div><span className="text-muted-foreground">Time:</span> {selected.selected_time}</div>
              <div><span className="text-muted-foreground">Timezone:</span> {selected.timezone}</div>
              <div><span className="text-muted-foreground">Zoom ID:</span> {selected.zoom_meeting_id || "—"}</div>
              {selected.zoom_start_url && (
                <a href={selected.zoom_start_url} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="gap-2 mt-1"><Video size={14} /> Start Meeting (Host)</Button>
                </a>
              )}
              {selected.zoom_join_url && (
                <div className="text-xs text-muted-foreground break-all">
                  Guest link: <a href={selected.zoom_join_url} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{selected.zoom_join_url}</a>
                </div>
              )}
              <div><span className="text-muted-foreground">Notes:</span> {selected.notes || "—"}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Consultations;
