import { Link } from "react-router-dom";
import { ArrowRight, Github, MessageSquare, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import SectionHeading from "@/components/SectionHeading";
import { TEEDESK_REPO, CYBERGUARD_REPO } from "@/lib/links";

const projects = [
  {
    icon: MessageSquare,
    name: "TeeDesk",
    tagline: "AI-powered customer support platform",
    desc: "Chat widget, admin dashboard and knowledge base with automated ticket triage, sentiment analysis, human handoff and WhatsApp integration. Runs local LLMs via Ollama.",
    tags: ["Python", "WebSockets", "RAG", "Ollama", "WhatsApp"],
    repo: TEEDESK_REPO,
    page: "/teedesk",
  },
  {
    icon: ShieldAlert,
    name: "CyberGuard AI",
    tagline: "AI-enhanced cybersecurity threat detector",
    desc: "A lightweight threat-detection dashboard for teams too small for an enterprise SIEM: ingest network traffic, score it for anomalies with a real trained ML model, get alerted over Slack, email or webhook, and get plain-language triage help from a locally-run AI assistant — no third-party API spend.",
    tags: ["Python", "Machine learning", "Security", "Apache 2.0"],
    repo: CYBERGUARD_REPO,
    page: "/cyberguard-ai",
  },
];

const OpenSource = () => (
  <>
    <SEO
      title="Open Source | TeeDesk & CyberGuard AI | Teevexa"
      description="Open-source projects by Teevexa Ltd that developers can use and contribute to: TeeDesk (AI customer support) and CyberGuard AI (threat detection)."
      canonical="/open-source"
    />
    <section className="py-28  gradient-hero network-bg">
      <div className="container mx-auto text-center animate-fade-in">
        <SectionHeading label="Open source" title="Built in the open" description="We build in public and give back. Use these projects, learn from them, and help make them better." />
      </div>
    </section>

    <section className="py-16">
      <div className="container mx-auto grid md:grid-cols-2 gap-6">
        {projects.map((p) => (
          <div key={p.name} className="glass rounded-2xl p-8 flex flex-col gap-5 hover:border-primary/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><p.icon className="text-primary" size={24} /></div>
            <div>
              <h2 className="font-display font-bold text-2xl">{p.name}</h2>
              <p className="text-sm text-primary font-medium mt-0.5">{p.tagline}</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed flex-1">{p.desc}</p>
            <div className="flex flex-wrap gap-1.5">{p.tags.map((t) => <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>)}</div>
            <div className="flex flex-wrap gap-3 pt-2 border-t border-border/30">
              <Button size="sm" className="glow-primary" asChild><a href={p.repo} target="_blank" rel="noopener noreferrer"><Github className="mr-2" size={14} /> GitHub</a></Button>
              {p.page && <Button size="sm" variant="outline" asChild><Link to={p.page}>Learn more <ArrowRight className="ml-2" size={14} /></Link></Button>}
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground mt-12">
        Need help deploying or customising one of these for your business? <Link to="/contact" className="text-primary hover:underline">Talk to the Teevexa team</Link>.
      </p>
    </section>
  </>
);

export default OpenSource;
