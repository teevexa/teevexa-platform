import { useState, useMemo } from "react";
import { z } from "zod";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  CheckCircle,
  Video,
  Clock,
  Globe as GlobeIcon,
  CalendarDays,
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

const meetingTypes = [
  { value: "zoom", label: "Zoom", icon: Video },
  { value: "google-meet", label: "Google Meet", icon: Video },
];

const BookConsultation = () => {
  const { toast } = useToast();
  const [phase, setPhase] = useState<"form" | "done">("form");
  const [submitting, setSubmitting] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("");
  const [meetingType, setMeetingType] = useState("zoom");
  const [notes, setNotes] = useState("");
  const [contact, setContact] = useState({ fullName: "", email: "", phone: "", company: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  const disabledDays = (date: Date) => {
    return date < new Date() || isWeekend(date) || date > addDays(new Date(), 60);
  };

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

    const { error } = await supabase.from("consultation_bookings").insert({
      full_name: contact.fullName.trim(),
      email: contact.email.trim(),
      phone: contact.phone?.trim() || null,
      company: contact.company?.trim() || null,
      selected_date: format(selectedDate, "yyyy-MM-dd"),
      selected_time: selectedTime,
      timezone,
      meeting_type: meetingType,
      notes: notes.trim() || null,
    });

    setSubmitting(false);
    if (error) {
      toast({ title: "Booking failed", description: "Please try again.", variant: "destructive" });
      return;
    }
    setPhase("done");
    toast({ title: "Consultation booked!", description: "You'll receive a confirmation email shortly." });
  };

  if (phase === "done") {
    return (
      <section className="py-32 px-4 gradient-hero network-bg min-h-[70vh] flex items-center">
        <div className="container mx-auto max-w-lg text-center animate-fade-in">
          <CheckCircle className="mx-auto text-primary mb-6" size={64} />
          <h2 className="font-display font-bold text-3xl mb-4">Consultation Booked!</h2>
          <p className="text-muted-foreground mb-2">
            {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")} at {selectedTime}
          </p>
          <p className="text-sm text-muted-foreground mb-8">via {meetingTypes.find((m) => m.value === meetingType)?.label} · {timezone}</p>
          <Button asChild><a href="/">Back to Home</a></Button>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-24 px-4 gradient-hero network-bg">
        <div className="container mx-auto text-center animate-fade-in">
          <SectionHeading label="Book" title="Book a Consultation" description="Schedule a free 30-minute discovery call with our team." />
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
                </h3>
                {errors.time && <p className="text-sm text-destructive mb-2">{errors.time}</p>}
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((t) => (
                    <button
                      key={t}
                      onClick={() => { setSelectedTime(t); setErrors((e) => ({ ...e, time: "" })); }}
                      className={`rounded-lg py-2 text-sm font-medium transition-all border ${
                        selectedTime === t
                          ? "bg-primary text-primary-foreground border-primary glow-primary"
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                  <GlobeIcon size={12} /> {timezone}
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <h3 className="font-display font-semibold mb-4">Meeting Platform</h3>
                <RadioGroup value={meetingType} onValueChange={setMeetingType} className="flex gap-4">
                  {meetingTypes.map((mt) => (
                    <label
                      key={mt.value}
                      className={`flex items-center gap-2 glass rounded-xl px-4 py-3 cursor-pointer transition-all ${meetingType === mt.value ? "border-primary" : ""}`}
                    >
                      <RadioGroupItem value={mt.value} />
                      <mt.icon size={16} className="text-primary" />
                      <span className="text-sm font-medium">{mt.label}</span>
                    </label>
                  ))}
                </RadioGroup>
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
                  <Input value={contact.phone} onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))} placeholder="+234 ..." />
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
                    <p><span className="text-foreground font-medium">Platform:</span> {meetingTypes.find((m) => m.value === meetingType)?.label}</p>
                    <p><span className="text-foreground font-medium">Duration:</span> 30 minutes</p>
                  </div>
                </div>
              )}

              <Button onClick={submit} size="lg" className="w-full glow-primary" disabled={submitting}>
                {submitting ? "Booking..." : "Confirm Booking"}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BookConsultation;
