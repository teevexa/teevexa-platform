import { Link } from "react-router-dom";
import {
  ArrowRight, BarChart3, BookOpen, BrainCircuit, Github, GitPullRequest, Layers, MessageSquare, RefreshCcw, Smartphone, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import SectionHeading from "@/components/SectionHeading";
import { TEEDESK_REPO } from "@/lib/links";


const features = [
  { icon: MessageSquare, title: "Real-time chat", desc: "WebSocket-powered chat with typing indicators, voice input and output, and message feedback." },
  { icon: BrainCircuit, title: "AI NLP pipeline", desc: "Sentence-transformers intent classification, spaCy entity recognition and local LLM responses via Ollama." },
  { icon: BookOpen, title: "RAG knowledge base", desc: "Embed documents, retrieve the right context and generate grounded answers." },
  { icon: BarChart3, title: "Analytics dashboard", desc: "Live sentiment distribution, intent trends and escalation tracking." },
  { icon: Users, title: "Human handoff", desc: "Escalate conversations to live agents when the AI's confidence is low." },
  { icon: Layers, title: "Multi-tenancy", desc: "White-label SaaS architecture with tenant-scoped data." },
  { icon: Smartphone, title: "Multi-channel", desc: "Embeddable web widget and WhatsApp Business API today, with Telegram planned." },
  { icon: RefreshCcw, title: "Fine-tuning loop", desc: "Feedback-driven intent retraining via Celery." },
];

const TeeDesk = () => (
  <>
    <SEO route="/teedesk" />

    <section className="relative min-h-[70vh] flex items-center justify-center gradient-hero network-bg overflow-hidden">
      <div className="container mx-auto text-center relative z-10 animate-fade-in py-24">
        <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6 text-xs font-bold uppercase tracking-widest text-primary">Open source · by Teevexa</span>
        <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6"><span className="gradient-text">TeeDesk</span></h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
          An AI-powered customer support platform with a chat widget, admin dashboard and knowledge base — featuring automated ticket triage, sentiment analysis and WhatsApp integration.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="glow-primary px-8" asChild>
            <a href={TEEDESK_REPO} target="_blank" rel="noopener noreferrer"><Github className="mr-2" size={18} /> View on GitHub</a>
          </Button>
          <Button size="lg" variant="outline" className="px-8" asChild>
            <a href={`${TEEDESK_REPO}/issues`} target="_blank" rel="noopener noreferrer"><GitPullRequest className="mr-2" size={18} /> Contribute</a>
          </Button>
        </div>
      </div>
    </section>

    <section className="py-24">
      <div className="container mx-auto">
        <SectionHeading label="What's inside" title="A full-stack AI support platform" description="Everything you need to run AI-first support on your own infrastructure." />
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <SectionHeading label="Contribute" title="Built in the open — join in" description="TeeDesk is a community project. Star the repo, pick up an issue, fix a bug or add a channel." />
        <ol className="mt-10 text-left space-y-3 max-w-xl mx-auto text-sm text-muted-foreground list-decimal pl-5">
          <li>Fork the repository and clone it locally.</li>
          <li>Browse open issues, or open one to discuss an idea.</li>
          <li>Create a branch, make your change and add tests where you can.</li>
          <li>Open a pull request — we review every one.</li>
        </ol>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button className="glow-primary" asChild><a href={TEEDESK_REPO} target="_blank" rel="noopener noreferrer"><Github className="mr-2" size={16} /> teevexa/teedesk</a></Button>
          <Button variant="outline" asChild><Link to="/open-source">More open-source projects <ArrowRight className="ml-2" size={16} /></Link></Button>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">Want help deploying or customising TeeDesk for your business? <Link to="/contact" className="text-primary hover:underline">Talk to the Teevexa team</Link>.</p>
      </div>
    </section>
  </>
);

export default TeeDesk;
