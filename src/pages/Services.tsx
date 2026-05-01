import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/SectionHeading";
import {
  Globe, Smartphone, ShoppingCart, Building2, Palette, Sparkles,
  ArrowRight, CheckCircle2, Search, Lightbulb, PenTool, Code2,
  Rocket, HeadphonesIcon, BarChart2, Shield, Cpu, Cloud,
  Wheat, Ship, MapPin, Heart, Store, TrendingUp, GraduationCap, Factory,
} from "lucide-react";

const services = [
  {
    icon: Globe,
    title: "Web Development",
    desc: "Custom, high-performance web applications built for scale — from marketing sites to complex SaaS platforms.",
    highlights: ["Responsive & progressive web apps", "Custom CMS & headless", "API-first architecture", "SEO & Core Web Vitals"],
    path: "/services/web-development",
  },
  {
    icon: Smartphone,
    title: "Mobile Development",
    desc: "Cross-platform mobile apps that deliver native performance with offline-first capabilities for low-connectivity environments.",
    highlights: ["iOS & Android native performance", "Cross-platform single codebase", "Offline-first & real-time sync", "Push notifications & analytics"],
    path: "/services/mobile-development",
  },
  {
    icon: ShoppingCart,
    title: "E-Commerce Systems",
    desc: "Full-featured commerce platforms with local payment integration, inventory management, and multi-vendor support.",
    highlights: ["M-Pesa, Flutterwave, Paystack", "Multi-vendor & B2B", "Inventory & logistics", "Real-time analytics"],
    path: "/services/e-commerce-systems",
  },
  {
    icon: Building2,
    title: "Enterprise Software",
    desc: "Custom ERP, CRM, and workflow automation solutions engineered for the complexity of large African enterprises.",
    highlights: ["ERP & CRM development", "Workflow & process automation", "Data pipelines & BI", "Multi-tenancy & RBAC"],
    path: "/services/enterprise-software",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    desc: "Research-driven, user-centered design that works across devices, languages, and digital literacy levels.",
    highlights: ["User research & testing", "Design systems & brand guidelines", "Interactive prototyping", "Accessibility (WCAG 2.1)"],
    path: "/services/ui-ux-design",
  },
  {
    icon: Sparkles,
    title: "Digital Transformation",
    desc: "End-to-end digitization of business processes — from auditing legacy systems to full cloud migration.",
    highlights: ["Process audit & mapping", "Multi-cloud migration", "Legacy system modernization", "Change management & training"],
    path: "/services",
  },
];

const process = [
  { icon: Search,          step: "01", title: "Discovery",     desc: "Deep-dive into your business, users, and technical constraints. We ask hard questions before writing a line of code." },
  { icon: Lightbulb,       step: "02", title: "Strategy",      desc: "Define the architecture, technology stack, and roadmap. You approve the plan before any work begins." },
  { icon: PenTool,         step: "03", title: "Design",        desc: "UI/UX prototypes in Figma — tested with real users. You see and approve every screen before development." },
  { icon: Code2,           step: "04", title: "Development",   desc: "Agile sprints with bi-weekly demos. Full visibility into progress via your client portal." },
  { icon: Shield,          step: "05", title: "QA & Security", desc: "Automated test suites, manual testing, and a security review before anything reaches production." },
  { icon: Rocket,          step: "06", title: "Launch",        desc: "Staged deployment with monitoring, rollback capability, and a dedicated launch-day support window." },
  { icon: HeadphonesIcon,  step: "07", title: "Support",       desc: "Post-launch SLAs, ongoing retainers, and a dedicated channel in your client portal for requests." },
];


