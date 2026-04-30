import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
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

const industries = [
  "Agriculture & Farming", "Food & Beverage", "Manufacturing", "Logistics & Supply Chain",
  "Export & Trade", "Pharmaceuticals", "Retail", "Other",
];

const TeevexaTrace = () => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", company: "", industry: "" });

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const submit = async () => {
    if (!form.full_name.trim() || !form.email.trim()) {
      toast({ title: "Name and email are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("waitlist_signups").insert({
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      company: form.company.trim() || null,
      industry: form.industry || null,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Something went wrong", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "You're on the list! 🎉", description: "We'll notify you when Teevexa Trace launches." });
    setShowForm(false);
    setForm({ full_name: "", email: "", company: "", industry: "" });
  };

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center gradient-hero network-bg overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-accent/10 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10 animate-fade-in">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            Coming Soon
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight max-w-5xl mx-auto">
            Teevexa <span className="gradient-text">Trace</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Blockchain-powered traceability platform bringing transparency, trust, and compliance to supply chains across Africa and beyond.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="glow-primary text-base px-8" onClick={() => setShowForm(true)}>
              Join the Waitlist <ArrowRight className="ml-2" size={18} />
            </Button>
            <Button variant="outline" size="lg" className="text-base px-8" asChild>
              <a href="#features">Explore Features</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
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
      <section id="features" className="py-24 px-4 bg-card/30">
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
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
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
      <section className="py-24 px-4 bg-card/30">
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
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-3xl text-center">
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
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
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
      <section className="py-24 px-4 bg-card/30">
        <div className="container mx-auto max-w-5xl">
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

      {/* Pricing */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <SectionHeading
            label="Pricing"
            title="Transparent, Scalable Pricing"
            description="Indicative tiers — final pricing confirmed at launch. No hidden fees."
          />
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Starter",
                price: "Free",
                period: "during beta",
                color: "border-border",
                badge: null,
                features: ["Up to 500 product scans/month", "1 supply chain template", "QR code generation", "Basic compliance dashboard", "Email support"],
              },
              {
                name: "Growth",
                price: "$149",
                period: "/ month",
                color: "border-primary",
                badge: "Most Popular",
                features: ["Up to 50,000 scans/month", "Unlimited supply chain templates", "IoT sensor integration", "EUDR & export report generation", "Offline mobile field app", "Priority support"],
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "contact us",
                color: "border-accent",
                badge: "For large organisations",
                features: ["Unlimited scans", "White-label deployment", "Custom blockchain network", "On-premise option", "Dedicated customer success manager", "SLA guarantee"],
              },
            ].map((tier) => (
              <div key={tier.name} className={`glass rounded-2xl p-6 border-2 ${tier.color} flex flex-col`}>
                {tier.badge && (
                  <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary mb-3">{tier.badge}</span>
                )}
                <h3 className="font-display font-bold text-xl">{tier.name}</h3>
                <div className="mt-2 mb-6">
                  <span className="text-3xl font-display font-bold">{tier.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">{tier.period}</span>
                </div>
                <ul className="space-y-2 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCheck size={14} className="text-primary mt-0.5 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`mt-6 w-full ${tier.color === "border-primary" ? "glow-primary" : ""}`}
                  variant={tier.color === "border-primary" ? "default" : "outline"}
                  onClick={() => setShowForm(true)}
                >
                  Join Waitlist
                </Button>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            Prices shown in USD. African local currency billing (NGN, KES, GHS, ZAR) available at launch.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-card/30 network-bg">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-display font-bold">
            Be the First to <span className="gradient-text">Trace</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Join the waitlist today and be among the first to access Teevexa Trace when we launch.
          </p>
          <Button size="lg" className="mt-8 glow-primary px-8" onClick={() => setShowForm(true)}>
            Join the Waitlist <ArrowRight className="ml-2" size={18} />
          </Button>
        </div>
      </section>

      {/* Waitlist Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="glass max-w-md">
          <DialogHeader>
            <DialogTitle>Join the Teevexa Trace Waitlist</DialogTitle>
            <DialogDescription>Be the first to know when we launch. No spam, ever.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Your company name" />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Select value={form.industry} onValueChange={(v) => set("industry", v)}>
                <SelectTrigger><SelectValue placeholder="Select your industry" /></SelectTrigger>
                <SelectContent>
                  {industries.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full glow-primary" onClick={submit} disabled={saving}>
              {saving ? "Submitting..." : "Join Waitlist"}
            </Button>
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
              <CheckCircle2 size={12} /> Your data is safe. We never share your information.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TeevexaTrace;
