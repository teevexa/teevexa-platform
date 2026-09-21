import { Link } from "react-router-dom";
import PlayStoreButton from "@/components/PlayStoreButton";
import { TRACE_PLAY_URL } from "@/lib/links";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/SectionHeading";
import {
  QrCode, MapPin, BarChart3, Shield, Leaf, Eye, Lock,
  ArrowRight, CheckCircle2, Layers, Globe, Smartphone, Zap,
  CheckCheck, X, Bitcoin, Database, Workflow, TrendingUp
} from "lucide-react";

const features = [
  { icon: QrCode, title: "QR Verification", desc: "Scan any product to verify its origin, journey, and authenticity in seconds." },
  { icon: MapPin, title: "Farm-to-Export Tracking", desc: "Full supply chain visibility from farm gate to international markets." },
  { icon: BarChart3, title: "Sustainability Scoring", desc: "Automated ESG metrics and carbon footprint tracking for every product." },
  { icon: Shield, title: "Tamper-Proof Records", desc: "Blockchain-backed immutable audit trail no one can alter." },
  { icon: Eye, title: "Real-Time Monitoring", desc: "Live dashboards for temperature, humidity, and location tracking." },
  { icon: Lock, title: "Compliance Ready", desc: "Built-in support for EU Deforestation Regulation, EUDR, and ISO standards." },
];

const useCases = [
  { icon: Leaf, title: "Agriculture", desc: "Track crops from planting to retail shelves with full traceability." },
  { icon: Globe, title: "Export & Trade", desc: "Digital certificates of origin and automated customs documentation." },
  { icon: Layers, title: "Manufacturing", desc: "Component-level tracking for quality assurance and recalls." },
  { icon: Smartphone, title: "Consumer Trust", desc: "Let your customers scan and verify product authenticity." },
];


