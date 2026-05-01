import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/SectionHeading";
import {
  Globe, Smartphone, ShoppingCart, Building2, Palette, Sparkles,
  Shield, Layers, MapPin, Lock, Leaf, Wheat, Ship, Heart, Store,
  ArrowRight, QrCode, BarChart3, Eye, ChevronDown, Quote,
  CheckCircle2, Zap, Users, TrendingUp, Star,
} from "lucide-react";

const stats = [
  { value: "50+",  label: "Projects Delivered" },
  { value: "8+",   label: "Countries Served" },
  { value: "8+",   label: "Industries Served" },
  { value: "100%", label: "On-Time Delivery" },
];

const services = [
  { icon: Globe,       title: "Web Development",       bullets: ["Custom CMS & portals", "API integrations", "SEO-first architecture"],    path: "/services/web-development" },
  { icon: Smartphone,  title: "Mobile Development",    bullets: ["Cross-platform (iOS & Android)", "Offline-first capabilities", "Push notifications"],  path: "/services/mobile-development" },
  { icon: ShoppingCart,title: "E-Commerce Systems",    bullets: ["Payment gateway integration", "Inventory & multi-vendor", "Analytics dashboards"],       path: "/services/e-commerce-systems" },
  { icon: Building2,   title: "Enterprise Software",   bullets: ["ERP & CRM platforms", "Workflow automation", "Real-time data pipelines"],  path: "/services/enterprise-software" },
  { icon: Palette,     title: "UI/UX Design",          bullets: ["User research & testing", "Design systems", "Interactive prototypes"],     path: "/services/ui-ux-design" },
  { icon: Sparkles,    title: "Digital Transformation",bullets: ["Process digitization", "Cloud migration", "Legacy modernization"],         path: "/services" },
];

const industries = [
  { icon: Wheat,        title: "Agriculture & Agri-Tech" },
  { icon: Ship,         title: "Export & Trade" },
  { icon: MapPin,       title: "Logistics & Supply Chain" },
  { icon: Heart,        title: "NGOs & Non-Profit" },
  { icon: Store,        title: "Retail & E-Commerce" },
  { icon: Building2,    title: "Manufacturing" },
  { icon: TrendingUp,   title: "Finance & Fintech" },
  { icon: Globe,        title: "Education & EdTech" },
];

const whyUs = [
  { icon: Lock,         title: "Immutable Systems",     desc: "Tamper-proof data integrity with blockchain anchoring on every critical record." },
  { icon: Layers,       title: "Scalable Architecture", desc: "Cloud-native designs that scale from 100 to 1,000,000 users without rearchitecting." },
  { icon: MapPin,       title: "African-First",         desc: "Built for African infrastructure realities — intermittent connectivity, local payments, and compliance." },
  { icon: Shield,       title: "Secure by Default",     desc: "Enterprise-grade security: end-to-end encryption, role-based access, and penetration-tested." },
  { icon: TrendingUp,   title: "Data-Driven",           desc: "Real-time analytics dashboards so you make decisions on facts, not assumptions." },
  { icon: Zap,          title: "Fast Delivery",         desc: "Agile sprints with bi-weekly demos mean you see working software from week one." },
];

const testimonials = [
  { quote: "Teevexa built our export tracking platform in under 3 months. It fundamentally transformed how we operate — from manual spreadsheets to a fully automated supply chain.", name: "James Otieno", role: "CEO, AgroExport Kenya", stars: 5 },
  { quote: "The mobile app they delivered handles 10,000+ daily transactions flawlessly across 6 countries. The engineering quality is exceptional.", name: "Fatou Diop", role: "CTO, WestTrade Group", stars: 5 },
  { quote: "Their blockchain traceability solution gave our retail buyers complete confidence in our product integrity. Compliance audits that used to take weeks now take hours.", name: "Amara Coulibaly", role: "MD, Sahel Foods Ltd.", stars: 5 },
];

const traceFeatures = [
  { icon: QrCode,    label: "QR Farm-to-Export Verification" },
  { icon: MapPin,    label: "Real-Time GPS Route Tracking" },
  { icon: BarChart3, label: "Sustainability & ESG Scoring" },
  { icon: Shield,    label: "Blockchain-Anchored Audit Trail" },
];

interface CaseStudyPreview {
  id: string; title: string; slug: string; industry: string | null;
  description: string; cover_image_url: string | null;
}

