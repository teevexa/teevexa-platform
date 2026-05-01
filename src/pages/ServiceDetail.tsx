import { useParams, Link } from "react-router-dom";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, CheckCircle2, Search, Lightbulb, PenTool, Code2, Shield, Rocket, HeadphonesIcon } from "lucide-react";

const serviceData: Record<string, {
  title: string;
  tagline: string;
  problem: string;
  gap: string;
  approach: string;
  features: string[];
}> = {
  "web-development": {
    title: "Web Development",
    tagline: "High-performance web applications engineered for scale.",
    problem: "Many African businesses rely on outdated, poorly maintained websites that fail to convert visitors, support operations, or handle traffic spikes.",
    gap: "A shortage of skilled, affordable web development partners who understand both global engineering standards and local infrastructure constraints.",
    approach: "We build custom, responsive web applications using modern frameworks with security, SEO optimisation, and cloud-native architecture built in from day one.",
    features: ["Custom CMS & headless architecture", "API-first & third-party integrations", "User authentication & role-based access", "Admin control panels", "Real-time analytics integration", "SEO & Core Web Vitals", "Progressive Web App (PWA) capabilities", "Security hardening & penetration testing"],
  },
  "mobile-development": {
    title: "Mobile Development",
    tagline: "Cross-platform apps with native performance and offline-first reliability.",
    problem: "Mobile-first markets need reliable apps, but many businesses struggle with fragmented iOS/Android development and apps that fail in low-connectivity environments.",
    gap: "Cross-platform solutions that don't sacrifice performance, user experience, or reliability when the network drops.",
    approach: "We deliver cross-platform mobile apps using React Native with offline-first architecture, seamless backend sync, and full analytics from day one.",
    features: ["iOS & Android from a single codebase", "Offline-first architecture & data sync", "Push notifications", "Biometric authentication (Face/Fingerprint)", "Real-time data updates", "In-app payments & subscriptions", "App store submission & optimisation", "Crash reporting & performance monitoring"],
  },
  "e-commerce-systems": {
    title: "E-Commerce Systems",
    tagline: "Full-featured commerce platforms built for Africa's payment landscape.",
    problem: "E-commerce adoption across Africa is accelerating, but businesses lack platforms that handle local payment methods, complex shipping logic, and high-traffic demand.",
    gap: "Platforms that integrate M-Pesa, Paystack, and Flutterwave natively — not as afterthoughts — with intelligent inventory and multi-vendor capability.",
    approach: "We build custom commerce platforms with local payment integration, multi-currency support, and intelligent inventory management as core features.",
    features: ["Local payment gateways (M-Pesa, Paystack, Flutterwave)", "Multi-currency & international support", "Inventory & warehouse management", "Shipping logic & order tracking", "Coupon & discount engine", "Subscription & recurring orders", "Multi-vendor marketplace support", "Real-time analytics & reporting"],
  },
  "enterprise-software": {
    title: "Enterprise Software",
    tagline: "Custom ERP, CRM, and automation for complex African enterprises.",
    problem: "Enterprises are stuck with disconnected legacy systems, manual workflows, and data silos that slow decisions and compound operational costs.",
    gap: "Integrated, scalable software that unifies operations across departments without vendor lock-in or expensive licensing.",
    approach: "We design and build custom ERP, CRM, and workflow automation solutions tailored to your processes — not the other way around.",
    features: ["Custom ERP & CRM development", "Workflow & process automation", "Role-based access control (RBAC)", "Single Sign-On (SSO/LDAP)", "Data pipelines & business intelligence", "Real-time dashboards", "API integrations (REST/GraphQL)", "GDPR, HIPAA & compliance tooling"],
  },
  "ui-ux-design": {
    title: "UI/UX Design",
    tagline: "Research-driven design that works across devices, languages, and literacy levels.",
    problem: "Poor user experience drives high churn, low adoption, and missed revenue. Most design agencies optimise for Figma awards, not for users.",
    gap: "Design teams that combine global best practices with a deep understanding of how African users actually interact with digital products.",
    approach: "We conduct real user research, build comprehensive design systems, and prototype everything in Figma — tested and approved before a line of code is written.",
    features: ["User research & usability testing", "Design systems in Figma", "Interactive & animated prototyping", "Accessibility (WCAG 2.1 compliance)", "Responsive design for all screen sizes", "Multi-language & RTL layout support", "Brand identity & visual language", "Developer handoff & style guides"],
  },
};

