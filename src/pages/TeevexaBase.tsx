import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/SectionHeading";
import SEO from "@/components/SEO";
import {
  Kanban, Users, Clock, BarChart3, Shield, FolderOpen,
  Bell, Server, CheckCheck, ArrowRight, CheckCircle2,
  Building2, Layers, Calendar, GitMerge, Lock, Globe, X,
} from "lucide-react";

const features = [
  { icon: Kanban, title: "Projects & Task Boards", desc: "Kanban and list views for every project. Assign tasks, set priorities, track progress — everything your team needs in one place." },
  { icon: Users, title: "Team Collaboration", desc: "Invite team members, assign roles, and collaborate in real time. Every task has a thread, every project has a feed." },
  { icon: Calendar, title: "Milestones & Timelines", desc: "Set milestones, visualise deadlines on a timeline, and track what's on track versus what's slipping — before it becomes a problem." },
  { icon: FolderOpen, title: "File Management", desc: "Attach files and documents directly to tasks and projects. No more hunting through email or Slack for that one file." },
  { icon: BarChart3, title: "Reports & Analytics", desc: "Track team velocity, project health, time spent, and milestone completion. Export reports for clients or leadership." },
  { icon: Shield, title: "Role-Based Access", desc: "Granular permission controls — admins, project managers, team members, and client-view guests all see exactly what they should." },
  { icon: Clock, title: "Time Tracking", desc: "Log time against tasks directly in the interface. Perfect for billing clients or understanding where team hours actually go." },
  { icon: Bell, title: "Notifications & Alerts", desc: "Configurable notifications for task updates, mentions, deadline reminders, and milestone completions." },
];

const steps = [
  { step: "01", title: "Purchase Your License", desc: "Choose the license tier that fits your team size. You receive the full deployment package — no activation keys, no phone-home checks." },
  { step: "02", title: "Deploy on Your Server", desc: "Run the installer on your own server (cloud VM, on-premise, or dedicated hardware). Our team assists with the first deployment." },
  { step: "03", title: "Set Up Your Workspace", desc: "Create your organisation, invite your team, and set up your first projects. Most teams are fully onboarded within a day." },
  { step: "04", title: "You Own It Forever", desc: "No subscriptions. No usage limits. The software is yours. Keep the support retainer active for updates and priority fixes, or manage it independently." },
];

const useCases = [
  { icon: Building2, title: "Professional Services", desc: "Law firms, consultancies, and agencies managing multiple client projects simultaneously." },
  { icon: Layers, title: "Software Teams", desc: "Engineering teams tracking sprints, bugs, features, and releases in a single system." },
  { icon: Globe, title: "NGOs & Donor Projects", desc: "Grant-funded projects with reporting requirements — milestone tracking built in." },
  { icon: Lock, title: "Regulated Industries", desc: "Finance, healthcare, and government where project data cannot sit on third-party SaaS servers." },
];

const plans = [
  {
    name: "Team",
    price: "$800",
    users: "Up to 15 users",
    support: "3 months support included",
    highlight: false,
    features: [
      "Unlimited projects & tasks",
      "Kanban + list views",
      "File attachments",
      "Milestone & timeline tracking",
      "Basic reporting",
      "Community + email support",
    ],
  },
  {
    name: "Business",
    price: "$1,800",
    users: "Up to 50 users",
    support: "6 months support included",
    highlight: true,
    features: [
      "Everything in Team",
      "Client portal (read-only guest access)",
      "Advanced reports & exports",
      "Time tracking",
      "API access",
      "Priority bug fixes",
    ],
  },
  {
    name: "Enterprise",
    price: "$3,500",
    users: "Unlimited users",
    support: "12 months support included",
    highlight: false,
    features: [
      "Everything in Business",
      "White-label rights (rebrand freely)",
      "Custom integrations",
      "SSO / LDAP",
      "SLA guarantee",
      "Dedicated success manager",
    ],
  },
];

