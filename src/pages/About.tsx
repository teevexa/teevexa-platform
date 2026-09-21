import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/SectionHeading";
import SEO from "@/components/SEO";
import {
  Shield, Sparkles, Layers, Leaf, Eye,
  Target, ArrowRight, Globe, Linkedin,
  FlaskConical, Code2, CheckCircle2,
} from "lucide-react";
import benjaminHeadshot from "@/assets/benjamin-baya.jpg";

const stats = [
  { value: "2025", label: "Year Founded" },
  { value: "4", label: "Senior Software Engineers" },
  { value: "2", label: "Apps Live on Google Play" },
  { value: "24h", label: "Quote Turnaround" },
];

const timeline = [
  {
    year: "Jul 2025",
    title: "Teevexa Begins",
    desc: "Benjamin Baya launches Teevexa with one mission: deliver enterprise-grade digital solutions to ambitious businesses, starting with agricultural export tracking.",
  },
  {
    year: "Late 2025",
    title: "Building Teevexa Trace",
    desc: "The supply chain traceability problem becomes a product. Work begins on Teevexa Trace and its offline-first companion, Teevexa Field, so producers can prove provenance to global buyers.",
  },
  {
    year: "Mar 2026",
    title: "TEEVEXA LTD Incorporated",
    desc: "On 3rd March 2026, Teevexa Ltd is registered as a Private Limited Company in Kenya.",
  },
  {
    year: "2026",
    title: "Trace and Field go live",
    desc: "Teevexa Trace and Teevexa Field launch on Google Play. Alongside our own products, we build custom software, AI agents and production-ready apps for clients worldwide.",
  },
];

const values = [
  { icon: Shield,   title: "Integrity",      desc: "We say what we'll do and do what we say. No surprises, no hidden costs, no excuses." },
  { icon: Sparkles, title: "Innovation",     desc: "We solve problems others haven't solved yet. First-principles thinking over template copying." },
  { icon: Layers,   title: "Empowerment",    desc: "We build tools that give businesses ownership of their digital future, not dependency on us." },
  { icon: Leaf,     title: "Sustainability", desc: "Technology built to last - environmentally conscious, socially aware, and economically viable." },
  { icon: Eye,      title: "Transparency",   desc: "Open communication at every stage. You always know the status of your project." },
];

const About = () => (
  <>
    <SEO
      title="About Teevexa | Our Mission, Story & Team"
      description="Teevexa is a Nairobi-born, AI-native product engineering company: a team of senior software engineers building software, AI agents and production-ready apps for ambitious businesses worldwide."
      canonical="/about"
      structuredData={{
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: "About Teevexa",
        url: "https://teevexa.com/about",
        description: "Learn about Teevexa - who we are, what drives us, and the team building digital infrastructure for businesses worldwide.",
      }}
    />
    {/* ── Hero ── */}
    <section className="relative min-h-[70vh] flex items-center gradient-hero network-bg overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-primary/8 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full bg-accent/7 blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
      </div>
      <div className="container mx-auto py-24 relative z-10 animate-fade-in">
        <div className="max-w-3xl">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary block mb-4">About Teevexa Ltd</span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
            Built to Leave<br />
            <span className="gradient-text">a Mark</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed mb-8">
            A Nairobi-born, Kenya-registered, AI-native product engineering company. We build software and AI agents for ambitious businesses worldwide — and our own supply chain products, live on Google Play.
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

    {/* ── Our Story ── */}
    <section className="py-24">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
          <div>
            <SectionHeading label="Our Story" title="Born from Two Worlds" align="left" />
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Most technology companies are built by people who love technology. Teevexa was built by someone who loves <span className="text-foreground font-medium">process integrity</span> — knowing what happened, when, and being able to prove it.
              </p>
              <p>
                That instinct led us to supply chains. Producers make excellent products but often can't prove where they came from, and lose premium markets because of it. So we built <span className="text-primary font-semibold">Teevexa Trace</span> and <span className="text-primary font-semibold">Teevexa Field</span>, now live on Google Play.
              </p>
              <p>
                Building those products made us a strong engineering team, and we apply the same standards to client work: custom software, AI agents, and taking AI-built prototypes to production. Teevexa Ltd was incorporated in Kenya on <span className="text-foreground font-semibold">3rd March 2026</span>.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                "Built for real-world infrastructure constraints",
                "Senior engineers on every project",
                "Global and regional payment integrations",
                "Security and quality built in, not bolted on",
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
                To deliver innovative, secure, and scalable digital solutions that drive measurable growth for businesses worldwide - without compromising on quality, speed, or integrity.
              </p>
            </div>
            <div className="rounded-2xl border border-border p-7 hover:border-accent/40 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <Globe className="text-accent" size={22} />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">Our Vision</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To be a globally trusted technology partner - the company that powers the next generation of enterprise applications and gives producers worldwide transparent, verifiable access to global markets.
              </p>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-7">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Leaf className="text-primary" size={22} />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">Why It Matters</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Africa produces some of the world's finest commodities. The continent's producers deserve software and infrastructure that proves it - to buyers in Amsterdam, London, Tokyo, and everywhere in between.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── Timeline ── */}
    <section className="section-card py-24">
      <div className="container mx-auto">
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
    <section className="section-teal py-24">
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
    <section className="py-24">
      <div className="container mx-auto">
        <SectionHeading label="Leadership" title="Meet the Founder" />
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
                <span className="text-foreground font-semibold">Benjamin Baya</span> holds degrees in Chemical Engineering and Software Engineering. Chemical engineering treats every batch as something that must be documented, verified and provable — and he brings that discipline to software.
              </p>
              <p>
                He founded Teevexa in 2025 to build the traceability products global supply chains need, and leads a team of <span className="text-foreground font-semibold">four senior software engineers</span> who deliver the same standard of engineering for clients across Africa and beyond.
              </p>
              <p className="text-foreground/70 italic text-sm border-l-2 border-primary/40 pl-4">
                "The problem with African supply chains isn't the quality of what's produced. It's the inability to prove it. That's a technology problem - and technology is exactly what we're here to fix."
                <br /><span className="not-italic font-semibold text-foreground/80 text-xs mt-1 block">— Benjamin Baya</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── Incorporation note ── */}
    <section className="section-teal py-16">
      <div className="container mx-auto text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Legal & Registration</p>
        <h3 className="font-display font-bold text-2xl mb-3">Officially TEEVEXA LTD</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Incorporated on <span className="font-semibold text-foreground">3rd March 2026</span> as a Private Limited Company in Kenya.
          Registered under the Companies Act with full compliance to Kenyan corporate law.
        </p>
      </div>
    </section>

    {/* ── CTA ── */}
    <section className="section-navy py-24">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-display font-bold mb-4">
          Ready to Build <span className="gradient-text">With Us?</span>
        </h2>
        <p className="text-muted-foreground mb-10 leading-relaxed">
          Whether you want to start a project, explore Teevexa Trace, or join our growing team — we'd love to hear from you.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="glow-primary px-8" asChild>
            <Link to="/start-project">Get a Quote <ArrowRight className="ml-2" size={18} /></Link>
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
