import { Link } from "react-router-dom";
import {
  ArrowRight, BadgeCheck, Bug, CalendarDays, CheckCircle2, CreditCard, GaugeCircle, LifeBuoy, Lock, Rocket, Server, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SectionHeading from "@/components/SectionHeading";
import SEO from "@/components/SEO";
import { INTEGRATIONS, PROTOTYPE_PACKAGE } from "../../supabase/functions/_shared/estimate";

const gaps = [
  { icon: Lock, title: "Security holes", desc: "Exposed API keys, missing access rules, unvalidated input and open database tables. Fine for a demo — dangerous with real users and real data." },
  { icon: CreditCard, title: "Real payments", desc: "Stripe, PayPal, Pesapal, M-Pesa and other gateways: checkout, webhooks, refunds and reconciliation that actually work against live provider accounts." },
  { icon: Bug, title: "Edge cases & bugs", desc: "Auth flows, error states, empty states, retries and flaky third-party calls that AI tools gloss over." },
  { icon: Server, title: "Deployment & ops", desc: "Environments, CI/CD, backups, domains, SSL, monitoring and alerts — so it stays up and you know when it doesn't." },
  { icon: GaugeCircle, title: "Performance & scale", desc: "Slow queries, heavy bundles and missing indexes that only show up once traffic arrives." },
  { icon: LifeBuoy, title: "Someone accountable", desc: "An engineering team you can call when something breaks, plus documentation so you're never locked in." },
];

const steps = [
  { step: "01", title: "Share your prototype", desc: "Send the link or repo and answer five quick questions. We email you a scoped quote within 24 hours." },
  { step: "02", title: "Audit & harden", desc: "We review the code and architecture, fix security issues, clean up the data model and lock down access." },
  { step: "03", title: "Integrate & deploy", desc: "We wire up live payments and APIs, set up production hosting, CI/CD, monitoring and backups." },
  { step: "04", title: "Launch & support", desc: "We go live with you, hand over documentation, and support you for 30 days after launch." },
];

const faqs = [
  { q: "Which AI tools do you work with?", a: "Lovable, Bolt, v0, Replit, Cursor, Windsurf, Base44, ChatGPT/Claude-generated code and most React, Next.js, Vite or Flutter codebases. If you can share the code or a link, we can review it." },
  { q: "What if the prototype can't be salvaged?", a: "We tell you straight after the audit. If a rebuild of some or all of it is the better path, we'll re-quote before doing any work — you never pay for a rebuild without agreeing to it." },
  { q: "Could the price change later?", a: "Your quote sets out scope, price and timeline. If the scope changes we agree it with you first — no surprises. Third-party fees (hosting, payment providers, SMS, AI usage) are billed by those providers directly." },
  { q: "Who owns the code?", a: "You do. You get the full repository, deployment access and handover documentation." },
  { q: "How fast can you start?", a: "Typically within a week of accepting the quote. Faster scheduling is available on request." },
  { q: "What if I need more than the sprint covers?", a: "Larger scopes (many custom features, native mobile apps or enterprise systems) are quoted as custom builds. We'll tell you in your quote which path fits." },
];

const PrototypeToProduction = () => (
  <>
    <SEO
      title="Take Your AI Prototype to Production | Production Sprint | Teevexa"
      description="Built an app with Lovable, Bolt, v0 or Cursor? Our Prototype-to-Production Sprint adds security, live payments (Stripe, PayPal, Pesapal, M-Pesa and more), deployment and 30 days of support."
      canonical="/prototype-to-production"
      structuredData={{
        "@context": "https://schema.org",
        "@type": "Service",
        name: PROTOTYPE_PACKAGE.name,
        provider: { "@type": "Organization", name: "Teevexa Ltd", url: "https://teevexa.com" },
        description: "Service that hardens, integrates, deploys and supports AI-built prototypes so they are ready for real users.",
      }}
    />

    {/* Hero */}
    <section className="relative py-28  gradient-hero network-bg overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/8 blur-3xl animate-pulse-glow" />
      </div>
      <div className="container mx-auto text-center relative z-10 animate-fade-in">
        <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6 text-xs font-semibold uppercase tracking-widest text-primary">
          <Rocket size={13} /> Tailored quote within 24 hours
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold leading-tight mb-6">
          An AI prototype gets you 70%. <span className="gradient-text">We finish the last 30% and run it.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
          Built something in Lovable, Bolt, v0 or Cursor? We take it to production: security hardening, live payments with Stripe, PayPal, Pesapal, M-Pesa or whichever gateway your market needs, deployment, monitoring and 30 days of support — with a clear, itemised quote.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="glow-primary h-14 px-10 rounded-xl" asChild>
            <Link to="/start-project?type=prototype">Get my quote <ArrowRight className="ml-2" size={18} /></Link>
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-10 rounded-xl border-2" asChild>
            <Link to="/book-consultation"><CalendarDays className="mr-2" size={18} /> Book a free call</Link>
          </Button>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">No account needed · Tailored quote by email within 24 hours</p>
      </div>
    </section>

    {/* The last 30% */}
    <section className="py-24">
      <div className="container mx-auto">
        <SectionHeading label="The last 30%" title="What AI builders don't ship" description="Prototypes are great at the first 70%: screens and happy paths. The rest is what separates a demo from a business." />
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gaps.map((g) => (
            <div key={g.title} className="glass rounded-2xl p-6 hover:border-primary/40 transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4"><g.icon className="text-primary" size={22} /></div>
              <h3 className="font-display font-semibold text-lg mb-2">{g.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{g.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Package + pricing */}
    <section className="section-card py-24">
      <div className="container mx-auto">
        <SectionHeading label="The package" title={PROTOTYPE_PACKAGE.name} description="One clear scope, quoted to your prototype. Add only the integrations you need." />
        <div className="mt-12 grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 glass rounded-2xl p-8">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><ShieldCheck className="text-primary" size={18} /> Included in the base price</h3>
            <ul className="space-y-2.5">
              {PROTOTYPE_PACKAGE.includes.map((x) => (
                <li key={x} className="flex items-start gap-2.5 text-sm text-muted-foreground"><CheckCircle2 size={15} className="text-primary mt-0.5 shrink-0" />{x}</li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2 glass rounded-2xl p-8 border-2 border-primary/40">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Tailored quote</p>
            <p className="font-display font-bold text-2xl mt-1">Tailored to your prototype</p>
            <p className="text-sm text-muted-foreground mt-2">Tell us what you've built and get your quote by email within 24 hours. 30 days of support included.</p>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-6 mb-3">Integrations we wire up</h4>
            <ul className="space-y-1.5 text-sm">
              {INTEGRATIONS.map((i) => (
                <li key={i.id} className="flex items-start gap-2 text-muted-foreground"><CheckCircle2 size={13} className="text-primary mt-0.5 shrink-0" />{i.label}</li>
              ))}
            </ul>
            <Button className="w-full mt-6 glow-primary" asChild><Link to="/start-project?type=prototype">Get my quote <ArrowRight className="ml-2" size={16} /></Link></Button>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">Third-party fees (hosting, payment providers, SMS, AI usage) are billed by those providers. Larger scopes are quoted as custom builds.</p>
      </div>
    </section>

    {/* Process */}
    <section className="py-24">
      <div className="container mx-auto">
        <SectionHeading label="How it works" title="From prototype to live in weeks" />
        <div className="mt-12 space-y-5">
          {steps.map((s) => (
            <div key={s.step} className="flex gap-6 items-start glass rounded-2xl p-6 hover:border-primary/30 transition-colors">
              <span className="text-3xl font-display font-bold gradient-text shrink-0">{s.step}</span>
              <div>
                <h3 className="font-display font-semibold text-lg mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* FAQ */}
    <section className="section-card py-24">
      <div className="container mx-auto">
        <SectionHeading label="FAQ" title="Questions we hear a lot" />
        <Accordion type="single" collapsible className="mt-10 glass rounded-2xl overflow-hidden divide-y divide-border">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`f-${i}`} className="border-0 px-6">
              <AccordionTrigger className="text-sm font-semibold text-left hover:no-underline hover:text-primary py-5 gap-4">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>

    {/* CTA */}
    <section className="py-24">
      <div className="container mx-auto text-center">
        <BadgeCheck className="mx-auto text-primary mb-4" size={36} />
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Ready to make it <span className="gradient-text">real?</span></h2>
        <p className="text-muted-foreground mb-8">Tell us about your prototype and get a tailored quote by email within 24 hours. No account, no commitment.</p>
        <Button size="lg" className="glow-primary h-14 px-10 rounded-xl" asChild>
          <Link to="/start-project?type=prototype">Get my quote <ArrowRight className="ml-2" size={18} /></Link>
        </Button>
      </div>
    </section>
  </>
);

export default PrototypeToProduction;
