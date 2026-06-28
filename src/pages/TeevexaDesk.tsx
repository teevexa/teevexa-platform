import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/SectionHeading";
import SEO from "@/components/SEO";
import {
  MessageSquare, BrainCircuit, BookOpen, Users, BarChart3, Shield,
  Smartphone, Cloud, Server, Zap, ArrowRight, CheckCircle2, CheckCheck,
  X, Globe, Headphones, Workflow, Lock, Bell, ArrowLeft,
} from "lucide-react";

const features = [
  { icon: BrainCircuit, title: "AI Intent Classification", desc: "Automatically understands what a customer wants and routes them to the right answer — without a human reading every message." },
  { icon: MessageSquare, title: "Embeddable Chat Widget", desc: "Drop one script tag into any website. The widget works on every device with full customisation to match your brand." },
  { icon: BookOpen, title: "Knowledge Base", desc: "Build a library of articles and FAQs. The AI searches it in real time and surfaces the most relevant answer for each conversation." },
  { icon: Users, title: "Human Escalation", desc: "When the AI can't help, conversations route instantly to a human agent with full context — no customer has to repeat themselves." },
  { icon: Smartphone, title: "WhatsApp Integration", desc: "Serve customers on WhatsApp Business using the same AI brain, knowledge base, and agent dashboard as your web chat." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Track conversation volume, resolution rate, escalation rate, sentiment trends, and top intents — all in one place." },
];

const steps = [
  { step: "01", title: "Connect Your Channels", desc: "Add the chat widget to your site and connect WhatsApp Business in minutes. No engineering required for cloud; a single deployment for self-hosted." },
  { step: "02", title: "Build Your Knowledge Base", desc: "Upload articles, FAQs, and product documentation. The AI indexes everything and learns what matters to your customers." },
  { step: "03", title: "AI Handles the Volume", desc: "The AI classifies intent, searches the knowledge base, and responds — automatically, 24/7, in under a second." },
  { step: "04", title: "Agents Handle What Matters", desc: "Complex, sensitive, or high-value conversations escalate to your team with full history. Agents focus on real work, not repetitive queries." },
];

const useCases = [
  { icon: Globe, title: "E-Commerce", desc: "Handle order status, returns, and product questions automatically. Escalate payment disputes to agents." },
  { icon: Zap, title: "SaaS Platforms", desc: "Resolve tier-1 support tickets instantly. Keep your engineering team focused on building." },
  { icon: Lock, title: "Finance & Fintech", desc: "Strict data requirements? Self-hosted means your customer conversations never leave your servers." },
  { icon: Headphones, title: "Telecoms & Utilities", desc: "Handle high-volume, repetitive queries at scale — billing, outages, plan changes — without hiring proportionally." },
];

const cloudPlans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    highlight: false,
    badge: null,
    features: [
      "200 AI conversations / month",
      "1 agent seat",
      "Web chat widget",
      "Knowledge base (20 articles)",
      "Basic analytics",
      "Community support",
    ],
    cta: "Get Started Free",
    link: "/book-consultation",
  },
  {
    name: "Growth",
    price: "$49",
    period: "/ month",
    highlight: true,
    badge: "Most Popular",
    features: [
      "2,000 AI conversations / month",
      "5 agent seats",
      "WhatsApp Business integration",
      "Knowledge base (200 articles)",
      "Full analytics & sentiment",
      "Email support",
    ],
    cta: "Start Free Trial",
    link: "/book-consultation",
  },
  {
    name: "Business",
    price: "$149",
    period: "/ month",
    highlight: false,
    badge: null,
    features: [
      "Unlimited conversations",
      "25 agent seats",
      "All integrations",
      "Unlimited knowledge base",
      "Custom branding & widget colours",
      "Priority support",
    ],
    cta: "Book a Demo",
    link: "/book-consultation",
  },
];

