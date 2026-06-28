import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/SectionHeading";
import SEO from "@/components/SEO";
import {
  Globe, Smartphone, ShoppingCart, Building2, Palette, BrainCircuit,
  Shield, Layers, MapPin, Lock, Leaf, Wheat, Ship, Heart, Store,
  ArrowRight, ChevronDown, CheckCircle2, Zap, TrendingUp,
  MessageSquare, Kanban, Server, QrCode, Users,
} from "lucide-react";

const stats = [
  { value: "50+", label: "Projects Delivered" },
  { value: "8+",  label: "Countries Served" },
  { value: "8+",  label: "Industries Served" },
  { value: "4",   label: "Products Shipped" },
];

const services = [
  { icon: BrainCircuit, title: "AI Agent Development",  bullets: ["Fully autonomous, multi-step agents", "Open-source models — no per-query fees", "On-premise or cloud deployment"],     path: "/services/ai-agents" },
  { icon: Globe,        title: "Web Development",       bullets: ["Custom CMS & portals", "API integrations", "SEO-first architecture"],                                               path: "/services/web-development" },
  { icon: Smartphone,   title: "Mobile Development",    bullets: ["Cross-platform (iOS & Android)", "Offline-first capabilities", "Push notifications"],                               path: "/services/mobile-development" },
  { icon: ShoppingCart, title: "E-Commerce Systems",    bullets: ["M-Pesa, Paystack, Flutterwave", "Inventory & multi-vendor", "Analytics dashboards"],                               path: "/services/e-commerce-systems" },
  { icon: Building2,    title: "Enterprise Software",   bullets: ["ERP & CRM platforms", "Workflow automation", "Real-time data pipelines"],                                          path: "/services/enterprise-software" },
  { icon: Palette,      title: "UI/UX Design",          bullets: ["User research & testing", "Design systems", "Interactive prototypes"],                                             path: "/services/ui-ux-design" },
];

