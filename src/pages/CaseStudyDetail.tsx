import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Calendar, Building2, Layers, BarChart3, Target, Lightbulb, TrendingUp } from "lucide-react";
import SEO from "@/components/SEO";

interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  client_name: string | null;
  industry: string | null;
  description: string;
  challenge: string | null;
  solution: string | null;
  results: string | null;
  cover_image_url: string | null;
  gallery_urls: string[] | null;
  technologies: string[] | null;
  published_at: string | null;
}

const CaseStudyDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [study, setStudy] = useState<CaseStudy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("case_studies")
      .select("id, title, slug, client_name, industry, description, challenge, solution, results, cover_image_url, gallery_urls, technologies, published_at")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
      .then(({ data }) => {
        setStudy(data as CaseStudy | null);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading case study...</p>
      </div>
    );
  }

  if (!study) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
          <BarChart3 className="text-muted-foreground" size={32} />
        </div>
        <div>
          <h2 className="font-display font-bold text-xl mb-2">Case study not found</h2>
          <p className="text-muted-foreground text-sm">It may have been moved or unpublished.</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/portfolio"><ArrowLeft size={16} className="mr-2" /> Back to Portfolio</Link>
        </Button>
      </div>
    );
  }

  const sections = [
    study.challenge ? { icon: Target,    num: "01", label: "The Challenge",  text: study.challenge } : null,
    study.solution  ? { icon: Lightbulb, num: "02", label: "Our Solution",   text: study.solution  } : null,
    study.results   ? { icon: TrendingUp,num: "03", label: "The Results",    text: study.results   } : null,
  ].filter(Boolean) as { icon: typeof Target; num: string; label: string; text: string }[];

  return (
    <>
      <SEO
        title={`${study.title}${study.client_name ? ` — ${study.client_name}` : ""} | Case Study`}
        description={study.description}
        canonical={`/portfolio/${study.slug}`}
        ogImage={study.cover_image_url || undefined}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: study.title,
          description: study.description,
          image: study.cover_image_url || undefined,
          datePublished: study.published_at || undefined,
          author: { "@type": "Organization", name: "Teevexa" },
          publisher: { "@type": "Organization", name: "Teevexa", url: "https://teevexa.com" },
          url: `https://teevexa.com/portfolio/${study.slug}`,
        }}
      />
      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 px-4 gradient-hero network-bg overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-primary/8 blur-3xl animate-pulse-glow" />
        </div>
        <div className="container mx-auto max-w-4xl relative z-10 animate-fade-in">
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={15} /> Portfolio
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-5">
            {study.industry && (
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">{study.industry}</span>
            )}
            {study.published_at && (
              <span className="flex items-center text-xs text-muted-foreground gap-1">
                <Calendar size={12} />
                {new Date(study.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-5">
            {study.title}
          </h1>
          {study.client_name && (
            <p className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
              <Building2 size={15} className="text-primary" /> {study.client_name}
            </p>
          )}
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">{study.description}</p>
        </div>
      </section>

      {/* ── Cover Image ── */}
      {study.cover_image_url && (
        <section className="px-4 -mt-6">
          <div className="container mx-auto max-w-4xl">
            <div className="rounded-2xl overflow-hidden border border-border shadow-xl">
              <img
                src={study.cover_image_url}
                alt={study.title}
                className="w-full h-64 md:h-[440px] object-cover"
              />
            </div>
          </div>
        </section>
      )}

      {/* ── Challenge / Solution / Results ── */}
      {sections.length > 0 && (
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-4xl space-y-10">
            {sections.map(({ icon: Icon, num, label, text }) => (
              <div key={num} className="grid md:grid-cols-[auto_1fr] gap-6 md:gap-10">
                <div className="flex flex-col items-start gap-3">
                  <span className="text-[11px] font-bold tracking-[0.2em] text-primary/60">{num}</span>
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="text-primary" size={22} />
                  </div>
                </div>
                <div className="pt-1">
                  <h2 className="text-xl font-display font-bold mb-3">{label}</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-[15px]">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Technologies ── */}
      {study.technologies && study.technologies.length > 0 && (
        <section className="section-teal py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="flex flex-col sm:flex-row gap-6 sm:items-start">
              <div className="flex-shrink-0 flex items-center gap-2">
                <Layers size={18} className="text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Technologies</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {study.technologies.map((t) => (
                  <Badge key={t} variant="outline" className="text-sm px-3 py-1">{t}</Badge>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Gallery ── */}
      {study.gallery_urls && study.gallery_urls.length > 0 && (
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <h3 className="text-lg font-display font-bold mb-6">Project Gallery</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {study.gallery_urls.map((url, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-border shadow-sm">
                  <img
                    src={url}
                    alt={`${study.title} — screenshot ${i + 1}`}
                    className="w-full h-52 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="section-navy py-24 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-4xl font-display font-bold mb-4">
            Want <span className="gradient-text">Similar Results?</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-10">
            Let's discuss how we can build something exceptional for your business. Start with a free 30-minute consultation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="glow-primary px-10" asChild>
              <Link to="/start-project">Start a Project <ArrowRight className="ml-2" size={18} /></Link>
            </Button>
            <Button variant="outline" size="lg" className="px-8 bg-transparent text-foreground border-foreground/30 hover:bg-foreground/10 hover:border-foreground/50" asChild>
              <Link to="/portfolio"><ArrowLeft size={14} className="mr-1" /> More Case Studies</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default CaseStudyDetail;