const selfHostedPlans = [
  {
    name: "Team",
    price: "$1,200",
    period: "one-time",
    users: "Up to 10 agents",
    support: "3 months included",
    features: [
      "Full source deployment",
      "Web chat widget",
      "WhatsApp integration",
      "Knowledge base",
      "Analytics dashboard",
      "Community + email support",
    ],
  },
  {
    name: "Business",
    price: "$2,500",
    period: "one-time",
    users: "Up to 50 agents",
    support: "6 months included",
    features: [
      "Everything in Team",
      "Custom branding",
      "API access",
      "Priority bug fixes",
      "Dedicated onboarding call",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: "$5,000",
    period: "one-time",
    users: "Unlimited agents",
    support: "12 months included",
    features: [
      "Everything in Business",
      "White-label rights (rebrand freely)",
      "Custom integrations",
      "SLA guarantee",
      "Dedicated success manager",
      "On-premise deployment assistance",
    ],
  },
];

const TeevexaDesk = () => (
  <>
    <SEO
      title="Teevexa Desk | AI-Powered Customer Support Platform"
      description="Teevexa Desk is an AI-powered customer support platform. Available as cloud SaaS or a self-hosted perpetual license — your data, your server, your terms."
      canonical="/teevexa-desk"
    />

    {/* ── Hero ── */}
    <section className="relative min-h-[80vh] flex items-center justify-center gradient-hero network-bg overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/8 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-accent/7 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      </div>
      <div className="container mx-auto px-4 text-center relative z-10 animate-fade-in max-w-4xl">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Teevexa Product</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
          Teevexa <span className="gradient-text">Desk</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-4">
          AI-powered customer support that resolves the majority of queries automatically — and hands off the rest to your team with full context.
        </p>
        <p className="text-sm text-muted-foreground mb-10">
          Available as <span className="text-primary font-semibold">Cloud SaaS</span> or a{" "}
          <span className="text-primary font-semibold">self-hosted perpetual license</span> — your data never has to leave your servers.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="glow-primary text-base px-8" asChild>
            <Link to="/book-consultation">Book a Demo <ArrowRight className="ml-2" size={18} /></Link>
          </Button>
          <Button variant="outline" size="lg" className="text-base px-8" asChild>
            <a href="#pricing">See Pricing</a>
          </Button>
        </div>
      </div>
    </section>

    {/* ── Two Deployment Paths ── */}
    <section className="section-teal py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <SectionHeading
          label="Deployment"
          title="Two Ways to Run Teevexa Desk"
          description="Choose the deployment model that fits your business. You can switch later."
        />
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-8 border-2 border-primary/30 hover:border-primary/60 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
              <Cloud className="text-primary" size={24} />
            </div>
            <h3 className="font-display font-bold text-xl mb-2">Cloud SaaS</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              We host everything. You sign up, add the chat widget, and you're live in minutes. No servers, no maintenance, no DevOps.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {["Free tier available", "Monthly subscription", "Automatic updates & security patches", "Best for SMEs and startups"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-primary flex-shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-2xl p-8 border-2 border-accent/30 hover:border-accent/60 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
              <Server className="text-accent" size={24} />
            </div>
            <h3 className="font-display font-bold text-xl mb-2">Self-Hosted License</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              You buy the license once, deploy on your own servers, and own it forever. No per-conversation fees. No data leaves your network.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {["One-time license fee", "No recurring AI API costs", "Full data sovereignty", "Best for enterprises & regulated industries"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-accent flex-shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>

    {/* ── Features ── */}
    <section className="py-24 px-4">
      <div className="container mx-auto">
        <SectionHeading
          label="Features"
          title="Everything Customer Support Needs"
          description="A complete platform — not a chatbot. AI, human agents, knowledge base, and analytics under one roof."
        />
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 group hover:border-primary/40 transition-all duration-300 hover:-translate-y-1">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="text-primary group-hover:scale-110 transition-transform" size={22} />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── How It Works ── */}
    <section className="section-card py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        <SectionHeading label="How It Works" title="Up and Running in a Day" description="No complex setup. No lengthy onboarding. Start resolving customer queries from day one." />
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

    {/* ── Use Cases ── */}
    <section className="py-24 px-4">
      <div className="container mx-auto">
        <SectionHeading label="Use Cases" title="Built for High-Volume Support Teams" description="Any business that answers the same questions repeatedly is a Teevexa Desk customer." />
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((u) => (
            <div key={u.title} className="glass rounded-2xl p-6 text-center group hover:border-primary/40 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <u.icon className="text-primary group-hover:scale-110 transition-transform" size={22} />
              </div>
              <h3 className="font-display font-semibold mb-2">{u.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{u.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Pricing ── */}
    <section id="pricing" className="section-card py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <SectionHeading label="Pricing" title="Simple, Transparent Pricing" description="Cloud SaaS for teams that want zero infrastructure. Self-hosted license for teams that want zero recurring fees." />

        {/* Cloud */}
        <div className="mt-14">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Cloud className="text-primary" size={16} />
            </div>
            <h3 className="font-display font-bold text-lg">Cloud SaaS</h3>
            <span className="text-xs text-muted-foreground">— hosted by Teevexa</span>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {cloudPlans.map((plan) => (
              <div key={plan.name} className={`glass rounded-2xl p-6 flex flex-col border-2 ${plan.highlight ? "border-primary glow-primary/10" : "border-border"}`}>
                {plan.badge && (
                  <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2">{plan.badge}</span>
                )}
                <h4 className="font-display font-bold text-xl">{plan.name}</h4>
                <div className="mt-2 mb-6">
                  <span className="text-3xl font-display font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">{plan.period}</span>
                </div>
                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCheck size={14} className="text-primary mt-0.5 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Button variant={plan.highlight ? "default" : "outline"} className={plan.highlight ? "glow-primary" : ""} asChild>
                  <Link to={plan.link}>{plan.cta} <ArrowRight className="ml-2" size={14} /></Link>
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Self-hosted */}
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Server className="text-accent" size={16} />
            </div>
            <h3 className="font-display font-bold text-lg">Self-Hosted Perpetual License</h3>
            <span className="text-xs text-muted-foreground">— your server, your data, yours forever</span>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {selfHostedPlans.map((plan) => (
              <div key={plan.name} className="glass rounded-2xl p-6 flex flex-col border border-border hover:border-accent/40 transition-colors">
                <h4 className="font-display font-bold text-xl">{plan.name}</h4>
                <div className="mt-2 mb-1">
                  <span className="text-3xl font-display font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">{plan.period}</span>
                </div>
                <p className="text-xs text-primary font-medium mb-1">{plan.users}</p>
                <p className="text-xs text-muted-foreground mb-5">{plan.support} · then $200/month</p>
                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCheck size={14} className="text-accent mt-0.5 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" asChild>
                  <Link to="/book-consultation">Get a Quote <ArrowRight className="ml-2" size={14} /></Link>
                </Button>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            Prices in USD. Billing available in KES, NGN, GHS, ZAR. Support retainer covers updates, security patches, and priority bug fixes.
          </p>
        </div>
      </div>
    </section>

    {/* ── Self-hosted advantage ── */}
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-5xl">
        <SectionHeading
          label="Self-Hosted Advantage"
          title="Why Companies Choose the License"
          description="Every competitor bills you per conversation, forever. With the Teevexa Desk license, you pay once."
        />
        <div className="mt-12 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 pr-6 font-semibold text-foreground">Consideration</th>
                <th className="py-3 px-4 text-center font-semibold text-primary">Teevexa Desk (Self-hosted)</th>
                <th className="py-3 px-4 text-center text-muted-foreground font-medium">Intercom / Freshchat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {[
                ["Monthly cost at 10,000 conversations", "~$0 (after license)", "$200–$800+"],
                ["Data stays on your servers", true, false],
                ["No vendor lock-in", true, false],
                ["Full source code access", true, false],
                ["White-label & rename freely", true, false],
                ["Works without internet (internal)", true, false],
                ["AI runs on open-source models (no API fees)", true, false],
              ].map(([feature, us, them]) => (
                <tr key={String(feature)} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 pr-6 text-muted-foreground">{feature}</td>
                  <td className="py-3 px-4 text-center">
                    {us === true
                      ? <CheckCheck size={16} className="mx-auto text-green-400" />
                      : <span className="text-primary font-semibold text-xs">{String(us)}</span>}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {them === true
                      ? <CheckCheck size={16} className="mx-auto text-green-400/50" />
                      : typeof them === "string" && them.startsWith("$")
                      ? <span className="text-destructive text-xs font-medium">{them}</span>
                      : <X size={16} className="mx-auto text-destructive/60" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>

    {/* ── CTA ── */}
    <section className="section-navy py-24 px-4 network-bg">
      <div className="container mx-auto text-center max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
          Ready to Transform Your <span className="gradient-text">Customer Support?</span>
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-10">
          Book a demo and we'll walk you through Teevexa Desk live — cloud or self-hosted, whichever fits your setup.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="glow-primary px-10 text-base" asChild>
            <Link to="/book-consultation">Book a Demo <ArrowRight className="ml-2" size={18} /></Link>
          </Button>
          <Button variant="outline" size="lg" className="px-10 text-base bg-transparent text-foreground border-foreground/30 hover:bg-foreground/10" asChild>
            <Link to="/contact">Talk to Sales</Link>
          </Button>
        </div>
      </div>
    </section>
  </>
);

export default TeevexaDesk;
