import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/SectionHeading";
import {
  Shield, Sparkles, Layers, Leaf, Eye,
  Target, ArrowRight, Globe, Linkedin,
  FlaskConical, Code2, CheckCircle2,
} from "lucide-react";
import benjaminHeadshot from "@/assets/benjamin-baya.jpg";

const stats = [
  { value: "2025",  label: "Year Founded" },
  { value: "50+",   label: "Projects Delivered" },
  { value: "8+",    label: "Countries Served" },
  { value: "100%",  label: "Client Satisfaction" },
];

const timeline = [
  {
    year: "Jul 2025",
    title: "Teevexa Begins",
    desc: "Benjamin Baya officially launches Teevexa with one mission: deliver enterprise-grade digital solutions to African businesses. Early projects in agricultural export tracking confirm the model works.",
  },
  {
    year: "Late 2025",
    title: "Teevexa Trace R&D",
    desc: "The supply chain traceability problem crystallises into a product idea. R&D begins on Teevexa Trace — a blockchain-powered platform built to give African producers verifiable proof of provenance for global markets.",
  },
  {
    year: "Mar 2026",
    title: "TEEVEXA LTD Incorporated",
    desc: "On 3rd March 2026, Teevexa Ltd is officially registered as a Private Limited Company in Kenya. A milestone — from a solo-founder mission to a recognised institution.",
  },
  {
    year: "2026 →",
    title: "Building the Future",
    desc: "Teevexa Trace enters active development. The client services business grows across East and West Africa. The dual mission — great software for clients, and a world-class product of our own — accelerates.",
  },
];

const values = [
  { icon: Shield,   title: "Integrity",      desc: "We say what we'll do and do what we say. No surprises, no hidden costs, no excuses." },
  { icon: Sparkles, title: "Innovation",     desc: "We solve problems others haven't solved yet. First-principles thinking over template copying." },
  { icon: Layers,   title: "Empowerment",    desc: "We build tools that give businesses ownership of their digital future, not dependency on us." },
  { icon: Leaf,     title: "Sustainability", desc: "Technology built to last — environmentally conscious, socially aware, and economically viable." },
  { icon: Eye,      title: "Transparency",   desc: "Open communication at every stage. You always know the status of your project." },
];

