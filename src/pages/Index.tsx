import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/SectionHeading";
import SEO from "@/components/SEO";
import {
  Globe, Smartphone, ShoppingCart, Building2, Palette, BrainCircuit,
  Shield, Layers, MapPin, Wheat, Ship, Heart, Store,
  ArrowRight, ChevronDown, CheckCircle2, Zap, TrendingUp,
  MessageSquare, Server, QrCode, Landmark, HeartPulse, Rocket, ShieldAlert,
} from "lucide-react";

const stats = [
  { value: "2025", label: "Founded" },
  { value: "4", label: "Senior Engineers" },
  { value: "2", label: "Apps Live on Google Play" },
  { value: "24h", label: "Quote Turnaround" },
];

const services = [
  { icon: BrainCircuit, title: "AI Agent Development",  bullets: ["Fully autonomous, multi-step agents", "Open-source models - no per-query fees", "On-premise or cloud deployment"],     path: "/services/ai-agents" },
  { icon: Globe,        title: "Web Development",       bullets: ["Custom CMS & portals", "API integrations", "SEO-first architecture"],                                               path: "/services/web-development" },
  { icon: Smartphone,   title: "Mobile Development",    bullets: ["Cross-platform (iOS & Android)", "Offline-first capabilities", "Push notifications"],                               path: "/services/mobile-development" },
  { icon: ShoppingCart, title: "E-Commerce Systems",    bullets: ["Stripe, PayPal & local payments", "Inventory & multi-vendor", "Analytics dashboards"],                               path: "/services/e-commerce-systems" },
  { icon: Building2,    title: "Enterprise Software",   bullets: ["ERP & CRM platforms", "Workflow automation", "Real-time data pipelines"],                                          path: "/services/enterprise-software" },
  { icon: Palette,      title: "UI/UX Design",          bullets: ["User research & testing", "Design systems", "Interactive prototypes"],                                             path: "/services/ui-ux-design" },
];

const products = [
  {
    icon: QrCode,
    title: "Teevexa Trace",
    type: "Live on Google Play",
    typeColor: "bg-primary/15 text-[#065e69] dark:text-primary",
    tagline: "Supply chain traceability for producers that need to prove origin, quality, and compliance to global buyers.",
    bullets: [
      "Farm-to-export QR verification",
      "Tamper-evident audit trail with blockchain anchoring",
      "EUDR & export compliance reports",
    ],
    path: "/teevexa-trace",
    cta: "Explore Teevexa Trace",
    external: false,
  },
  {
    icon: Smartphone,
    title: "Teevexa Field",
    type: "Live on Google Play",
    typeColor: "bg-accent/15 text-amber-900 dark:text-accent",
    tagline: "The offline-first mobile companion for supply chain field agents - works anywhere.",
    bullets: [
      "No internet needed to log events",
      "QR scanning, GPS tagging & photo evidence",
      "Included with Teevexa Trace",
    ],
    path: "/teevexa-field",
    cta: "Explore Teevexa Field",
    external: false,
  },
  {
    icon: MessageSquare,
    title: "TeeDesk",
    type: "Open source",
    typeColor: "bg-green-500/15 text-green-800 dark:text-green-400",
    tagline: "AI-powered customer support platform: chat widget, admin dashboard, knowledge base, ticket triage and WhatsApp.",
    bullets: [
      "Local LLMs via Ollama, RAG knowledge base",
      "Sentiment analysis & human handoff",
      "Free to use and contribute to on GitHub",
    ],
    path: "/teedesk",
    cta: "Explore TeeDesk",
    external: false,
  },
  {
    icon: ShieldAlert,
    title: "CyberGuard AI",
    type: "Open source",
    typeColor: "bg-green-500/15 text-green-800 dark:text-green-400",
    tagline: "AI-enhanced threat detection for teams too small for an enterprise SIEM.",
    bullets: [
      "Anomaly scoring with a real trained ML model",
      "Slack, email & webhook alerts",
      "Local AI assistant - no third-party API spend",
    ],
    path: "/cyberguard-ai",
    cta: "Explore CyberGuard AI",
    external: false,
  },
];

const industries = [
  { icon: Wheat,      title: "Agriculture & Agri-Tech" },
  { icon: Ship,       title: "Export & Trade" },
  { icon: MapPin,     title: "Logistics & Supply Chain" },
  { icon: Heart,      title: "NGOs & Non-Profit" },
  { icon: Store,      title: "Retail & E-Commerce" },
  { icon: Building2,  title: "Manufacturing" },
  { icon: TrendingUp, title: "Finance & Fintech" },
  { icon: Globe,      title: "Education & EdTech" },
  { icon: Landmark,   title: "Government & Public Sector" },
  { icon: HeartPulse, title: "Healthcare" },
];

