import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  CheckCircle,
  Video,
  Clock,
  Globe as GlobeIcon,
  CalendarDays,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, startOfDay } from "date-fns";
import { invokeFn } from "@/lib/functions";
import { track } from "@/lib/analytics";
import {
  slotsForLocalDate, eatDatesForLocalDate, MAX_DAYS_AHEAD, type Slot,
} from "../../supabase/functions/_shared/slots";

const contactSchema = z.object({
  fullName: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(20).optional(),
  company: z.string().trim().max(100).optional(),
});

const BookConsultation = () => {
  const { toast } = useToast();
  const [params] = useSearchParams();
  const [phase, setPhase] = useState<"form" | "done">("form");
  const [submitting, setSubmitting] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [notes, setNotes] = useState(() => (params.get("notes") ?? "").slice(0, 2000));
  const [contact, setContact] = useState({
    fullName: (params.get("name") ?? "").slice(0, 100),
    email: (params.get("email") ?? "").slice(0, 255),
    phone: "",
    company: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Booked Nairobi times keyed by Nairobi date (a visitor's day can span up to 3 Nairobi dates).
  const [booked, setBooked] = useState<Record<string, string[]>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [zoomJoinUrl, setZoomJoinUrl] = useState("");

  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  const timezoneLabel = useMemo(() => {
    try {
      const now = new Date();
      const long  = Intl.DateTimeFormat(undefined, { timeZoneName: "long"  }).formatToParts(now).find((p) => p.type === "timeZoneName")?.value ?? timezone;
      const short = Intl.DateTimeFormat(undefined, { timeZoneName: "short" }).formatToParts(now).find((p) => p.type === "timeZoneName")?.value ?? "";
      return short ? `${long} (${short})` : long;
    } catch {
      return timezone;
    }
  }, [timezone]);

  const today = useMemo(() => startOfDay(new Date()), []);

  // A day is selectable when it has at least one bookable slot in the visitor's own time zone.
  const disabledDays = (date: Date) =>
    date < today ||
    date > addDays(today, MAX_DAYS_AHEAD + 1) ||
    slotsForLocalDate(format(date, "yyyy-MM-dd"), timezone).length === 0;

  const slots = useMemo(
    () => (selectedDate ? slotsForLocalDate(format(selectedDate, "yyyy-MM-dd"), timezone) : []),
    [selectedDate, timezone],
  );

  // Fetch real availability (public RPC; the bookings table itself is not readable by visitors).
  useEffect(() => {
    if (!selectedDate) return;
    let cancelled = false;
    setLoadingSlots(true);
    setSelectedSlot(null);
    Promise.all(
      eatDatesForLocalDate(format(selectedDate, "yyyy-MM-dd")).map(async (d) => {
        const { data } = await supabase.rpc("get_booked_slots", { p_date: d });
        return [d, (data as string[] | null) ?? []] as const;
      }),
    ).then((entries) => {
      if (cancelled) return;
      setBooked((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
      setLoadingSlots(false);
    });
    return () => { cancelled = true; };
  }, [selectedDate]);

  const isBooked = (slot: Slot) => (booked[slot.eatDate] ?? []).includes(slot.eatTime);

  const submit = async () => {
    const result = contactSchema.safeParse({
      fullName: contact.fullName,
      email: contact.email,
      phone: contact.phone || undefined,
      company: contact.company || undefined,
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((i) => {
        fieldErrors[i.path[0] as string] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    if (!selectedDate) {
      setErrors({ date: "Select a date" });
      return;
    }
    if (!selectedSlot) {
      setErrors({ time: "Select a time slot" });
      return;
    }
    setErrors({});
    setSubmitting(true);

    const { data, error, status } = await invokeFn<{ zoom_join_url: string | null }>("book-consultation", {
      full_name: contact.fullName.trim(),
      email: contact.email.trim(),
      phone: contact.phone?.trim() || null,
      company: contact.company?.trim() || null,
      starts_at: selectedSlot.start.toISOString(),
      timezone,
      notes: notes.trim() || null,
    });

    setSubmitting(false);

    if (error) {
      if (status === 409) {
        // Someone else took it while this visitor was deciding — mark it and let them pick again.
        setBooked((prev) => ({
          ...prev,
          [selectedSlot.eatDate]: [...(prev[selectedSlot.eatDate] ?? []), selectedSlot.eatTime],
        }));
        setSelectedSlot(null);
      }
      toast({ title: "Booking failed", description: error, variant: "destructive" });
      return;
    }

    setZoomJoinUrl(data?.zoom_join_url ?? "");
    track("Consultation booked");
    setPhase("done");
    toast({ title: "Consultation booked!", description: "Check your email for the confirmation and calendar invite." });
  };

  if (phase === "done" && selectedSlot) {
    return (
      <section className="py-32  gradient-hero network-bg min-h-[70vh] flex items-center">
        <div className="container mx-auto text-center animate-fade-in">
          <CheckCircle className="mx-auto text-primary mb-6" size={64} />
          <h2 className="font-display font-bold text-3xl mb-4">Consultation Booked!</h2>
          <p className="text-muted-foreground mb-1">
            {format(new Date(`${selectedSlot.localDate}T00:00:00`), "EEEE, MMMM d, yyyy")} at {selectedSlot.localTime}
          </p>
          <p className="text-sm text-muted-foreground mb-6">via Zoom · {timezoneLabel}</p>

          {zoomJoinUrl && (
            <a
              href={zoomJoinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl mb-6 hover:opacity-90 transition-opacity"
            >
              <Video size={18} /> Join Zoom Meeting <ExternalLink size={14} />
            </a>
          )}

          <p className="text-sm text-muted-foreground mb-8">
            {zoomJoinUrl
              ? <>A confirmation email with the Zoom link has been sent to <strong>{contact.email}</strong>.</>
              : <>A confirmation has been sent to <strong>{contact.email}</strong>. Your Zoom link will follow shortly.</>}
          </p>
          <Button variant="outline" asChild><Link to="/">Back to Home</Link></Button>
        </div>
      </section>
    );
  }

  return (
    <>
      <SEO route="/book-consultation" />
      {/* ── Hero ── */}
      <section className="relative py-28  gradient-hero network-bg overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-primary/8 blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 left-1/3 w-60 h-60 rounded-full bg-accent/7 blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
        </div>
        <div className="container mx-auto text-center relative z-10 animate-fade-in">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary block mb-4">Free Consultation</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-4">
            Book a <span className="gradient-text">30-Minute Call</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            A focused discovery call with our team. No sales pitch — just honest advice on whether and how we can help.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground">
            {["Free of charge", "No commitment required", "Zoom video call", "Monday – Friday (Nairobi hours)", "All time zones welcome"].map((p) => (
              <span key={p} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left – Calendar & Time */}
            <div className="space-y-6">
              <div className="glass rounded-2xl p-6">
                <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <CalendarDays size={18} className="text-primary" /> Select a Date
                </h2>
                {errors.date && <p className="text-sm text-destructive mb-2">{errors.date}</p>}
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={disabledDays}
                  className="mx-auto"
                />
              </div>

              <div className="glass rounded-2xl p-6">
                <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-primary" /> Select a Time
                  {loadingSlots && (
                    <span className="ml-auto text-xs text-muted-foreground animate-pulse">Loading availability…</span>
                  )}
                </h2>
                {errors.time && <p className="text-sm text-destructive mb-2">{errors.time}</p>}
                {!selectedDate ? (
                  <p className="text-sm text-muted-foreground">Pick a date to see available times.</p>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No times available on this day. Please pick another date.</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slots.map((slot) => {
                      const taken = isBooked(slot);
                      const active = selectedSlot?.start.getTime() === slot.start.getTime();
                      return (
                        <button
                          key={slot.start.toISOString()}
                          type="button"
                          disabled={taken || loadingSlots}
                          onClick={() => { setSelectedSlot(slot); setErrors((e) => ({ ...e, time: "" })); }}
                          title={taken ? "Already booked" : `${slot.eatTime} in Nairobi`}
                          aria-pressed={active}
                          className={`rounded-lg py-2 text-sm font-medium transition-all border ${
                            taken
                              ? "border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50 line-through"
                              : active
                                ? "bg-primary text-primary-foreground border-primary glow-primary"
                                : "border-border bg-card hover:border-primary/50"
                          }`}
                        >
                          {slot.localTime}
                        </button>
                      );
                    })}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground bg-primary/5 border border-primary/15 rounded-lg px-3 py-2">
                  <GlobeIcon size={12} className="text-primary flex-shrink-0" />
                  <span>Times shown in your timezone: <span className="font-semibold text-foreground">{timezoneLabel}</span></span>
                </div>
              </div>

              {/* Zoom badge */}
              <div className="glass rounded-2xl p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Video size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Zoom Video Call</p>
                  <p className="text-xs text-muted-foreground">A Zoom link will be emailed to you after booking.</p>
                </div>
              </div>
            </div>

            {/* Right – Contact Info */}
            <div className="space-y-6">
              <div className="glass rounded-2xl p-6 space-y-4">
                <h2 className="font-display font-semibold">Your Details</h2>
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input value={contact.fullName} onChange={(e) => { setContact((c) => ({ ...c, fullName: e.target.value })); setErrors((e2) => ({ ...e2, fullName: "" })); }} placeholder="John Doe" />
                  {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" value={contact.email} onChange={(e) => { setContact((c) => ({ ...c, email: e.target.value })); setErrors((e2) => ({ ...e2, email: "" })); }} placeholder="john@example.com" />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={contact.phone} onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))} placeholder="+1 555 000 0000" />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input value={contact.company} onChange={(e) => setContact((c) => ({ ...c, company: e.target.value }))} placeholder="Acme Inc." />
                </div>
              </div>

              <div className="glass rounded-2xl p-6 space-y-4">
                <h2 className="font-display font-semibold">Notes (optional)</h2>
                <Textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What would you like to discuss?"
                />
              </div>

              {/* Summary */}
              {selectedDate && selectedSlot && (
                <div className="glass rounded-2xl p-6 border-primary/30 animate-fade-in">
                  <h2 className="font-display font-semibold mb-3">Booking Summary</h2>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><span className="text-foreground font-medium">Date:</span> {format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
                    <p><span className="text-foreground font-medium">Time:</span> {selectedSlot.localTime} ({timezoneLabel}) · {selectedSlot.eatTime} Nairobi</p>
                    <p><span className="text-foreground font-medium">Platform:</span> Zoom</p>
                    <p><span className="text-foreground font-medium">Duration:</span> 30 minutes</p>
                  </div>
                </div>
              )}

              <Button onClick={submit} size="lg" className="w-full glow-primary" disabled={submitting}>
                {submitting ? "Creating your Zoom meeting…" : "Confirm Booking"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                A Zoom invite will be sent to your email address immediately after booking.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BookConsultation;