const TeevexaBase = () => (
  <>
    <SEO
      title="Teevexa Base | Self-Hosted Project Management Software"
      description="Teevexa Base is a self-hosted project management platform. Buy once, deploy on your servers, own it forever. No monthly fees, no data leaving your network."
      canonical="/teevexa-base"
    />

    {/* ── Hero ── */}
    <section className="relative min-h-[80vh] flex items-center justify-center gradient-hero network-bg overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/3 w-80 h-80 rounded-full bg-primary/8 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 rounded-full bg-accent/7 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      </div>
      <div className="container mx-auto px-4 text-center relative z-10 animate-fade-in max-w-4xl">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Teevexa Product</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
          Teevexa <span className="gradient-text">Base</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-4">
          Project management software your company buys once, deploys on its own servers, and owns completely — no monthly fees, no data leaving your network.
        </p>
        <p className="text-sm text-muted-foreground mb-10">
          Self-hosted perpetual license · Rename and rebrand freely · Support retainer optional
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

    {/* ── Ownership pitch ── */}
    <section className="section-teal py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <SectionHeading
          label="Why Self-Hosted"
          title="You Buy It. You Own It. Forever."
          description="Every SaaS PM tool is a subscription you pay forever for software you never own. Teevexa Base is different."
        />
        <div className="mt-12 grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: Server,
              title: "Your Servers",
              desc: "Deploy on your own VPS, on-premise servers, or private cloud. Your data never touches our infrastructure after delivery.",
            },
            {
              icon: Lock,
              title: "Your Data",
              desc: "Project data, client information, and team communications stay entirely within your network — no third-party storage.",
            },
            {
              icon: GitMerge,
              title: "No Lock-In",
              desc: "The license includes the full source. Rename it, rebrand it, customise it. You're not dependent on us staying in business.",
            },
          ].map((item) => (
            <div key={item.title} className="glass rounded-2xl p-7 group hover:border-primary/40 transition-all hover:-translate-y-1">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <item.icon className="text-primary group-hover:scale-110 transition-transform" size={22} />
              </div>
              <h3 className="font-display font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Features ── */}
    <section className="py-24 px-4">
      <div className="container mx-auto">
        <SectionHeading
          label="Features"
          title="Everything a Team Needs to Ship"
          description="From task tracking to client reporting — a complete project management platform with nothing missing."
        />
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 group hover:border-primary/40 transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="text-primary group-hover:scale-110 transition-transform" size={20} />
              </div>
              <h3 className="font-display font-semibold text-sm mb-1.5">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── How It Works ── */}
    <section className="section-card py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        <SectionHeading label="How It Works" title="From Purchase to Running in 24 Hours" description="A straightforward process — buy, deploy, and your team is managing projects within a day." />
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
        <SectionHeading label="Who Uses It" title="Built for Teams That Need Control" description="Any organisation where project data is sensitive or where SaaS subscriptions are impractical." />
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
      <div className="container mx-auto max-w-5xl">
        <SectionHeading
          label="Pricing"
          title="One Price. No Surprises."
          description="Pay once for a perpetual license. Keep the support retainer active for updates and priority fixes — or manage independently."
        />
        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.name} className={`glass rounded-2xl p-7 flex flex-col border-2 ${plan.highlight ? "border-primary glow-primary/10" : "border-border hover:border-primary/30 transition-colors"}`}>
              {plan.highlight && (
                <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Most Popular</span>
              )}
              <h4 className="font-display font-bold text-xl">{plan.name}</h4>
              <div className="mt-2 mb-1">
                <span className="text-4xl font-display font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground ml-1">one-time</span>
              </div>
              <p className="text-xs text-primary font-semibold mb-1">{plan.users}</p>
              <p className="text-xs text-muted-foreground mb-6">{plan.support} · then $150/month</p>
              <ul className="space-y-2.5 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCheck size={14} className="text-primary mt-0.5 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Button variant={plan.highlight ? "default" : "outline"} className={plan.highlight ? "glow-primary" : ""} asChild>
                <Link to="/book-consultation">Get a Quote <ArrowRight className="ml-2" size={14} /></Link>
              </Button>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          Prices in USD. Billing available in KES, NGN, GHS, ZAR. Support retainer covers updates, security patches, and priority bug fixes. Stopping the retainer does not affect your license — you keep what you have.
        </p>
      </div>
    </section>

    {/* ── vs SaaS Comparison ── */}
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-5xl">
        <SectionHeading
          label="Comparison"
          title="Teevexa Base vs SaaS PM Tools"
          description="The 3-year cost of a SaaS PM subscription almost always exceeds a perpetual license — and you still own nothing at the end."
        />
        <div className="mt-12 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 pr-6 font-semibold text-foreground">Consideration</th>
                <th className="py-3 px-4 text-center font-semibold text-primary">Teevexa Base</th>
                <th className="py-3 px-4 text-center text-muted-foreground font-medium">Asana / Monday / Jira Cloud</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {[
                ["3-year cost (50 users)", "~$2,100", "$5,400–$14,400+"],
                ["Data on your servers", true, false],
                ["No per-seat monthly fee", true, false],
                ["Rebrand & resell rights", true, false],
                ["Works offline / intranet", true, false],
                ["No vendor lock-in", true, false],
                ["Full source code access", true, false],
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
          <p className="text-xs text-muted-foreground mt-3 text-center">3-year SaaS cost estimated at Business tier pricing for 50 users as of 2024.</p>
        </div>
      </div>
    </section>

    {/* ── CTA ── */}
    <section className="section-navy py-24 px-4 network-bg">
      <div className="container mx-auto text-center max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
          Stop Renting. Start <span className="gradient-text">Owning.</span>
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-10">
          Book a demo and we'll walk you through Teevexa Base, help you choose the right license tier, and plan the deployment together.
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

export default TeevexaBase;
