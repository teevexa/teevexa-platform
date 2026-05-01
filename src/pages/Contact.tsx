import { useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Mail, MapPin, Phone, Linkedin, Twitter, Instagram, Facebook,
  CheckCircle, Clock, ArrowRight, MessageSquare,
  CalendarDays, Zap, HelpCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

const faqGroups = [
  {
    group: "Working with us",
    items: [
      {
        q: "How quickly do you respond to enquiries?",
        a: "We respond to all messages within 24 hours on business days (Mon–Fri, 8 AM–6 PM EAT). For time-sensitive matters, call us directly at +254 783 797 132.",
      },
      {
        q: "Do you work with startups or only enterprises?",
        a: "Both. We've built MVPs for early-stage startups and scaled platforms for large enterprises. Our approach adapts to your stage — lean and fast for startups, structured and compliant for enterprises.",
      },
      {
        q: "What does a typical engagement look like?",
        a: "Most projects follow a Discovery → Design → Build → Launch cycle. We kick off with a scoping call, align on requirements and milestones, then move into iterative sprints. You'll have a dedicated project manager and access to your own client portal throughout.",
      },
    ],
  },
  {
    group: "Scope & Pricing",
    items: [
      {
        q: "How do I get a project quote?",
        a: "Fill in our Start a Project brief — it takes about 5 minutes and covers your goals, timeline, and budget range. We use this to prepare a detailed proposal within 48 hours, no strings attached.",
      },
      {
        q: "What is your minimum project size?",
        a: "We don't publish a hard minimum, but most of our engagements start from KES 150,000 (≈ $1,000) for a focused scope. Smaller retainers or advisory arrangements are also available — just ask.",
      },
      {
        q: "Do you offer ongoing maintenance after launch?",
        a: "Yes. We offer flexible retainer packages covering bug fixes, feature iterations, security patches, hosting management, and performance monitoring — so your product keeps improving after go-live.",
      },
    ],
  },
  {
    group: "Geography & Logistics",
    items: [
      {
        q: "What countries do you serve?",
        a: "We're headquartered in Nairobi, Kenya, and work remotely across Africa and with international clients in Europe and North America. No geography is off-limits — we operate entirely remote-first.",
      },
      {
        q: "Can I visit your office or meet in person?",
        a: "Absolutely. Our team is based in Nairobi and we welcome in-person meetings for local clients. For international clients, we use video calls and async tools — most clients never need to travel.",
      },
    ],
  },
];

const Contact = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  // Record when the form first rendered — submissions in under 3 s are almost certainly bots
  const [formRenderedAt] = useState(() => Date.now());

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // ── Honeypot check ────────────────────────────────────────────────────────
    // Hidden field that legitimate users never fill; bots almost always do.
    const honeypot = (formData.get("website") as string)?.trim();
    // Time-based check: real users take more than 3 seconds to fill a form.
    const elapsed = Date.now() - formRenderedAt;
    if (honeypot || elapsed < 3000) {
      // Silently fake success so the bot doesn't know it was caught.
      setSubmitted(true);
      return;
    }
    // ─────────────────────────────────────────────────────────────────────────

    const full_name = (formData.get("name") as string).trim();
    const email     = (formData.get("email") as string).trim();
    const subject   = (formData.get("subject") as string).trim();
    const message   = (formData.get("message") as string).trim();

    setLoading(true);

    const { error } = await supabase.from("contact_submissions").insert({
      full_name, email, subject, message,
    });

    setLoading(false);

    if (error) {
      toast({ title: "Failed to send", description: "Please try again.", variant: "destructive" });
      return;
    }

    setSubmitted(true);
    toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });

    // Notify admin — pass full payload so the edge function can forward by email
    supabase.functions.invoke("notify-admin", {
      body: { type: "new_contact", data: { full_name, email, subject, message } },
    });
  };

  return (
    <>
      <SEO
        title="Contact Teevexa | Talk to Our Team"
        description="Get in touch with Teevexa. Send a message, book a free 30-minute consultation, or start a project — we respond within 24 hours."
        canonical="/contact"
      />

      {/* ── Hero ── */}
      <section className="relative py-32 px-4 gradient-hero network-bg overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-primary/8 blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 left-1/3 w-60 h-60 rounded-full bg-accent/7 blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
        </div>
        <div className="container mx-auto text-center relative z-10 animate-fade-in max-w-4xl">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary block mb-4">Get in Touch</span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
            Let's Start a <span className="gradient-text">Conversation</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Have a question, a project idea, or just want to explore what's possible? We'd love to hear from you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="glow-primary px-8" asChild>
              <Link to="/book-consultation">Book a Free Call <CalendarDays className="ml-2" size={18} /></Link>
            </Button>
            <Button variant="outline" size="lg" className="px-8" asChild>
              <Link to="/start-project">Start a Project <ArrowRight className="ml-2" size={18} /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Quick Actions ── */}
      <section className="section-teal py-14 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: MessageSquare, title: "Send a Message", desc: "General enquiries & questions", link: "#contact-form", cta: "Fill the form below" },
              { icon: CalendarDays,  title: "Book a Call",    desc: "30-min free consultation",     link: "/book-consultation", cta: "Pick a time slot" },
              { icon: Zap,           title: "Start a Project",desc: "Tell us about your build",      link: "/start-project",     cta: "Submit your brief" },
            ].map((action) => (
              <a
                key={action.title}
                href={action.link}
                className="glass rounded-2xl p-6 hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group block"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <action.icon className="text-primary" size={22} />
                </div>
                <h3 className="font-display font-bold mb-1">{action.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{action.desc}</p>
                <span className="text-xs font-semibold text-primary group-hover:underline">{action.cta} →</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Form + Info ── */}
      <section id="contact-form" className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-5 gap-12">

            {/* Form */}
            <div className="lg:col-span-3">
              <div className="mb-8">
                <h2 className="text-2xl font-display font-bold mb-2">Send Us a Message</h2>
                <p className="text-muted-foreground text-sm">We read every message and respond within 24 hours.</p>
              </div>
              {submitted ? (
                <div className="glass rounded-2xl p-12 text-center animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="text-primary" size={32} />
                  </div>
                  <h3 className="font-display font-bold text-xl mb-2">Message Received!</h3>
                  <p className="text-muted-foreground text-sm">We'll get back to you within 24 hours on business days.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-5">
                  {/* ── Honeypot — hidden from real users, bait for bots ── */}
                  <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
                    <label htmlFor="website">Website</label>
                    <input
                      id="website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" required placeholder="Jane Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" name="email" type="email" required placeholder="jane@company.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" name="subject" required placeholder="How can we help?" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      placeholder="Tell us about your project, question, or idea..."
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full glow-primary" disabled={loading}>
                    {loading ? "Sending..." : "Send Message"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    By submitting you agree to our{" "}
                    <Link to="/legal/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
                  </p>
                </form>
              )}
            </div>

            {/* Info sidebar */}
            <div className="lg:col-span-2 space-y-5">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-display font-semibold mb-5">Contact Information</h3>
                <div className="space-y-4">
                  <a href="mailto:info@teevexa.com" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Mail size={16} className="text-primary" />
                    </div>
                    info@teevexa.com
                  </a>
                  <a href="tel:+254783797132" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Phone size={16} className="text-primary" />
                    </div>
                    +254 783 797 132
                  </a>
                  <div className="flex items-start gap-3 text-sm text-muted-foreground">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">TEEVEXA LTD</p>
                      <p>Nairobi, Kenya</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock size={16} className="text-primary" />
                    </div>
                    Mon – Fri, 8:00 AM – 6:00 PM EAT
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <h3 className="font-display font-semibold mb-4">Follow Us</h3>
                <div className="flex gap-3">
                  {[
                    { href: "https://www.linkedin.com/company/teevexa", icon: Linkedin,  label: "LinkedIn" },
                    { href: "https://www.instagram.com/teevexa",        icon: Instagram, label: "Instagram" },
                    { href: "https://x.com/teevexa",                    icon: Twitter,   label: "X" },
                    { href: "https://www.facebook.com/teevexa",          icon: Facebook,  label: "Facebook" },
                  ].map(({ href, icon: Icon, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="w-10 h-10 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                    >
                      <Icon size={18} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section-card py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-5 gap-12 items-start">

            {/* Left: heading + CTA */}
            <div className="lg:col-span-2 lg:sticky lg:top-24">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary block mb-3">FAQ</span>
              <h2 className="text-3xl font-display font-bold leading-tight mb-4">
                Questions people ask before reaching out
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                If you don't see what you're looking for, just send us a message — we're happy to help.
              </p>
              <div className="glass rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="text-primary" size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Still have questions?</p>
                    <p className="text-xs text-muted-foreground">We reply within 24 hours.</p>
                  </div>
                </div>
                <Button size="sm" className="w-full glow-primary" asChild>
                  <a href="#contact-form">Send Us a Message</a>
                </Button>
                <Button size="sm" variant="outline" className="w-full" asChild>
                  <Link to="/book-consultation">Book a Free Call</Link>
                </Button>
              </div>
            </div>

            {/* Right: grouped accordion */}
            <div className="lg:col-span-3 space-y-8">
              {faqGroups.map((group) => (
                <div key={group.group}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary mb-3">
                    {group.group}
                  </p>
                  <Accordion type="single" collapsible className="glass rounded-2xl overflow-hidden divide-y divide-border">
                    {group.items.map((faq, i) => (
                      <AccordionItem key={i} value={`${group.group}-${i}`} className="border-0 px-6">
                        <AccordionTrigger className="text-sm font-semibold text-left hover:no-underline hover:text-primary py-5 gap-4">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
