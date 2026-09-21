import { Link } from "react-router-dom";
import { Activity, ArrowRight, BellRing, BrainCircuit, Github, GitPullRequest, Network, ShieldAlert, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import SectionHeading from "@/components/SectionHeading";
import { CYBERGUARD_REPO } from "@/lib/links";

const features = [
  { icon: Network, title: "Ingest network traffic", desc: "Bring in network flow data from the environments you already run — no enterprise SIEM required." },
  { icon: Activity, title: "Real anomaly scoring", desc: "Every event is scored by a genuinely trained machine-learning model, not a pile of static rules." },
  { icon: BellRing, title: "Alerts where you work", desc: "Get notified over Slack, email or webhook the moment something looks wrong." },
  { icon: BrainCircuit, title: "Plain-language triage", desc: "A locally-run AI assistant explains what happened and what to check next, in words a small team can act on." },
  { icon: WalletCards, title: "No third-party API spend", desc: "The model and the assistant run on your own hardware, so there are no per-query fees and your data stays with you." },
  { icon: ShieldAlert, title: "Built for small teams", desc: "A lightweight threat-detection dashboard for teams too small for an enterprise SIEM." },
];

const CyberGuardAI = () => (
  <>
    <SEO
      title="CyberGuard AI | Open-Source AI Threat Detection | Teevexa"
      description="CyberGuard AI is an open-source, AI-enhanced cybersecurity threat detector: ingest network traffic, score anomalies with a trained ML model, alert over Slack, email or webhook, and get plain-language triage from a local AI assistant."
      canonical="/cyberguard-ai"
    />

    <section className="relative min-h-[70vh] flex items-center justify-center gradient-hero network-bg overflow-hidden">
      <div className="container mx-auto text-center relative z-10 animate-fade-in py-24">
        <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6 text-xs font-bold uppercase tracking-widest text-primary">Open source · Apache 2.0 · by Teevexa</span>
        <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6"><span className="gradient-text">CyberGuard AI</span></h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
          AI-enhanced cybersecurity threat detection for teams too small for an enterprise SIEM. Ingest network traffic, score it for anomalies with a real trained ML model, get alerted, and get plain-language triage help from a locally-run AI assistant.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="glow-primary px-8" asChild>
            <a href={CYBERGUARD_REPO} target="_blank" rel="noopener noreferrer"><Github className="mr-2" size={18} /> View on GitHub</a>
          </Button>
          <Button size="lg" variant="outline" className="px-8" asChild>
            <a href={`${CYBERGUARD_REPO}/issues`} target="_blank" rel="noopener noreferrer"><GitPullRequest className="mr-2" size={18} /> Contribute</a>
          </Button>
        </div>
      </div>
    </section>

    <section className="py-24">
      <div className="container mx-auto">
        <SectionHeading label="What's inside" title="Threat detection without the enterprise price tag" description="A lightweight, self-hosted dashboard that a small team can actually run." />
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4"><f.icon className="text-primary" size={22} /></div>
              <h3 className="font-display font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="section-card py-24">
      <div className="container mx-auto text-center">
        <SectionHeading label="Contribute" title="Built in the open — join in" description="CyberGuard AI is licensed under Apache 2.0. Star the repo, pick up an issue, improve the model or add an alert channel." />
        <ol className="mt-10 text-left space-y-3 max-w-xl mx-auto text-sm text-muted-foreground list-decimal pl-5">
          <li>Fork the repository and clone it locally.</li>
          <li>Browse open issues, or open one to discuss an idea.</li>
          <li>Create a branch, make your change and add tests where you can.</li>
          <li>Open a pull request — we review every one.</li>
        </ol>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button className="glow-primary" asChild><a href={CYBERGUARD_REPO} target="_blank" rel="noopener noreferrer"><Github className="mr-2" size={16} /> teevexa/cyberguard-ai</a></Button>
          <Button variant="outline" asChild><Link to="/open-source">More open-source projects <ArrowRight className="ml-2" size={16} /></Link></Button>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">Want help deploying or customising CyberGuard AI for your organisation? <Link to="/contact" className="text-primary hover:underline">Talk to the Teevexa team</Link>.</p>
      </div>
    </section>
  </>
);

export default CyberGuardAI;
