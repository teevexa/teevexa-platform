import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Eye, Video, CheckCircle2, XCircle, UserX, ArrowRight, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type BookingStatus = "upcoming" | "completed" | "no_show" | "cancelled";

interface Booking {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  selected_date: string;
  selected_time: string;
  timezone: string;
  meeting_type: string;
  notes: string | null;
  created_at: string;
  zoom_join_url: string | null;
  zoom_start_url: string | null;
  zoom_meeting_id: string | null;
  status: BookingStatus;
}

const STATUS_STYLES: Record<BookingStatus, string> = {
  upcoming:  "bg-primary/20 text-primary",
  completed: "bg-green-500/20 text-green-400",
  no_show:   "bg-yellow-500/20 text-yellow-400",
  cancelled: "bg-red-500/20 text-red-400",
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  upcoming:  "Upcoming",
  completed: "Completed",
  no_show:   "No-show",
  cancelled: "Cancelled",
};

const isPast = (date: string) => new Date(date) < new Date(new Date().toDateString());

const Consultations = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // "Create Lead" form state
  const [creatingLead, setCreatingLead] = useState(false);
  const [leadNotes, setLeadNotes] = useState("");
  const [leadCreated, setLeadCreated] = useState<string | null>(null); // booking id that was converted

  useEffect(() => {
    supabase
      .from("consultation_bookings")
      .select("*")
      .order("selected_date", { ascending: false })
      .then(({ data }) => {
        setBookings((data as Booking[]) || []);
        setLoading(false);
      });

    const channel = supabase
      .channel("consultation-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "consultation_bookings" },
        (payload) => setBookings((prev) => [payload.new as Booking, ...prev]))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    const matchesSearch = !search ||
      b.full_name.toLowerCase().includes(q) ||
      b.email.toLowerCase().includes(q) ||
      (b.company || "").toLowerCase().includes(q);
    const matchesStatus = filterStatus === "all" || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Sort: upcoming future dates ascending, past dates descending — grouped
  const sorted = [...filtered].sort((a, b) => {
    const aFuture = !isPast(a.selected_date);
    const bFuture = !isPast(b.selected_date);
    if (aFuture && !bFuture) return -1;
    if (!aFuture && bFuture) return 1;
    // Both future → ascending
    if (aFuture) return a.selected_date.localeCompare(b.selected_date);
    // Both past → descending
    return b.selected_date.localeCompare(a.selected_date);
  });

  const updateStatus = async (booking: Booking, status: BookingStatus) => {
    setUpdatingStatus(true);
    const { error } = await supabase
      .from("consultation_bookings")
      .update({ status })
      .eq("id", booking.id);

    if (error) {
      toast({ title: "Failed to update status", variant: "destructive" });
    } else {
      setBookings((prev) => prev.map((b) => b.id === booking.id ? { ...b, status } : b));
      setSelected((prev) => prev?.id === booking.id ? { ...prev, status } : prev);
    }
    setUpdatingStatus(false);
  };

  const createLead = async (booking: Booking) => {
    setCreatingLead(true);
    const details = [
      `Converted from consultation on ${booking.selected_date} at ${booking.selected_time} (${booking.timezone}).`,
      booking.notes ? `Client notes: ${booking.notes}` : null,
      leadNotes ? `Admin notes: ${leadNotes}` : null,
    ].filter(Boolean).join("\n\n");

    const { error } = await supabase.from("project_inquiries").insert({
      full_name:          booking.full_name,
      email:              booking.email,
      phone:              booking.phone,
      company:            booking.company,
      project_type:       "custom",
      additional_details: details,
      status:             "contacted",
      user_id:            null,
    });

    if (error) {
      toast({ title: "Failed to create lead", description: error.message, variant: "destructive" });
    } else {
      setLeadCreated(booking.id);
      setLeadNotes("");
      toast({ title: "Lead created", description: `${booking.full_name} now appears in the Leads page with status "Contacted".` });
    }
    setCreatingLead(false);
  };

  const openBooking = (b: Booking) => {
    setSelected(b);
    setLeadNotes("");
    setLeadCreated(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Consultations</h1>
        <Badge variant="outline">{bookings.length} total</Badge>
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
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : sorted.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-12 text-center">
            <CalendarDays className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground">No consultations found.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Zoom</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((b) => (
                <TableRow
                  key={b.id}
                  className={b.status === "cancelled" || b.status === "no_show" ? "opacity-55" : ""}
                >
                  <TableCell className="font-medium">{b.full_name}</TableCell>
                  <TableCell className="text-sm">{b.email}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {new Date(b.selected_date + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </TableCell>
                  <TableCell className="text-sm">{b.selected_time}</TableCell>
                  <TableCell className="text-sm">{b.company || "—"}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_STYLES[b.status] || ""}>{STATUS_LABELS[b.status] || b.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {b.zoom_start_url ? (
                      <a href={b.zoom_start_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7">
                          <Video size={12} /> Start
                        </Button>
                      </a>
                    ) : <span className="text-muted-foreground text-xs">—</span>}
                  </TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => openBooking(b)}>
                      <Eye size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) { setSelected(null); setLeadNotes(""); setLeadCreated(null); } }}>
        <DialogContent className="glass max-w-lg max-h-[88vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-6">
              <span>Consultation Details</span>
              {selected && (
                <Badge className={STATUS_STYLES[selected.status]}>{STATUS_LABELS[selected.status]}</Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4 text-sm">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div><span className="text-muted-foreground block">Name</span><p className="font-medium">{selected.full_name}</p></div>
                <div><span className="text-muted-foreground block">Email</span><p><a href={`mailto:${selected.email}`} className="text-primary hover:underline">{selected.email}</a></p></div>
                <div><span className="text-muted-foreground block">Phone</span><p>{selected.phone || "—"}</p></div>
                <div><span className="text-muted-foreground block">Company</span><p>{selected.company || "—"}</p></div>
                <div><span className="text-muted-foreground block">Date</span><p>{new Date(selected.selected_date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}</p></div>
                <div><span className="text-muted-foreground block">Time</span><p>{selected.selected_time}</p></div>
                <div><span className="text-muted-foreground block">Timezone</span><p className="text-xs">{selected.timezone}</p></div>
                <div><span className="text-muted-foreground block">Zoom ID</span><p className="text-xs">{selected.zoom_meeting_id || "—"}</p></div>
              </div>

              {selected.notes && (
                <div>
                  <span className="text-muted-foreground block mb-1">Client Notes</span>
                  <p className="text-muted-foreground leading-relaxed bg-muted/30 rounded-lg px-3 py-2">{selected.notes}</p>
                </div>
              )}

              {/* Zoom links */}
              {(selected.zoom_start_url || selected.zoom_join_url) && (
                <div className="flex gap-2 flex-wrap">
                  {selected.zoom_start_url && (
                    <a href={selected.zoom_start_url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="gap-1.5 glow-primary">
                        <Video size={13} /> Start Meeting (Host)
                      </Button>
                    </a>
                  )}
                  {selected.zoom_join_url && (
                    <a href={selected.zoom_join_url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="gap-1.5">
                        <Video size={13} /> Join Link
                      </Button>
                    </a>
                  )}
                </div>
              )}

              {/* Status Update */}
              <div className="border-t border-border pt-4 space-y-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Update Status</span>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant={selected.status === "completed" ? "default" : "outline"}
                    className={selected.status === "completed" ? "bg-green-600 hover:bg-green-700 border-0" : "border-green-500/30 text-green-400 hover:bg-green-500/10"}
                    disabled={updatingStatus || selected.status === "completed"}
                    onClick={() => updateStatus(selected, "completed")}
                  >
                    <CheckCircle2 size={13} className="mr-1.5" /> Mark Complete
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={selected.status === "no_show" ? "border-yellow-500 bg-yellow-500/10 text-yellow-400" : "border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"}
                    disabled={updatingStatus || selected.status === "no_show"}
                    onClick={() => updateStatus(selected, "no_show")}
                  >
                    <UserX size={13} className="mr-1.5" /> No-show
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={selected.status === "cancelled" ? "border-red-500 bg-red-500/10 text-red-400" : "border-red-500/30 text-red-400 hover:bg-red-500/10"}
                    disabled={updatingStatus || selected.status === "cancelled"}
                    onClick={() => updateStatus(selected, "cancelled")}
                  >
                    <XCircle size={13} className="mr-1.5" /> Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={selected.status === "upcoming" ? "border-primary bg-primary/10 text-primary" : ""}
                    disabled={updatingStatus || selected.status === "upcoming"}
                    onClick={() => updateStatus(selected, "upcoming")}
                  >
                    ↩ Reset to Upcoming
                  </Button>
                </div>
              </div>

              {/* Convert to Lead */}
              <div className="border-t border-border pt-4 space-y-3">
                <div>
                  <span className="font-semibold flex items-center gap-2">
                    <ArrowRight size={15} className="text-primary" /> Convert to Lead
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Creates a lead record in the Leads pipeline pre-filled with this person's details.
                    From there you can create a proposal or onboard them to a project once they sign up.
                  </p>
                </div>

                {leadCreated === selected.id ? (
                  <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 rounded-lg px-3 py-2">
                    <CheckCircle2 size={15} />
                    Lead created. Find {selected.full_name} in the <a href="/admin/leads" className="underline ml-1">Leads page</a>.
                  </div>
                ) : (
                  <>
                    <Textarea
                      rows={2}
                      placeholder="Optional: add a note about what was discussed (saved to the lead record)…"
                      value={leadNotes}
                      onChange={(e) => setLeadNotes(e.target.value)}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      disabled={creatingLead}
                      onClick={() => createLead(selected)}
                    >
                      <ArrowRight size={13} className="mr-1.5" />
                      {creatingLead ? "Creating…" : "Create Lead from Consultation"}
                    </Button>
                  </>
                )}
              </div>

              <div className="text-xs text-muted-foreground border-t border-border pt-3">
                Booked: {new Date(selected.created_at).toLocaleString()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Consultations;
