import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/SectionHeading";
import SEO from "@/components/SEO";
import {
  QrCode, MapPin, Camera, Wifi, WifiOff, Smartphone,
  ClipboardList, History, GitCommitHorizontal, ArrowRight,
  CheckCircle2, Layers, Leaf, Factory, Truck, Package,
  Users, ScanLine, ShieldCheck, RefreshCw, CheckCheck,
} from "lucide-react";

const features = [
  {
    icon: ScanLine,
    title: "QR & Barcode Scanning",
    desc: "Scan any product, batch, or location code in under a second. Supports QR, Code128, EAN, and all common barcode formats.",
  },
  {
    icon: ClipboardList,
    title: "Event Logging",
    desc: "Record supply chain events — harvest, processing, packaging, shipping, receiving — with structured forms designed for field workers.",
  },
  {
    icon: QrCode,
    title: "QR Code Generation",
    desc: "Generate and print QR codes for new products or batches directly from the app. Assign codes in the field without going back to the office.",
  },
  {
    icon: GitCommitHorizontal,
    title: "Journey Viewer",
    desc: "See the complete traceability trail of any product by scanning it. Every step, every custodian, every timestamp — on one screen.",
  },
  {
    icon: MapPin,
    title: "GPS Location Tagging",
    desc: "Every event is automatically tagged with GPS coordinates. No manual entry — the app captures location silently in the background.",
  },
  {
    icon: Camera,
    title: "Photo Evidence",
    desc: "Attach photos directly to events as proof. Damaged goods, quality inspections, packaging conditions — documented with a tap.",
  },
  {
    icon: History,
    title: "Event History",
    desc: "Access your team's full event history. Filter by date, location, or event type — everything your field team recorded is searchable.",
  },
  {
    icon: WifiOff,
    title: "Offline-First",
    desc: "Works completely without internet. Events are stored locally and sync to Teevexa Trace automatically when connectivity is restored.",
  },
];

const workflow = [
  {
    icon: Leaf,
    actor: "Farmer / Harvester",
    event: "Harvest",
    desc: "Opens the app in the field, logs the harvest event — crop type, quantity, GPS location, photo — with or without internet.",
  },
  {
    icon: Factory,
    actor: "Processing Plant",
    event: "Processing",
    desc: "Scans the incoming batch QR code, records processing steps, quality checks, and outputs a new QR for the processed product.",
  },
  {
    icon: ShieldCheck,
    actor: "Quality Inspector",
    event: "Inspection",
    desc: "Scans the product, attaches inspection photos, signs off digitally. Fail events trigger alerts on the Teevexa Trace dashboard.",
  },
  {
    icon: Truck,
    actor: "Logistics / Driver",
    event: "Shipment",
    desc: "Logs departure, GPS location, temperature reading. Logs arrival at destination. Every handoff is recorded.",
  },
  {
    icon: Package,
    actor: "Warehouse / Retailer",
    event: "Receiving",
    desc: "Scans the delivery, confirms receipt, and the complete journey is now on the blockchain — ready for consumer QR verification.",
  },
];

