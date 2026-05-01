import { useState, useMemo, useEffect } from "react";
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
import { format, addDays, isWeekend } from "date-fns";

const contactSchema = z.object({
  fullName: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(20).optional(),
  company: z.string().trim().max(100).optional(),
});

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00",
];

const BookConsultation = () => {
  const { toast } = useToast();
  const [phase, setPhase] = useState<"form" | "done">("form");
  const [submitting, setSubmitting] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [contact, setContact] = useState({ fullName: "", email: "", phone: "", company: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [zoomJoinUrl, setZoomJoinUrl] = useState("");

  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  const disabledDays = (date: Date) => {
    return date < new Date() || isWeekend(date) || date > addDays(new Date(), 60);
  };

  // Fetch already-booked slots whenever the selected date changes
  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setSelectedTime("");
    supabase
      .from("consultation_bookings")
      .select("selected_time")
      .eq("selected_date", format(selectedDate, "yyyy-MM-dd"))
      .then(({ data }) => {
        setBookedSlots(data?.map((b) => b.selected_time) ?? []);
        setLoadingSlots(false);
      });
  }, [selectedDate]);

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
    if (!selectedTime) {
      setErrors({ time: "Select a time slot" });
      return;
    }
    setErrors({});
    setSubmitting(true);

    const { data, error } = await supabase.functions.invoke("book-consultation", {
      body: {
        full_name: contact.fullName.trim(),
        email: contact.email.trim(),
        phone: contact.phone?.trim() || null,
        company: contact.company?.trim() || null,
        selected_date: format(selectedDate, "yyyy-MM-dd"),
        selected_time: selectedTime,
        timezone,
        notes: notes.trim() || null,
      },
    });

    setSubmitting(false);

    if (error || data?.error) {
      const msg = data?.error ?? "Please try again.";
      // Re-fetch slots in case a race condition caused this slot to be taken
      if (data?.error?.includes("already been booked")) {
        setBookedSlots((prev) => [...prev, selectedTime]);
        setSelectedTime("");
      }
      toast({ title: "Booking failed", description: msg, variant: "destructive" });
      return;
    }

    setZoomJoinUrl(data?.zoom_join_url ?? "");
    setPhase("done");
    toast({ title: "Consultation booked!", description: "Check your email for the Zoom link." });
  };

  if (phase === "done") {
    return (
      <section className="py-32 px-4 gradient-hero network-bg min-h-[70vh] flex items-center">
        <div className="container mx-auto max-w-lg text-center animate-fade-in">
          <CheckCircle className="mx-auto text-primary mb-6" size={64} />
          <h2 className="font-display font-bold text-3xl mb-4">Consultation Booked!</h2>
          <p className="text-muted-foreground mb-1">
            {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")} at {selectedTime}
          </p>
          <p className="text-sm text-muted-foreground mb-6">via Zoom · {timezone}</p>

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
            A confirmation email with the Zoom link has been sent to <strong>{contact.email}</strong>.
          </p>
          <Button variant="outline" asChild><a href="/">Back to Home</a></Button>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative py-28 px-4 gradient-hero network-bg overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-primary/8 blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 left-1/3 w-60 h-60 rounded-full bg-accent/7 blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
        </div>
        <div className="container mx-auto text-center relative z-10 animate-fade-in max-w-3xl">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary block mb-4">Free Consultation</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-4">
            Book a <span className="gradient-text">30-Minute Call</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            A focused discovery call with our team. No sales pitch — just honest advice on whether and how we can help.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground">
            {["Free of charge", "No commitment required", "Zoom video call", "Monday – Friday"].map((p) => (
              <span key={p} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left – Calendar & Time */}
            <div className="space-y-6">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <CalendarDays size={18} className="text-primary" /> Select a Date
                </h3>
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
                <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-primary" /> Select a Time
                  {loadingSlots && (
                    <span className="ml-auto text-xs text-muted-foreground animate-pulse">Loading availability…</span>
                  )}
                </h3>
                {errors.time && <p className="text-sm text-destructive mb-2">{errors.time}</p>}
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((t) => {
                    const booked = bookedSlots.includes(t);
                    return (
                      <button
                        key={t}
                        disabled={booked || loadingSlots}
                        onClick={() => { setSelectedTime(t); setErrors((e) => ({ ...e, time: "" })); }}
                        title={booked ? "Already booked" : undefined}
                        className={`rounded-lg py-2 text-sm font-medium transition-all border ${
                          booked
                            ? "border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50 line-through"
                            : selectedTime === t
                              ? "bg-primary text-primary-foreground border-primary glow-primary"
                              : "border-border bg-card hover:border-primary/50"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                  <GlobeIcon size={12} /> {timezone}
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
                <h3 className="font-display font-semibold">Your Details</h3>
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
                  <Input value={contact.phone} onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))} placeholder="+254 ..." />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input value={contact.company} onChange={(e) => setContact((c) => ({ ...c, company: e.target.value }))} placeholder="Acme Inc." />
                </div>
              </div>

              <div className="glass rounded-2xl p-6 space-y-4">
                <h3 className="font-display font-semibold">Notes (optional)</h3>
                <Textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What would you like to discuss?"
                />
              </div>

              {/* Summary */}
              {selectedDate && selectedTime && (
                <div className="glass rounded-2xl p-6 border-primary/30 animate-fade-in">
                  <h3 className="font-display font-semibold mb-3">Booking Summary</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><span className="text-foreground font-medium">Date:</span> {format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
                    <p><span className="text-foreground font-medium">Time:</span> {selectedTime} ({timezone})</p>
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