const processSteps = [
  { icon: Search,         step: "01", title: "Discovery"   },
  { icon: Lightbulb,      step: "02", title: "Strategy"    },
  { icon: PenTool,        step: "03", title: "Design"      },
  { icon: Code2,          step: "04", title: "Development" },
  { icon: Shield,         step: "05", title: "QA & Security"},
  { icon: Rocket,         step: "06", title: "Launch"      },
  { icon: HeadphonesIcon, step: "07", title: "Support"     },
];

const ServiceDetail = () => {
  const { slug } = useParams();
  const service = serviceData[slug || ""];

  if (!service) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-4 text-center">
        <h2 className="text-2xl font-display font-bold">Service Not Found</h2>
        <p className="text-muted-foreground text-sm">Check the URL or browse all services below.</p>
        <Button asChild><Link to="/services">View All Services</Link></Button>
      </div>
    );
  }

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative py-32 px-4 gradient-hero network-bg overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-primary/8 blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 left-1/3 w-60 h-60 rounded-full bg-accent/7 blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
        </div>
        <div className="container mx-auto max-w-4xl relative z-10 animate-fade-in">
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={15} /> All Services
          </Link>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary block mb-4">Service</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-5">
            {service.title}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
            {service.tagline}
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="glow-primary px-8" asChild>
              <Link to="/start-project">Start a Project <ArrowRight className="ml-2" size={18} /></Link>
            </Button>
            <Button variant="outline" size="lg" className="px-8" asChild>
              <Link to="/book-consultation">Book a Consultation</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Problem / Gap / Approach ── */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: "01", label: "The Problem",   text: service.problem,  accent: "bg-destructive/10 text-destructive" },
              { num: "02", label: "The Gap",        text: service.gap,      accent: "bg-accent/10 text-accent" },
              { num: "03", label: "Our Approach",   text: service.approach, accent: "bg-primary/10 text-primary" },
            ].map((item) => (
              <div key={item.num} className="glass rounded-2xl p-7 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-4 ${item.accent}`}>
                  {item.label}
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section-card py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <SectionHeading label="What's Included" title="Everything You Need" description="A full-service offering — from architecture to launch and beyond." />
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {service.features.map((f) => (
              <div key={f} className="flex items-start gap-3 glass rounded-xl p-4 hover:border-primary/40 transition-colors">
                <CheckCircle2 className="text-primary flex-shrink-0 mt-0.5" size={16} />
                <span className="text-sm leading-relaxed">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ── */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <SectionHeading
            label="How We Work"
            title="7-Step Delivery Process"
            description="A transparent, structured process — so you always know where things stand."
          />
          <div className="mt-14 grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {processSteps.map((p) => (
              <div key={p.step} className="flex flex-col items-center text-center gap-3 group">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                  <p.icon size={20} className="text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-primary/60 mb-0.5">{p.step}</p>
                  <p className="text-xs font-semibold">{p.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-navy py-24 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-4xl font-display font-bold mb-4">
            Ready to Get <span className="gradient-text">Started?</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-10">
            Tell us about your project and we'll prepare a tailored proposal — at no obligation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="glow-primary px-10" asChild>
              <Link to="/start-project">Start a Project <ArrowRight className="ml-2" size={18} /></Link>
            </Button>
            <Button variant="outline" size="lg" className="px-8 bg-transparent text-foreground border-foreground/30 hover:bg-foreground/10 hover:border-foreground/50" asChild>
              <Link to="/services"><ArrowLeft size={14} className="mr-1" /> All Services</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default ServiceDetail;