const TeevexaTrace = () => {
  return (
    <>
      <SEO
        title="Teevexa Trace | Supply Chain Provenance Platform"
        description="Teevexa Trace is a supply chain provenance platform, now on Google Play, that lets businesses track, verify, and certify their products from source to shelf."
        canonical="/teevexa-trace"
      />
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center gradient-hero network-bg overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/8 blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-accent/7 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        </div>
        <div className="container mx-auto text-center relative z-10 animate-fade-in">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            Now live on Google Play
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight max-w-5xl mx-auto">
            Teevexa <span className="gradient-text">Trace</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Blockchain-powered traceability platform bringing transparency, trust, and compliance to supply chains across Africa and beyond.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <PlayStoreButton href={TRACE_PLAY_URL} app="Teevexa Trace" />
            <Button variant="outline" size="lg" className="text-base px-8" asChild>
              <a href="#features">Explore Features</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="section-teal py-24">
        <div className="container mx-auto text-center">
          <SectionHeading label="The Problem" title="Supply Chains Lack Transparency" />
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {[
              { stat: "65%", label: "of consumers don't trust product origin claims" },
              { stat: "$1.8T", label: "lost annually to counterfeit goods globally" },
              { stat: "30%", label: "of African agricultural exports face compliance rejection" },
            ].map((s) => (
              <div key={s.stat} className="glass rounded-2xl p-6 text-center">
                <p className="text-3xl font-display font-bold gradient-text">{s.stat}</p>
                <p className="text-sm text-muted-foreground mt-2">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24  section-card">
        <div className="container mx-auto">
          <SectionHeading label="Features" title="Everything You Need for Full Traceability" description="Built for enterprises and smallholders alike." />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="glass rounded-2xl p-6 group hover:border-primary/40 transition-all duration-300 hover:-translate-y-1">
                <f.icon className="text-primary mb-4 group-hover:scale-110 transition-transform" size={32} />
                <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="container mx-auto">
          <SectionHeading label="How It Works" title="Simple. Powerful. Transparent." />
          <div className="mt-12 space-y-8">
            {[
              { step: "01", title: "Register Your Products", desc: "Onboard your supply chain data — farms, facilities, processes, and certifications." },
              { step: "02", title: "Track Every Step", desc: "Each handoff, transformation, and movement is recorded on the blockchain." },
              { step: "03", title: "Verify Instantly", desc: "Consumers, regulators, and partners scan a QR code to see the full journey." },
              { step: "04", title: "Report & Comply", desc: "Generate compliance reports for EUDR, organic certifications, and fair trade standards." },
            ].map((s) => (
              <div key={s.step} className="flex gap-6 items-start glass rounded-2xl p-6">
                <span className="text-3xl font-display font-bold gradient-text shrink-0">{s.step}</span>
                <div>
                  <h3 className="font-display font-semibold text-lg">{s.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24  section-card">
        <div className="container mx-auto">
          <SectionHeading label="Use Cases" title="Built for Multiple Industries" />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((u) => (
              <div key={u.title} className="glass rounded-2xl p-6 text-center group hover:border-primary/40 transition-all duration-300 hover:-translate-y-1">
                <u.icon className="mx-auto text-primary mb-3 group-hover:scale-110 transition-transform" size={32} />
                <h3 className="font-display font-semibold">{u.title}</h3>
                <p className="text-xs text-muted-foreground mt-2">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-24">
        <div className="container mx-auto text-center">
          <SectionHeading label="Technology" title="Enterprise-Grade Infrastructure" />
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Shield, label: "Blockchain" },
              { icon: Zap, label: "IoT Sensors" },
              { icon: Globe, label: "Cloud-Native" },
              { icon: Smartphone, label: "Mobile-First" },
            ].map((t) => (
              <div key={t.label} className="glass rounded-2xl p-4 text-center">
                <t.icon className="mx-auto text-primary mb-2" size={24} />
                <p className="text-sm font-medium">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Blockchain */}
      <section className="py-24">
        <div className="container mx-auto">
          <SectionHeading
            label="The Technology"
            title="Why Blockchain?"
            description="Not every problem needs a blockchain — but supply chain trust is exactly the problem it was built to solve."
          />
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { icon: Database, title: "Immutable Ledger", desc: "Once a record is written, it cannot be altered or deleted — by anyone, including us. Every handoff, test result, and certification is permanent." },
              { icon: Workflow, title: "Decentralised Verification", desc: "No single party controls the truth. Farmers, exporters, regulators, and consumers all read from the same tamper-proof source." },
              { icon: TrendingUp, title: "Polygon Network", desc: "We run on Polygon (an Ethereum L2), chosen for its low transaction cost, speed, and proven enterprise adoption in supply chain and ESG reporting." },
            ].map((item) => (
              <div key={item.title} className="glass rounded-2xl p-6 group hover:border-primary/40 transition-all duration-300">
                <item.icon className="text-primary mb-4" size={28} />
                <h3 className="font-display font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitive Differentiation */}
      <section className="py-24  section-card">
        <div className="container mx-auto">
          <SectionHeading
            label="Why Teevexa Trace"
            title="Built for Africa, Ready for the World"
            description="Most traceability platforms are designed for Western markets and bolt on Africa as an afterthought. We started in Africa."
          />
          <div className="mt-12 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 pr-6 font-semibold text-foreground">Feature</th>
                  <th className="py-3 px-4 text-center font-semibold text-primary">Teevexa Trace</th>
                  <th className="py-3 px-4 text-center text-muted-foreground font-medium">Generic Platforms</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {[
                  ["Offline-first mobile for field agents", true, false],
                  ["African payment & compliance integration", true, false],
                  ["EUDR & African export certification support", true, "partial"],
                  ["Multi-language UI (Swahili, French, Arabic, English)", true, false],
                  ["QR scan with no app required (web-based)", true, "partial"],
                  ["Farmer-level onboarding with feature phones", true, false],
                  ["Blockchain-backed immutable audit trail", true, true],
                  ["Real-time IoT sensor integration", true, true],
                  ["White-label enterprise deployment", true, true],
                ].map(([feature, us, them]) => (
                  <tr key={String(feature)} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 pr-6 text-muted-foreground">{feature}</td>
                    <td className="py-3 px-4 text-center">
                      <CheckCheck size={16} className="mx-auto text-green-400" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      {them === true
                        ? <CheckCheck size={16} className="mx-auto text-green-400/50" />
                        : them === "partial"
                        ? <span className="text-yellow-500 text-xs font-medium">Partial</span>
                        : <X size={16} className="mx-auto text-destructive/60" />
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Free while we launch */}
      <section className="py-24">
        <div className="container mx-auto text-center">
          <SectionHeading
            label="Pricing"
            title="Free While We Launch"
            description="Teevexa Trace and Teevexa Field are free to use today. Download them and start tracing — no credit card, no trial clock."
          />
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <PlayStoreButton href={TRACE_PLAY_URL} app="Teevexa Trace" />
            <Button variant="outline" size="lg" className="text-base px-8" asChild>
              <Link to="/pricing">Pricing details <ArrowRight className="ml-2" size={18} /></Link>
            </Button>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">Need an API, white-label or on-premise setup? <Link to="/contact" className="text-primary hover:underline">Talk to us</Link>.</p>
        </div>
      </section>

      {/* Developer & Verify tools */}
      <section className="section-card py-16">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-7 hover:border-primary/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <QrCode className="text-primary" size={20} />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">Verify a Product</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                Have a batch ID or QR code? Enter it to view the complete supply chain journey, GPS events, and blockchain-anchored provenance record.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/verify">Open Verifier <ArrowRight className="ml-2" size={14} /></Link>
              </Button>
            </div>
            <div className="glass rounded-2xl p-7 hover:border-primary/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="text-primary" size={20} />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">Developer API</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                Integrate Teevexa Trace into your existing systems. REST API with endpoints for batch creation, event logging, and provenance queries.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/api-docs">View API Docs <ArrowRight className="ml-2" size={14} /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-navy py-24  network-bg">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold">
            Start Tracing <span className="gradient-text">Today</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Download Teevexa Trace, and pair it with Teevexa Field for your field agents.
          </p>
          <div className="mt-8 flex justify-center"><PlayStoreButton href={TRACE_PLAY_URL} app="Teevexa Trace" /></div>
        </div>
      </section>

    </>
  );
};

export default TeevexaTrace;