const Services = () => (
  <>
    {/* ── Hero ── */}
    <section className="relative py-32 px-4 gradient-hero network-bg overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-primary/8 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 left-1/3 w-60 h-60 rounded-full bg-accent/7 blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
      </div>
      <div className="container mx-auto text-center relative z-10 animate-fade-in max-w-4xl">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary block mb-4">Our Services</span>
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
          What We <span className="gradient-text">Build</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
          End-to-end digital solutions tailored to African business realities. From MVP to enterprise scale.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" className="glow-primary px-8" asChild>
            <Link to="/start-project">Start a Project <ArrowRight className="ml-2" size={18} /></Link>
          </Button>
          <Button variant="outline" size="lg" className="px-8" asChild>
            <Link to="/book-consultation">Book a Consultation</Link>
          </Button>
        </div>
      </div>
    </section>

    {/* ── Services Grid ── */}
    <section className="py-24 px-4">
      <div className="container mx-auto">
        <SectionHeading label="Services" title="Six Ways We Help You Win" description="Each service is delivered by specialists — not generalists — with deep experience in that domain." />
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <Link
              key={s.title}
              to={s.path}
              className="glass rounded-2xl p-7 group hover:border-primary/50 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <s.icon className="text-primary group-hover:scale-110 transition-transform" size={24} />
              </div>
              <h3 className="font-display font-bold text-lg mb-3">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">{s.desc}</p>
              <ul className="space-y-1.5 mb-6">
                {s.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 size={13} className="text-primary flex-shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
              <span className="inline-flex items-center text-sm font-semibold text-primary group-hover:gap-2 gap-1 transition-all mt-auto">
                See Full Details <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>

    {/* ── Process ── */}
    <section className="section-card py-24 px-4">
      <div className="container mx-auto max-w-5xl">
        <SectionHeading label="How We Work" title="Our 7-Step Delivery Process" description="A structured, transparent process that eliminates surprises and maximises quality." />
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {process.slice(0, 6).map((p) => (
            <div key={p.step} className="rounded-2xl border border-border p-6 group hover:border-primary/40 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[11px] font-bold text-primary/60">{p.step}</span>
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <p.icon className="text-primary" size={18} />
                </div>
              </div>
              <h3 className="font-display font-bold mb-2">{p.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
          {/* Step 7 — Support — spans full width on its row */}
          <div className="rounded-2xl border border-border p-6 group hover:border-primary/40 hover:shadow-md transition-all duration-300 sm:col-span-2 lg:col-span-3 xl:col-span-1 xl:col-start-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[11px] font-bold text-primary/60">07</span>
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <HeadphonesIcon className="text-primary" size={18} />
              </div>
            </div>
            <h3 className="font-display font-bold mb-2">Support</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{process[6].desc}</p>
          </div>
        </div>
      </div>
    </section>

    {/* ── Industries We Serve ── */}
    <section className="section-teal py-20 px-4">
      <div className="container mx-auto">
        <SectionHeading
          label="Industries"
          title="We Build Across Sectors"
          description="Our engineering approach adapts to your domain — from agriculture to fintech, we've shipped production software in each."
        />
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { icon: Wheat,        label: "Agriculture" },
            { icon: Ship,         label: "Export & Trade" },
            { icon: MapPin,       label: "Logistics" },
            { icon: Heart,        label: "NGOs" },
            { icon: Store,        label: "Retail & E-Commerce" },
            { icon: Factory,      label: "Manufacturing" },
            { icon: TrendingUp,   label: "Finance & Fintech" },
            { icon: GraduationCap,label: "Education" },
          ].map((ind) => (
            <div key={ind.label} className="glass rounded-2xl p-5 text-center group hover:border-primary/40 hover:-translate-y-1 hover:shadow-sm transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2.5 group-hover:bg-primary/20 transition-colors">
                <ind.icon className="text-primary" size={20} />
              </div>
              <p className="font-semibold text-xs leading-snug">{ind.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't see yours? <a href="/contact" className="text-primary hover:underline font-medium">Get in touch</a> — we work across all sectors.
        </p>
      </div>
    </section>

    {/* ── Engagement Models ── */}
    <section className="py-24 px-4">
      <div className="container mx-auto">
        <SectionHeading label="Engagement" title="How We Can Work Together" description="Choose the engagement model that fits your stage and how you like to work." />
        <div className="mt-14 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              icon: Cpu,
              title: "Project-Based",
              desc: "Fixed scope, fixed price. Ideal for MVPs, feature builds, and well-defined projects. You get a proposal and timeline before any commitment.",
              cta: "Get a Quote",
              link: "/start-project",
              accent: false,
            },
            {
              icon: Cloud,
              title: "Dedicated Team",
              desc: "A full-time embedded team — engineers, designer, PM. Ideal for product companies that want senior talent without hiring overhead.",
              cta: "Book a Call",
              link: "/book-consultation",
              accent: true,
            },
            {
              icon: BarChart2,
              title: "Retainer / Support",
              desc: "Monthly retainer for ongoing feature development, maintenance, and technical advisory. Priority SLA response guaranteed.",
              cta: "Learn More",
              link: "/contact",
              accent: false,
            },
          ].map((model) => (
            <div key={model.title} className={`rounded-2xl p-7 flex flex-col ${model.accent ? "bg-primary text-primary-foreground shadow-lg glow-primary" : "glass hover:border-primary/40 hover:shadow-md transition-all"}`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${model.accent ? "bg-white/20" : "bg-primary/10"}`}>
                <model.icon size={22} className={model.accent ? "text-primary-foreground" : "text-primary"} />
              </div>
              <h3 className="font-display font-bold text-lg mb-3">{model.title}</h3>
              <p className={`text-sm leading-relaxed mb-8 flex-1 ${model.accent ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{model.desc}</p>
              <Button variant={model.accent ? "secondary" : "outline"} asChild className="mt-auto">
                <Link to={model.link}>{model.cta} <ArrowRight className="ml-2" size={14} /></Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── CTA ── */}
    <section className="section-navy py-24 px-4">
      <div className="container mx-auto text-center max-w-2xl">
        <h2 className="text-4xl font-display font-bold mb-4">
          Not Sure Where to <span className="gradient-text">Start?</span>
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-10">
          Book a free 30-minute consultation. We'll assess your needs and recommend the right approach — no sales pitch.
        </p>
        <Button size="lg" className="glow-primary px-10" asChild>
          <Link to="/book-consultation">Book Free Consultation <ArrowRight className="ml-2" size={18} /></Link>
        </Button>
      </div>
    </section>
  </>
);

export default Services;
