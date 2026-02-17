import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/SectionHeading";
import {
  Globe, Smartphone, ShoppingCart, Building2, Palette, Sparkles,
  Shield, Layers, MapPin, Lock, Leaf, Wheat, Ship, Heart, Store,
  ArrowRight, QrCode, BarChart3, Eye
} from "lucide-react";

/* ── Data ── */
const coreValues = [
  { icon: Shield, title: "Integrity", desc: "Honest, transparent practices in every engagement." },
  { icon: Sparkles, title: "Innovation", desc: "Cutting-edge solutions that push boundaries." },
  { icon: Layers, title: "Empowerment", desc: "Enabling businesses to own their digital future." },
  { icon: Leaf, title: "Sustainability", desc: "Technology that respects people and planet." },
  { icon: Eye, title: "Transparency", desc: "Clear communication and open processes." },
];

const services = [
  { icon: Globe, title: "Web Development", bullets: ["Custom CMS", "API integrations", "SEO architecture"], path: "/services/web-development" },
  { icon: Smartphone, title: "Mobile Development", bullets: ["Cross-platform apps", "Offline-first", "Push notifications"], path: "/services/mobile-development" },
  { icon: ShoppingCart, title: "E-Commerce", bullets: ["Payment gateways", "Inventory systems", "Multi-vendor"], path: "/services/e-commerce-systems" },
  { icon: Building2, title: "Enterprise Software", bullets: ["ERP & CRM", "Workflow automation", "Data analytics"], path: "/services/enterprise-software" },
  { icon: Palette, title: "UI/UX Design", bullets: ["User research", "Design systems", "Prototyping"], path: "/services/ui-ux-design" },
  { icon: Sparkles, title: "Digital Transformation", bullets: ["Process digitization", "Cloud migration", "Legacy modernization"], path: "/services" },
];

const industries = [
  { icon: Wheat, title: "Agriculture", path: "/industries/agriculture" },
  { icon: Ship, title: "Export & Trade", path: "/industries/export-trade" },
  { icon: MapPin, title: "Logistics", path: "/industries/logistics" },
  { icon: Heart, title: "NGOs", path: "/industries/ngos" },
  { icon: Store, title: "SMEs", path: "/industries/smes" },
];

const whyChoose = [
  { icon: Lock, title: "Immutable Systems", desc: "Tamper-proof data integrity." },
  { icon: Layers, title: "Scalable Architecture", desc: "Grow without limits." },
  { icon: MapPin, title: "African-First", desc: "Solutions built for the continent." },
  { icon: Shield, title: "Secure Infrastructure", desc: "Enterprise-grade security." },
];

const portfolio = [
  { title: "AgriTrace Platform", industry: "Agriculture", desc: "End-to-end farm-to-market traceability system." },
  { title: "TradeConnect Portal", industry: "Export & Trade", desc: "Digital documentation and compliance platform." },
  { title: "LogiTrack Suite", industry: "Logistics", desc: "Real-time fleet and inventory management." },
];

