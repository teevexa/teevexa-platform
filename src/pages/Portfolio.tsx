import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Github, MessageSquare, QrCode, ShieldAlert, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import SectionHeading from "@/components/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CYBERGUARD_REPO, FIELD_PLAY_URL, TEEDESK_REPO, TRACE_PLAY_URL } from "@/lib/links";

interface CaseStudy {
  id: string; title: string; slug: string; client_name: string | null; industry: string | null;
  description: string; technologies: string[] | null; cover_image_url: string | null;
}

interface OwnProduct {
  icon: typeof QrCode;
  name: string;
  kind: string;
  desc: string;
  tags: string[];
  page: string;
  action: { label: string; href: string };
}

// Products Teevexa built and ships itself (kept separate from client case studies on purpose).
const ownProducts: OwnProduct[] = [
  {
    icon: QrCode,
    name: "Teevexa Trace",
    kind: "Mobile app · Google Play",
    desc: "Supply chain traceability for producers, exporters and buyers: batch tracking, QR verification, certificates and compliance reports.",
    tags: ["Supply chain", "QR verification", "Blockchain anchoring"],
    page: "/teevexa-trace",
    action: { label: "Get it on Google Play", href: TRACE_PLAY_URL },
  },
  {
    icon: Smartphone,
    name: "Teevexa Field",
    kind: "Mobile app · Google Play",
    desc: "The offline-first companion for field agents: log events, scan QR codes, and capture GPS and photo evidence with no internet connection.",
    tags: ["Offline-first", "GPS & photos", "Sync"],
    page: "/teevexa-field",
    action: { label: "Get it on Google Play", href: FIELD_PLAY_URL },
  },
  {
    icon: MessageSquare,
    name: "TeeDesk",
    kind: "Open source",
    desc: "AI-powered customer support platform with a chat widget, admin dashboard, knowledge base, ticket triage, sentiment analysis and WhatsApp integration.",
    tags: ["Python", "RAG", "Ollama", "WhatsApp"],
    page: "/teedesk",
    action: { label: "View on GitHub", href: TEEDESK_REPO },
  },
  {
    icon: ShieldAlert,
    name: "CyberGuard AI",
    kind: "Open source",
    desc: "AI-enhanced threat detection for teams too small for an enterprise SIEM: ML anomaly scoring, Slack/email/webhook alerts and a local AI triage assistant.",
    tags: ["Python", "Machine learning", "Security"],
    page: "/cyberguard-ai",
    action: { label: "View on GitHub", href: CYBERGUARD_REPO },
  },
];

const Portfolio = () => {
  const [items, setItems] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    supabase
      .from("case_studies")
      .select("id, title, slug, client_name, industry, description, technologies, cover_image_url")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setFailed(true);
        setItems((data as CaseStudy[]) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <SEO
        title="Our Work | Case Studies | Teevexa"
        description="Products Teevexa has built and shipped: Teevexa Trace and Field on Google Play, plus the open-source TeeDesk and CyberGuard AI, alongside client case studies."
        canonical="/portfolio"
      />
      <section className="relative py-28  gradient-hero network-bg">
        <div className="container mx-auto text-center animate-fade-in">
          <SectionHeading label="Our work" title="Software we've built and shipped" description="Products we designed, built and run ourselves, and the client projects we've delivered." />
        </div>
      </section>

      {/* Our own products */}
      <section className="py-16">
        <div className="container mx-auto">
          <h2 className="font-display font-bold text-2xl mb-2">Products we&apos;ve built</h2>
          <p className="text-muted-foreground text-sm mb-8">Designed, engineered and shipped by the Teevexa team — the best proof of how we work.</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {ownProducts.map((p) => (
              <div key={p.name} className="glass rounded-2xl p-7 flex flex-col gap-4 hover:border-primary/40 transition-all duration-300">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><p.icon className="text-primary" size={24} /></div>
                  <Badge variant="outline">{p.kind}</Badge>
                </div>
                <h3 className="font-display font-bold text-xl">{p.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{p.desc}</p>
                <div className="flex flex-wrap gap-1.5">{p.tags.map((t) => <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>)}</div>
                <div className="flex flex-wrap gap-3 pt-3 border-t border-border/30">
                  <Button size="sm" className="glow-primary" asChild>
                    <a href={p.action.href} target="_blank" rel="noopener noreferrer">
                      {p.action.href.includes("github") && <Github className="mr-2" size={14} />}{p.action.label}
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" asChild><Link to={p.page}>Learn more <ArrowRight className="ml-2" size={14} /></Link></Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client work (from the CMS); hidden until at least one case study is published */}
      {!loading && items.length > 0 && (
        <section className="pb-16">
          <div className="container mx-auto">
            <h2 className="font-display font-bold text-2xl mb-8">Client case studies</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((c) => (
                <Link key={c.id} to={`/portfolio/${c.slug}`} className="glass rounded-2xl overflow-hidden group hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  {c.cover_image_url ? (
                    <img src={c.cover_image_url} alt={c.title} loading="lazy" className="h-44 w-full object-cover" />
                  ) : <div className="h-44 bg-primary/10" aria-hidden="true" />}
                  <div className="p-6 flex flex-col gap-3 flex-1">
                    <div className="flex flex-wrap gap-1.5">{c.industry && <Badge variant="outline">{c.industry}</Badge>}</div>
                    <h3 className="font-display font-bold text-lg">{c.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{c.description}</p>
                    <span className="inline-flex items-center text-sm font-semibold text-primary gap-1 group-hover:gap-2 transition-all">Read case study <ArrowRight size={14} /></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16  section-card">
        <div className="container mx-auto text-center">
          <h2 className="font-display font-bold text-2xl mb-2">Want something like this built for you?</h2>
          <p className="text-muted-foreground text-sm mb-6">Tell us about your project and get a tailored quote by email within 24 hours.</p>
          <Button asChild size="lg" className="glow-primary"><Link to="/start-project">Get a Quote <ArrowRight className="ml-2" size={16} /></Link></Button>
        </div>
      </section>
    </>
  );
};

export default Portfolio;