const whyUs = [
  { icon: BrainCircuit, title: "AI-Native",            desc: "We build with AI at the core - not bolted on. From AI agents to AI-powered products, intelligence is built into everything we ship." },
  { icon: MapPin,       title: "Market-Fluent",        desc: "We engineer for real-world infrastructure - intermittent connectivity, local payment rails, multi-currency, and regional compliance. What we learned building for demanding markets, we apply everywhere." },
  { icon: Layers,       title: "Scalable Architecture", desc: "Cloud-native designs that scale from 100 to 1,000,000 users without rearchitecting." },
  { icon: Shield,       title: "Secure by Default",     desc: "Enterprise-grade security: end-to-end encryption, role-based access, and penetration-tested before every release." },
  { icon: Server,       title: "Self-Hosted Options",   desc: "Where data sovereignty matters, we offer self-hosted deployments. Your data stays on your servers - full stop." },
  { icon: Zap,          title: "Fast Delivery",         desc: "Agile sprints with bi-weekly demos mean you see working software from week one, not month three." },
];

const Index = () => (
  <>
    <SEO route="/" />

    {/* ── Hero ── */}
    <section className="relative min-h-screen flex flex-col items-center justify-center gradient-hero network-bg overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/8 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/3 right-1/4 w-[28rem] h-[28rem] rounded-full bg-accent/8 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full bg-primary/4 blur-3xl" />
      </div>

      <div className="container mx-auto text-center relative z-10 animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Tech Evolution for Exceptional Applications</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold leading-[1.05] tracking-tight">
          Building Digital<br />
          Infrastructure for{" "}
          <span className="gradient-text">Ambitious Businesses</span>
        </h1>

        <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          An AI-native product engineering team. We build custom software and AI agents, take AI-built prototypes to production, and ship our own apps - with the payments, security and offline resilience real businesses need.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="glow-primary text-base font-semibold h-14 px-10 rounded-xl" asChild>
            <Link to="/start-project">Get a Quote <ArrowRight className="ml-2" size={18} /></Link>
          </Button>
          <Button variant="outline" size="lg" className="text-base font-semibold h-14 px-10 rounded-xl border-2 border-border/60 hover:border-primary/60 hover:bg-primary/5" asChild>
            <Link to="/book-consultation">Book a Free Consultation</Link>
          </Button>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-primary" /> No account needed</span>
          <span className="w-px h-3 bg-border hidden sm:block" />
          <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-primary" /> Quote within 24 hours</span>
          <span className="w-px h-3 bg-border hidden sm:block" />
          <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-primary" /> Tailored quote</span>
        </div>
      </div>

      <button
        onClick={() => window.scrollBy({ top: window.innerHeight, behavior: "smooth" })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-primary transition-colors animate-float"
        aria-label="Scroll down"
      >
        <ChevronDown size={28} />
      </button>
    </section>

    {/* ── Stats bar ── */}
    <section className="section-teal py-16">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-3xl mx-auto text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-4xl lg:text-5xl font-display font-bold gradient-text">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Prototype to Production ── */}
    <section className="py-24">
      <div className="container mx-auto">
        <div className="glass rounded-3xl p-8 md:p-12 border-2 border-primary/30 grid md:grid-cols-5 gap-8 items-center">
          <div className="md:col-span-3">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary mb-3"><Rocket size={14} /> Prototype to production</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold leading-tight mb-4">Built it with AI? Let&apos;s take it to production.</h2>
            <p className="text-muted-foreground leading-relaxed mb-5">
              AI builders get you a working demo fast. We add what real users need: security hardening, live payments (Stripe, PayPal, Pesapal, M-Pesa and more), deployment, monitoring and 30 days of support.
            </p>
            <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
              {["Code & security audit", "Payments & integrations (Stripe, PayPal, Pesapal, M-Pesa…) wired to live accounts", "Production deployment, backups & monitoring"].map((b) => (
                <li key={b} className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary shrink-0" />{b}</li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="glow-primary" asChild><Link to="/start-project?type=prototype">Price my prototype <ArrowRight className="ml-2" size={16} /></Link></Button>
              <Button variant="outline" asChild><Link to="/prototype-to-production">How it works</Link></Button>
            </div>
          </div>
          <div className="md:col-span-2 text-center md:text-right">
            <p className="font-display font-bold text-4xl gradient-text">Tailored quote</p>
            <p className="text-sm text-muted-foreground mt-2">Tailored to your prototype and delivered by email within 24 hours.</p>
          </div>
        </div>
      </div>
    </section>

    {/* ── Services ── */}
    <section className="py-24">
      <div className="container mx-auto">
        <SectionHeading
          label="What We Build"
          title="End-to-End Digital Solutions"
          description="From product conception to global deployment - we engineer technology that solves real business problems."
        />
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <Link
              key={s.title}
              to={s.path}
              className="glass rounded-2xl p-7 group hover:border-primary/50 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <s.icon className="text-primary group-hover:scale-110 transition-transform" size={24} />
              </div>
              <h3 className="font-display font-bold text-lg mb-3">{s.title}</h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground mb-5">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <span className="inline-flex items-center text-sm font-semibold text-primary group-hover:gap-2 gap-1 transition-all">
                Explore Service<span className="sr-only">: {s.title}</span> <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button variant="outline" className="font-semibold border-2 border-border/60 hover:border-primary/60 hover:bg-primary/5 px-8 h-11" asChild>
            <Link to="/services">View All Services <ArrowRight className="ml-2" size={16} /></Link>
          </Button>
        </div>
      </div>
    </section>

    {/* ── Our Products ── */}
    <section className="section-card py-24">
      <div className="container mx-auto">
        <SectionHeading
          label="Our Products"
          title="Products and Open-Source Projects"
          description="Beyond client work, we build our own products and open-source tools - solving real problems and giving back to developers."
        />
        <div className="mt-14 grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {products.map((p) => {
            const inner = (
              <>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <p.icon className="text-primary group-hover:scale-110 transition-transform" size={24} />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${p.typeColor}`}>{p.type}</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl mb-1.5">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.tagline}</p>
                </div>
                <ul className="space-y-2 flex-1">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                <span className="inline-flex items-center text-sm font-semibold text-primary gap-1 group-hover:gap-2 transition-all pt-1 border-t border-border/30">
                  {p.cta} <ArrowRight size={14} />
                </span>
              </>
            );
            const cls = "glass rounded-2xl p-8 group hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-5";
            return p.external ? (
              <a key={p.title} href={p.path} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
            ) : (
              <Link key={p.title} to={p.path} className={cls}>{inner}</Link>
            );
          })}
        </div>
      </div>
    </section>

    {/* ── Why Teevexa ── */}
    <section className="py-24">
      <div className="container mx-auto">
        <SectionHeading
          label="Why Teevexa"
          title="Built Different, Built to Last"
          description="We don't copy-paste template solutions. We engineer from first principles for real infrastructure constraints - whether your users are in Nairobi, Toronto, or Amsterdam."
        />
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyUs.map((w) => (
            <div key={w.title} className="rounded-2xl border border-border p-6 group hover:border-primary/40 hover:shadow-md transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <w.icon className="text-primary" size={22} />
              </div>
              <h3 className="font-display font-bold mb-2">{w.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Industries ── */}
    <section className="section-teal py-24">
      <div className="container mx-auto">
        <SectionHeading
          label="Industries"
          title="Sectors We Transform"
          description="Whatever the sector, we bring the same engineering rigour, market insight, and product mindset."
        />
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-5 gap-4">
          {industries.map((ind) => (
            <div
              key={ind.title}
              className="glass rounded-2xl p-5 text-center group hover:border-primary/40 hover:-translate-y-1 hover:shadow-sm transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2.5 group-hover:bg-primary/20 transition-colors">
                <ind.icon className="text-primary" size={22} />
              </div>
              <p className="font-display font-semibold text-xs leading-snug">{ind.title}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don't see yours? <Link to="/contact" className="text-primary hover:underline font-medium">We likely serve it</Link> - get in touch.
        </p>
      </div>
    </section>

    {/* ── Final CTA ── */}
    <section className="section-card py-24">
      <div className="container mx-auto text-center">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary block mb-4">Ready to Build?</span>
        <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
          Turn Your Vision Into{" "}
          <span className="gradient-text">Reality</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Describe your idea and get a tailored quote by email within 24 hours.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="glow-primary font-semibold px-10 h-14 text-base rounded-xl" asChild>
            <Link to="/start-project">Get a Quote <ArrowRight className="ml-2" size={18} /></Link>
          </Button>
          <Button variant="outline" size="lg" className="font-semibold px-10 h-14 text-base rounded-xl border-2 border-border/60 hover:border-primary/60 hover:bg-primary/5" asChild>
            <Link to="/contact">Talk to Us First</Link>
          </Button>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-primary" /> No account needed</span>
          <span className="w-px h-3 bg-border hidden sm:block" />
          <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-primary" /> Quote within 24 hours</span>
          <span className="w-px h-3 bg-border hidden sm:block" />
          <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-primary" /> Tailored quote</span>
        </div>
      </div>
    </section>
  </>
);

export default Index;