const Index = () => {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[90vh] flex items-center justify-center gradient-hero network-bg overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-accent/10 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10 animate-fade-in">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            Tech Evolution for Exceptional Applications
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight max-w-5xl mx-auto">
            Building Digital Infrastructure for{" "}
            <span className="gradient-text">Africa's Future</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Custom Web & Mobile Solutions. Blockchain-Powered Traceability.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="glow-primary text-base px-8" asChild>
              <Link to="/start-project">Start a Project <ArrowRight className="ml-2" size={18} /></Link>
            </Button>
            <Button variant="outline" size="lg" className="text-base px-8" asChild>
              <Link to="/book-consultation">Book Consultation</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Who We Are ── */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <SectionHeading
            label="Who We Are"
            title="Mission-Driven Technology Company"
            description="We exist to empower African businesses with world-class digital solutions that are secure, scalable, and sustainable."
          />
          <div className="mt-6 grid md:grid-cols-2 gap-6 max-w-3xl mx-auto text-center">
            <div className="glass rounded-2xl p-6 space-y-2">
              <h3 className="font-display font-semibold text-primary">Mission</h3>
              <p className="text-sm text-muted-foreground">To deliver innovative, secure, and scalable digital solutions that drive growth across Africa.</p>
            </div>
            <div className="glass rounded-2xl p-6 space-y-2">
              <h3 className="font-display font-semibold text-primary">Vision</h3>
              <p className="text-sm text-muted-foreground">To be Africa's leading technology infrastructure partner, powering the next generation of enterprise applications.</p>
            </div>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {coreValues.map((v) => (
              <div key={v.title} className="glass rounded-2xl p-5 text-center group hover:border-primary/40 transition-all duration-300 hover:-translate-y-1">
                <v.icon className="mx-auto text-primary mb-3 group-hover:scale-110 transition-transform" size={28} />
                <h4 className="font-display font-semibold text-sm">{v.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What We Do ── */}
      <section className="py-24 px-4 bg-card/30">
        <div className="container mx-auto">
          <SectionHeading label="What We Do" title="End-to-End Digital Solutions" description="From concept to deployment and beyond — we build technology that works." />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.title} className="glass rounded-2xl p-6 group hover:border-primary/40 transition-all duration-300 hover:-translate-y-1">
                <s.icon className="text-primary mb-4 group-hover:scale-110 transition-transform" size={32} />
                <h3 className="font-display font-semibold text-lg mb-3">{s.title}</h3>
                <ul className="space-y-1.5 text-sm text-muted-foreground mb-4">
                  {s.bullets.map((b) => <li key={b} className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-primary" />{b}</li>)}
                </ul>
                <Link to={s.path} className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                  Learn More <ArrowRight size={14} className="ml-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Industries ── */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <SectionHeading label="Industries" title="Solutions Across Sectors" description="Tailored digital strategies for the industries that drive Africa's economy." />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {industries.map((ind) => (
              <Link key={ind.title} to={ind.path} className="glass rounded-2xl p-6 text-center group hover:border-primary/40 transition-all duration-300 hover:-translate-y-1">
                <ind.icon className="mx-auto text-primary mb-3 group-hover:scale-110 transition-transform" size={32} />
                <h3 className="font-display font-semibold">{ind.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Teevexa ── */}
      <section className="py-24 px-4 bg-card/30">
        <div className="container mx-auto">
          <SectionHeading label="Why Teevexa" title="Built Different" />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChoose.map((w) => (
              <div key={w.title} className="glass rounded-2xl p-6 text-center group hover:border-primary/40 transition-all duration-300 hover:-translate-y-1">
                <w.icon className="mx-auto text-primary mb-3" size={28} />
                <h3 className="font-display font-semibold mb-1">{w.title}</h3>
                <p className="text-sm text-muted-foreground">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Portfolio Preview ── */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <SectionHeading label="Portfolio" title="Featured Work" description="A glimpse of the digital solutions we've delivered." />
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {portfolio.map((p) => (
              <div key={p.title} className="glass rounded-2xl overflow-hidden group cursor-pointer hover:border-primary/40 transition-all duration-300">
                <div className="h-48 gradient-primary relative flex items-center justify-center">
                  <BarChart3 className="text-primary/30" size={64} />
                  <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="outline" size="sm">View Case Study</Button>
                  </div>
                </div>
                <div className="p-5">
                  <span className="text-xs text-primary font-medium">{p.industry}</span>
                  <h3 className="font-display font-semibold mt-1">{p.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Teevexa Trace Teaser ── */}
      <section className="py-24 px-4 bg-card/30 network-bg">
        <div className="container mx-auto text-center max-w-3xl">
          <SectionHeading
            label="Coming Soon"
            title="Teevexa Trace"
            description="Blockchain-Powered Traceability for supply chains, agriculture, and sustainability — bringing transparency from farm to market."
          />
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><QrCode size={18} className="text-primary" /> QR Verification</div>
            <div className="flex items-center gap-2"><MapPin size={18} className="text-primary" /> Farm-to-Export Tracking</div>
            <div className="flex items-center gap-2"><BarChart3 size={18} className="text-primary" /> Sustainability Scoring</div>
          </div>
          <Button size="lg" className="mt-8 glow-primary" asChild>
            <Link to="/teevexa-trace">Join Waitlist</Link>
          </Button>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold">
            Build With <span className="gradient-text">Confidence</span>.
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Ready to transform your business with technology that scales? Let's talk.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="glow-primary px-8" asChild>
              <Link to="/start-project">Start a Project</Link>
            </Button>
            <Button variant="outline" size="lg" className="px-8" asChild>
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