const TeevexaField = () => (
  <>
    <SEO
      title="Teevexa Field | Mobile App for Supply Chain Field Agents"
      description="Teevexa Field is the offline-first mobile app for field agents in the Teevexa Trace ecosystem. Scan, log, and track supply chain events from anywhere."
      canonical="/teevexa-field"
    />

    {/* ── Hero ── */}
    <section className="relative min-h-[80vh] flex items-center justify-center gradient-hero network-bg overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-primary/8 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full bg-accent/7 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      </div>
      <div className="container mx-auto px-4 text-center relative z-10 animate-fade-in max-w-4xl">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Teevexa Product</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
          Teevexa <span className="gradient-text">Field</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-4">
          The offline-first mobile app that puts supply chain traceability in the hands of every field agent — whether they have internet or not.
        </p>
        <p className="text-sm text-muted-foreground mb-10">
          Part of the <Link to="/teevexa-trace" className="text-primary hover:underline font-medium">Teevexa Trace</Link> ecosystem ·
          iOS & Android · Works in remote areas with zero connectivity
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="glow-primary text-base px-8" asChild>
            <Link to="/teevexa-trace">See Teevexa Trace Plans <ArrowRight className="ml-2" size={18} /></Link>
          </Button>
          <Button variant="outline" size="lg" className="text-base px-8" asChild>
            <Link to="/book-consultation">Book a Demo</Link>
          </Button>
        </div>
      </div>
    </section>

    {/* ── Ecosystem callout ── */}
    <section className="section-teal py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="glass rounded-2xl p-8 md:p-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
              <Layers className="text-primary" size={28} />
            </div>
            <div className="flex-1">
              <h2 className="font-display font-bold text-xl mb-2">
                Teevexa Field is the field arm of Teevexa Trace
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Teevexa Trace is the platform — the dashboard, the blockchain anchoring, the certificates, the APIs. Teevexa Field is what your supply chain workers carry in their pocket. Together they close the loop: events recorded in the field appear on the Trace dashboard in real time (or when connectivity returns). Every Teevexa Trace plan includes the Field app for all your team members.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild className="shrink-0">
              <Link to="/teevexa-trace">View Teevexa Trace <ArrowRight className="ml-1.5" size={14} /></Link>
            </Button>
          </div>
        </div>
      </div>
    </section>

    {/* ── Offline-first emphasis ── */}
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-5xl">
        <SectionHeading
          label="Built for Africa"
          title="Works Everywhere. Even Where There's No Signal."
          description="Most supply chain apps assume reliable internet. African supply chains don't have that luxury."
        />
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-8 border-2 border-destructive/20 hover:border-destructive/40 transition-all">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <WifiOff className="text-destructive" size={20} />
              </div>
              <h3 className="font-display font-semibold">The Problem with Other Apps</h3>
            </div>
            <ul className="space-y-3">
              {[
                "Require constant internet — fail in rural farms and remote areas",
                "Data loss when connection drops mid-recording",
                "No caching — starting the app needs network access",
                "Designed for Western last-mile logistics, not African first-mile collection",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-destructive mt-1 shrink-0">✕</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-2xl p-8 border-2 border-primary/30 hover:border-primary/50 transition-all">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wifi className="text-primary" size={20} />
              </div>
              <h3 className="font-display font-semibold">How Teevexa Field Works</h3>
            </div>
            <ul className="space-y-3">
              {[
                "All data stored locally first — internet is never required to log an event",
                "Automatic background sync when connectivity is detected",
                "Works in offline mode indefinitely — no data loss, no failed submissions",
                "Designed with rural African supply chains in mind from the first line of code",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>

    {/* ── Features ── */}
    <section className="section-card py-24 px-4">
      <div className="container mx-auto">
        <SectionHeading
          label="Features"
          title="Everything a Field Agent Needs"
          description="Scan, log, generate, and verify — all in one app, all without needing to be online."
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

    {/* ── Supply chain workflow ── */}
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        <SectionHeading
          label="The Field Workflow"
          title="Every Actor. Every Handoff. Recorded."
          description="Teevexa Field gives every player in your supply chain a structured way to record their step — and prove they did it."
        />
        <div className="mt-12 relative">
          <div className="absolute left-6 top-8 bottom-8 w-px bg-border/60 hidden md:block" />
          <div className="space-y-5">
            {workflow.map((step, i) => (
              <div key={step.event} className="flex gap-5 items-start glass rounded-2xl p-6 hover:border-primary/30 transition-colors relative">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 z-10">
                  <step.icon className="text-primary" size={22} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">{step.event}</span>
                    <span className="text-xs text-muted-foreground">{step.actor}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
                {i < workflow.length - 1 && (
                  <RefreshCw size={12} className="text-border absolute -bottom-3 left-6 bg-background rounded-full p-0.5 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          The complete journey is anchored to the blockchain and surfaced on the Teevexa Trace dashboard — ready for audit, certification, or consumer QR verification.
        </p>
      </div>
    </section>

    {/* ── Platform compatibility ── */}
    <section className="section-card py-20 px-4">
      <div className="container mx-auto max-w-3xl text-center">
        <SectionHeading
          label="Platforms"
          title="iOS and Android"
          description="A single cross-platform codebase delivering native performance on both platforms."
        />
        <div className="mt-10 grid sm:grid-cols-3 gap-5">
          {[
            { icon: Smartphone, title: "iOS", desc: "iPhone and iPad. Minimum iOS 13. Available on the App Store." },
            { icon: Smartphone, title: "Android", desc: "Android 8.0+. Available on Google Play and direct APK." },
            { icon: Users, title: "Team Management", desc: "Manage field agent accounts and permissions from the Teevexa Trace dashboard." },
          ].map((item) => (
            <div key={item.title} className="glass rounded-2xl p-6 group hover:border-primary/40 transition-all hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <item.icon className="text-primary" size={20} />
              </div>
              <h3 className="font-display font-semibold mb-2">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── What's included with Trace ── */}
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        <SectionHeading
          label="Included in Teevexa Trace"
          title="No Separate App Pricing"
          description="Teevexa Field is included in every Teevexa Trace plan. You pay for Trace; your entire field team gets the app."
        />
        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          {[
            "Unlimited field agent accounts on Growth and Enterprise plans",
            "Real-time sync between Field app and Trace dashboard",
            "All events logged in Field appear instantly in your audit trail",
            "Field-generated QR codes integrate with Trace verification flow",
            "Admin controls: activate, deactivate, or reassign field agents from the dashboard",
            "Audit log of every event by every agent, timestamped and GPS-tagged",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3 glass rounded-xl p-4 hover:border-primary/30 transition-colors">
              <CheckCheck size={15} className="text-primary mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── CTA ── */}
    <section className="section-navy py-24 px-4 network-bg">
      <div className="container mx-auto text-center max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
          Put Traceability in Every <span className="gradient-text">Field Agent's Pocket</span>
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-10">
          Teevexa Field is ready to deploy. Join the Teevexa Trace waitlist to get access — or book a demo to see the full ecosystem in action.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="glow-primary px-10 text-base" asChild>
            <Link to="/teevexa-trace">Join Teevexa Trace Waitlist <ArrowRight className="ml-2" size={18} /></Link>
          </Button>
          <Button variant="outline" size="lg" className="px-10 text-base bg-transparent text-foreground border-foreground/30 hover:bg-foreground/10" asChild>
            <Link to="/book-consultation">Book a Demo</Link>
          </Button>
        </div>
      </div>
    </section>
  </>
);

export default TeevexaField;