const Index = () => {
  const [portfolio, setPortfolio] = useState<CaseStudyPreview[]>([]);

  useEffect(() => {
    supabase
      .from("case_studies")
      .select("id, title, slug, industry, description, cover_image_url")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(6)
      .then(({ data }) => setPortfolio((data as CaseStudyPreview[]) || []));
  }, []);

  return (
    <>
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
            Custom web & mobile solutions. Blockchain-powered supply chain traceability.
            Enterprise software that works in Africa's realities.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="glow-primary text-base h-13 px-8 rounded-xl" asChild>
              <Link to="/start-project">Start a Project <ArrowRight className="ml-2" size={18} /></Link>
            </Button>
            <Button variant="outline" size="lg" className="text-base h-13 px-8 rounded-xl" asChild>
              <Link to="/book-consultation">Book a Free Consultation</Link>
            </Button>
          </div>

          <div className="mt-16 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-primary" /> No upfront commitment</span>
            <span className="w-px h-3 bg-border" />
            <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-primary" /> Response in 24 hours</span>
            <span className="w-px h-3 bg-border" />
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

      {/* ── What We Do ── */}
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
            <Button variant="outline" asChild>
              <Link to="/services">View All Services <ArrowRight className="ml-2" size={16} /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Why Teevexa ── */}
      <section className="section-card py-24 px-4">
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
      <section className="py-24 px-4">
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

      {/* ── Featured Work ── */}
      {portfolio.length > 0 && (
        <section className="section-teal py-24 px-4">
          <div className="container mx-auto">
            <SectionHeading
              label="Portfolio"
              title="Featured Work"
              description="A selection of digital solutions we've delivered for clients across Africa."
            />
            <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolio.map((p) => (
                <Link
                  key={p.id}
                  to={`/portfolio/${p.slug}`}
                  className="glass rounded-2xl overflow-hidden group hover:border-primary/50 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300"
                >
                  <div className="h-48 gradient-primary relative flex items-center justify-center overflow-hidden">
                    {p.cover_image_url ? (
                      <img src={p.cover_image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <BarChart3 className="text-primary/20" size={56} />
                    )}
                    <div className="absolute inset-0 bg-foreground/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="bg-background text-foreground text-xs font-semibold px-4 py-2 rounded-full">View Case Study</span>
                    </div>
                  </div>
                  <div className="p-5">
                    {p.industry && (
                      <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-primary mb-2">{p.industry}</span>
                    )}
                    <h3 className="font-display font-bold leading-snug">{p.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{p.description}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Button variant="outline" asChild>
                <Link to="/portfolio">View All Projects <ArrowRight className="ml-2" size={16} /></Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials ── */}
      <section className="section-amber py-24 px-4">
        <div className="container mx-auto">
          <SectionHeading
            label="Client Stories"
            title="What Our Clients Say"
            description="We measure success by the impact we create for the businesses we work with."
          />
          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="glass rounded-2xl p-7 flex flex-col gap-5 hover:shadow-md transition-shadow">
                <Quote className="text-primary/40" size={32} />
                <p className="text-sm text-foreground/80 leading-relaxed flex-1 italic">"{t.quote}"</p>
                <div>
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} size={13} className="fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="font-display font-bold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Teevexa Trace — Flagship Product ── */}
      <section className="section-navy py-28 px-4 network-bg relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-accent/8 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        </div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <div className="flex justify-center mb-8">
              <span className="inline-flex items-center gap-2.5 bg-primary/15 border border-primary/30 rounded-full px-5 py-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Our Flagship Product</span>
              </span>
            </div>

            {/* Headline */}
            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight mb-5">
                Introducing{" "}
                <span className="gradient-text">Teevexa Trace</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                The product born from our founder's dual expertise in Chemical Engineering and Software — a blockchain-powered traceability platform that gives African producers the proof they need to access global markets.
              </p>
            </div>

            {/* Feature grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {traceFeatures.map((f) => (
                <div key={f.label} className="rounded-2xl border border-border bg-muted/20 px-5 py-5 flex items-center gap-3 text-left hover:border-primary/40 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <f.icon size={17} className="text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground leading-snug">{f.label}</span>
                </div>
              ))}
            </div>

            {/* Why it matters */}
            <div className="grid md:grid-cols-3 gap-4 mb-12 text-center">
              {[
                { stat: "$1.8T", desc: "lost annually to counterfeit goods" },
                { stat: "30%", desc: "of African exports face compliance rejection" },
                { stat: "65%", desc: "of consumers distrust product origin claims" },
              ].map((s) => (
                <div key={s.stat} className="rounded-2xl border border-border bg-muted/20 py-6 px-4">
                  <p className="text-3xl font-display font-bold gradient-text">{s.stat}</p>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="glow-primary px-10 text-base" asChild>
                <Link to="/teevexa-trace">Explore Teevexa Trace <ArrowRight className="ml-2" size={18} /></Link>
              </Button>
              <Button variant="outline" size="lg" className="px-10 text-base bg-transparent text-foreground border-foreground/30 hover:bg-foreground/10 hover:border-foreground/50" asChild>
                <Link to="/teevexa-trace#features">See All Features</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="section-teal py-24 px-4">
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
            <Button size="lg" className="glow-primary px-10 h-13 text-base rounded-xl" asChild>
              <Link to="/start-project">Start a Project</Link>
            </Button>
            <Button variant="outline" size="lg" className="px-10 h-13 text-base rounded-xl" asChild>
              <Link to="/contact">Talk to Us First</Link>
            </Button>
          </div>
          <div className="mt-8 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <Users size={13} className="text-primary" />
            <span>No contracts required · Cancel anytime · Start in days, not months</span>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