const About = () => (
  <>
    {/* ── Hero ── */}
    <section className="relative min-h-[70vh] flex items-center gradient-hero network-bg overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-primary/8 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full bg-accent/7 blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
      </div>
      <div className="container mx-auto px-4 py-24 relative z-10 animate-fade-in">
        <div className="max-w-3xl">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary block mb-4">About Teevexa Ltd</span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
            Built to Leave<br />
            <span className="gradient-text">a Mark</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed mb-8">
            A Nairobi-born, Kenya-registered technology company with a dual purpose: delivering world-class software to African businesses, and building the traceability infrastructure the continent's supply chains have always needed.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="glow-primary" asChild>
              <Link to="/start-project">Work With Us <ArrowRight className="ml-2" size={18} /></Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/careers">Join Our Team</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>

    {/* ── Stats ── */}
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

    {/* ── Our Story ── */}
    <section className="py-24 px-4">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
          <div>
            <SectionHeading label="Our Story" title="Born from Two Worlds" align="left" />
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Most technology companies are built by people who love technology. Teevexa was built by someone who loves <span className="text-foreground font-medium">process integrity</span>.
              </p>
              <p>
                Benjamin Baya trained as both a Chemical Engineer and a Software Engineer — two disciplines that, on the surface, have nothing in common. But Chemical Engineering is fundamentally about traceability: every reaction, every transfer, every transformation must be documented, verified, and provable. You cannot produce a pharmaceutical, export a food product, or run a refinery without an unbroken chain of custody.
              </p>
              <p>
                When Benjamin looked at Africa's agricultural sector, he saw brilliant farmers producing premium crops that deserved global markets — but couldn't prove their origins. Exporters were losing premium pricing, failing compliance audits, and being shut out of high-value supply chains not because their products were inferior, but because they had no credible trail to show for it.
              </p>
              <p>
                That became the obsession behind <span className="text-primary font-semibold">Teevexa Trace</span>. But to build Teevexa Trace properly — with enterprise-grade blockchain infrastructure and a mobile-first field app built for low-connectivity environments — he first needed to build the technology company that could do it.
              </p>
              <p>
                In July 2025, Teevexa was born. On 3rd March 2026, <span className="text-foreground font-semibold">TEEVEXA LTD</span> was officially incorporated in Kenya as a Private Limited Company.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                "Engineered for African infrastructure",
                "Global engineering standards",
                "Local payment integrations",
                "Multi-language ready",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 size={15} className="text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mission / Vision */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-border p-7 hover:border-primary/40 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Target className="text-primary" size={22} />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">Our Mission</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To deliver innovative, secure, and scalable digital solutions that drive measurable growth for African businesses — without compromising on quality, speed, or integrity.
              </p>
            </div>
            <div className="rounded-2xl border border-border p-7 hover:border-accent/40 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <Globe className="text-accent" size={22} />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">Our Vision</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To be Africa's leading technology infrastructure partner — the company that powers the next generation of enterprise applications and gives African producers transparent access to global markets.
              </p>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-7">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Leaf className="text-primary" size={22} />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">Why It Matters</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Africa produces some of the world's finest commodities. The continent's producers deserve software and infrastructure that proves it — to buyers in Amsterdam, London, Tokyo, and everywhere in between.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── Timeline ── */}
    <section className="section-card py-24 px-4">
      <div className="container mx-auto max-w-3xl">
        <SectionHeading label="Journey" title="How We Got Here" description="A young company with a clear thesis, moving fast." />
        <div className="mt-14 relative">
          <div className="absolute left-5 top-2 bottom-2 w-px bg-gradient-to-b from-primary via-primary/40 to-transparent hidden sm:block" />
          <div className="space-y-8">
            {timeline.map((item, i) => (
              <div key={item.year} className="sm:pl-16 relative animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="hidden sm:flex absolute left-0 top-0 flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/15 border-2 border-primary flex items-center justify-center z-10">
                    <span className="text-[9px] font-bold text-primary text-center leading-tight">{item.year}</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-border p-6 hover:border-primary/30 hover:shadow-sm transition-all">
                  <span className="sm:hidden text-xs font-bold text-primary block mb-1">{item.year}</span>
                  <h3 className="font-display font-bold text-base mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* ── Values ── */}
    <section className="section-teal py-24 px-4">
      <div className="container mx-auto">
        <SectionHeading label="Core Values" title="What Drives Every Decision" description="These aren't aspirational statements. They're the criteria we use when we're unsure what to do." />
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {values.map((v) => (
            <div key={v.title} className="glass rounded-2xl p-6 group hover:border-primary/50 hover:-translate-y-1 transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <v.icon className="text-primary" size={22} />
              </div>
              <h4 className="font-display font-bold mb-2">{v.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Founder & CEO ── */}
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-5xl">
        <SectionHeading label="Leadership" title="The Person Behind Teevexa" />
        <div className="mt-14 grid lg:grid-cols-[320px_1fr] gap-12 items-start">

          {/* Headshot */}
          <div className="flex flex-col items-center lg:items-start gap-5">
            <div className="relative">
              <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-br from-primary/30 to-accent/20 blur-sm" />
              <img
                src={benjaminHeadshot}
                alt="Benjamin Baya — Founder & CEO of Teevexa Ltd"
                className="relative w-64 h-72 lg:w-full lg:h-80 object-cover object-top rounded-2xl"
              />
            </div>
            <div className="text-center lg:text-left">
              <h3 className="font-display font-bold text-xl">Benjamin Baya</h3>
              <p className="text-primary font-semibold text-sm mt-0.5">Founder & CEO — TEEVEXA LTD</p>
              <div className="flex gap-2 mt-3 justify-center lg:justify-start">
                <a href="https://www.linkedin.com/in/benjamin-mweri-baya" target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                  <Linkedin size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            {/* Credentials */}
            <div className="flex flex-wrap gap-3 mb-6">
              {[
                { icon: FlaskConical, label: "Chemical Engineer" },
                { icon: Code2,        label: "Certified Software Engineer" },
              ].map((c) => (
                <span key={c.label} className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs font-semibold text-foreground/80">
                  <c.icon size={13} className="text-primary" /> {c.label}
                </span>
              ))}
            </div>

            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                <span className="text-foreground font-semibold">Benjamin Baya</span> is not a typical tech founder. He holds degrees in both Chemical Engineering and Software Engineering — a combination that sounds unlikely until you understand what it produces: someone who thinks about technology not just in terms of what can be built, but in terms of process integrity, provenance, and proof.
              </p>
              <p>
                In Chemical Engineering, those principles are non-negotiable. Every reaction is logged. Every transfer is documented. Every batch has a paper trail that can be audited years later. It is a discipline that takes traceability seriously — because lives depend on it.
              </p>
              <p>
                Benjamin carried that mindset into software. And when he observed Africa's agricultural and export sector — a sector filled with world-class producers who couldn't prove the quality of their own products to international buyers — he saw a solvable problem.
              </p>
              <p>
                The answer was <span className="text-primary font-semibold">Teevexa Trace</span>: a blockchain-powered traceability platform that applies Chemical Engineering's rigour to supply chains at scale. Every farm batch recorded. Every handoff verified. Every export shipment provable to any buyer, anywhere in the world.
              </p>
              <p>
                But building Teevexa Trace required a world-class technology foundation. So in July 2025, Benjamin launched <span className="text-foreground font-semibold">Teevexa Ltd</span> — a full-service software development house that builds the kind of infrastructure Teevexa Trace demands, while delivering that same calibre of engineering to clients across Africa and beyond.
              </p>
              <p className="text-foreground/70 italic text-sm border-l-2 border-primary/40 pl-4">
                "The problem with African supply chains isn't the quality of what's produced. It's the inability to prove it. That's a technology problem — and technology is exactly what we're here to fix."
                <br /><span className="not-italic font-semibold text-foreground/80 text-xs mt-1 block">— Benjamin Baya</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── Incorporation note ── */}
    <section className="section-teal py-16 px-4">
      <div className="container mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Legal & Registration</p>
        <h3 className="font-display font-bold text-2xl mb-3">Officially TEEVEXA LTD</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Incorporated on <span className="font-semibold text-foreground">3rd March 2026</span> as a Private Limited Company in Kenya.
          Registered under the Companies Act with full compliance to Kenyan corporate law.
        </p>
      </div>
    </section>

    {/* ── CTA ── */}
    <section className="section-navy py-24 px-4">
      <div className="container mx-auto text-center max-w-2xl">
        <h2 className="text-4xl font-display font-bold mb-4">
          Ready to Build <span className="gradient-text">With Us?</span>
        </h2>
        <p className="text-muted-foreground mb-10 leading-relaxed">
          Whether you want to start a project, explore Teevexa Trace, or join our growing team — we'd love to hear from you.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="glow-primary px-8" asChild>
            <Link to="/start-project">Start a Project <ArrowRight className="ml-2" size={18} /></Link>
          </Button>
          <Button variant="outline" size="lg" className="px-8 bg-transparent text-foreground border-foreground/30 hover:bg-foreground/10 hover:border-foreground/50" asChild>
            <Link to="/teevexa-trace">Explore Teevexa Trace</Link>
          </Button>
        </div>
      </div>
    </section>
  </>
);

export default About;