const products = [
  {
    icon: QrCode,
    title: "Teevexa Trace",
    type: "SaaS",
    typeColor: "bg-primary/15 text-primary",
    tagline: "Blockchain-powered supply chain traceability for African producers accessing global markets.",
    bullets: [
      "Farm-to-export QR verification",
      "Tamper-proof blockchain audit trail",
      "EUDR & export compliance reports",
    ],
    path: "/teevexa-trace",
  },
  {
    icon: Smartphone,
    title: "Teevexa Field",
    type: "Mobile App",
    typeColor: "bg-accent/15 text-accent",
    tagline: "The offline-first mobile companion for supply chain field agents — works anywhere.",
    bullets: [
      "No internet needed to log events",
      "QR scanning, GPS tagging & photo evidence",
      "Included in every Teevexa Trace plan",
    ],
    path: "/teevexa-field",
  },
  {
    icon: MessageSquare,
    title: "Teevexa Desk",
    type: "Cloud · Self-hosted",
    typeColor: "bg-green-500/15 text-green-400",
    tagline: "AI-powered customer support platform with zero per-conversation fees on self-hosted.",
    bullets: [
      "AI handles queries 24/7, escalates to humans",
      "WhatsApp & web chat out of the box",
      "Self-hosted: your data never leaves your servers",
    ],
    path: "/teevexa-desk",
  },
  {
    icon: Kanban,
    title: "Teevexa Base",
    type: "Self-hosted",
    typeColor: "bg-orange-500/15 text-orange-400",
    tagline: "Project management software you buy once, own forever — no monthly fees.",
    bullets: [
      "One-time license, unlimited projects & teams",
      "Deploy on your own servers in 24 hours",
      "Client portal, time tracking & reporting",
    ],
    path: "/teevexa-base",
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
];

const whyUs = [
  { icon: BrainCircuit, title: "AI-Native",            desc: "We build with AI at the core — not bolted on. From AI agents to AI-powered products, intelligence is built into everything we ship." },
  { icon: MapPin,       title: "African-First",         desc: "Built for African infrastructure realities — intermittent connectivity, local payment methods, and regional compliance requirements." },
  { icon: Layers,       title: "Scalable Architecture", desc: "Cloud-native designs that scale from 100 to 1,000,000 users without rearchitecting." },
  { icon: Shield,       title: "Secure by Default",     desc: "Enterprise-grade security: end-to-end encryption, role-based access, and penetration-tested before every release." },
  { icon: Server,       title: "Self-Hosted Options",   desc: "Where data sovereignty matters, we offer self-hosted deployments. Your data stays on your servers — full stop." },
  { icon: Zap,          title: "Fast Delivery",         desc: "Agile sprints with bi-weekly demos mean you see working software from week one, not month three." },
];

const Index = () => (
  <>
    <SEO
      title="Teevexa - Tech Evolution for Exceptional Applications"
      description="Teevexa designs and builds world-class software, AI agents, and enterprise products for businesses across Africa and beyond."
      canonical="/"
      structuredData={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Teevexa",
        url: "https://teevexa.com",
        logo: "https://teevexa.com/og-image.png",
        sameAs: [
          "https://www.linkedin.com/company/teevexa",
          "https://x.com/teevexa",
          "https://www.instagram.com/teevexa",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+254783797132",
          contactType: "customer support",
          areaServed: "Africa",
          availableLanguage: "English",
        },
      }}
    />

    {/* ── Hero ── */}
    <section className="relative min-h-screen flex flex-col items-center justify-center gradient-hero network-bg overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/8 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/3 right-1/4 w-[28rem] h-[28rem] rounded-full bg-accent/8 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full bg-primary/4 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10 animate-fade-in max-w-5xl">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Tech Evolution for Exceptional Applications</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold leading-[1.05] tracking-tight">
          Building Digital<br />
          Infrastructure for{" "}
          <span className="gradient-text">Africa's Future</span>
        </h1>

        <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Custom software and AI products that work the way African businesses actually operate — offline-first, local payments, data on your servers.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="glow-primary text-base font-semibold h-14 px-10 rounded-xl" asChild>
            <Link to="/start-project">Start a Project <ArrowRight className="ml-2" size={18} /></Link>
          </Button>
          <Button variant="outline" size="lg" className="text-base font-semibold h-14 px-10 rounded-xl border-2 border-border/60 hover:border-primary/60 hover:bg-primary/5" asChild>
            <Link to="/book-consultation">Book a Free Consultation</Link>
          </Button>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-primary" /> No upfront commitment</span>
          <span className="w-px h-3 bg-border hidden sm:block" />
          <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-primary" /> Proposal within 48 hours</span>
          <span className="w-px h-3 bg-border hidden sm:block" />
          <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-primary" /> African-first expertise</span>
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
    <section className="section-teal py-16 px-4">
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

    {/* ── Services ── */}
    <section className="py-24 px-4">
      <div className="container mx-auto">
        <SectionHeading
          label="What We Build"
          title="End-to-End Digital Solutions"
          description="From product conception to global deployment — we engineer technology that solves real business problems."
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
                Explore Service <ArrowRight size={14} />
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
    <section className="section-card py-24 px-4">
      <div className="container mx-auto">
        <SectionHeading
          label="Our Products"
          title="Software We've Built and Ship"
          description="Beyond client work, Teevexa builds and sells its own products — solving real African business problems at scale."
        />
        <div className="mt-14 grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {products.map((p) => (
            <Link
              key={p.title}
              to={p.path}
              className="glass rounded-2xl p-8 group hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-5"
            >
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
                Explore {p.title} <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>

    {/* ── Why Teevexa ── */}
    <section className="py-24 px-4">
      <div className="container mx-auto">
        <SectionHeading
          label="Why Teevexa"
          title="Built Different, Built for Africa"
          description="We don't copy-paste Western solutions into African contexts. We engineer from the ground up for the continent's realities."
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
    <section className="section-teal py-24 px-4">
      <div className="container mx-auto">
        <SectionHeading
          label="Industries"
          title="Sectors We Transform"
          description="Whatever the sector, we bring the same engineering rigour, African market expertise, and product mindset."
        />
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
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
          Don't see yours? <Link to="/contact" className="text-primary hover:underline font-medium">We likely serve it</Link> — get in touch.
        </p>
      </div>
    </section>

    {/* ── Final CTA ── */}
    <section className="section-card py-24 px-4">
      <div className="container mx-auto text-center max-w-3xl">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary block mb-4">Ready to Build?</span>
        <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
          Turn Your Vision Into{" "}
          <span className="gradient-text">Reality</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Join 50+ companies that chose Teevexa to build the digital infrastructure powering their growth.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="glow-primary font-semibold px-10 h-14 text-base rounded-xl" asChild>
            <Link to="/start-project">Start a Project <ArrowRight className="ml-2" size={18} /></Link>
          </Button>
          <Button variant="outline" size="lg" className="font-semibold px-10 h-14 text-base rounded-xl border-2 border-border/60 hover:border-primary/60 hover:bg-primary/5" asChild>
            <Link to="/contact">Talk to Us First</Link>
          </Button>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-primary" /> No contracts required</span>
          <span className="w-px h-3 bg-border hidden sm:block" />
          <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-primary" /> Proposal within 48 hours</span>
          <span className="w-px h-3 bg-border hidden sm:block" />
          <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-primary" /> Cancel anytime</span>
        </div>
      </div>
    </section>
  </>
);

export default Index;
