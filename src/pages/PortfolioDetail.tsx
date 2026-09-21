import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CaseStudy {
  id: string; title: string; slug: string; client_name: string | null; industry: string | null; description: string;
  challenge: string | null; solution: string | null; results: string | null; technologies: string[] | null;
  cover_image_url: string | null; published_at: string | null;
}

const Block = ({ title, text }: { title: string; text: string | null }) =>
  text ? (
    <section className="mb-10">
      <h2 className="font-display font-bold text-2xl mb-3">{title}</h2>
      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{text}</p>
    </section>
  ) : null;

const PortfolioDetail = () => {
  const { slug } = useParams();
  const [item, setItem] = useState<CaseStudy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    supabase
      .from("case_studies")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
      .then(({ data }) => {
        setItem((data as CaseStudy | null) ?? null);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><p className="text-muted-foreground animate-pulse">Loading…</p></div>;

  if (!item) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <SEO title="Case study not found" description="This case study could not be found." noindex />
        <h1 className="font-display font-bold text-2xl">Case study not found</h1>
        <p className="text-muted-foreground text-sm">It may have been moved or unpublished.</p>
        <Button asChild variant="outline"><Link to="/portfolio"><ArrowLeft size={16} className="mr-1" /> All case studies</Link></Button>
      </div>
    );
  }

  return (
    <>
      <SEO title={item.title} description={item.description.slice(0, 155)} canonical={`/portfolio/${item.slug}`} ogImage={item.cover_image_url || undefined} />
      <section className="pt-28 pb-10  gradient-hero network-bg">
        <div className="container mx-auto">
          <Link to="/portfolio" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6"><ArrowLeft size={15} /> All case studies</Link>
          <div className="flex flex-wrap gap-1.5 mb-4">{item.industry && <Badge variant="outline">{item.industry}</Badge>}</div>
          <h1 className="font-display font-bold text-3xl md:text-5xl leading-tight mb-4">{item.title}</h1>
          {item.client_name && <p className="text-muted-foreground">Client: {item.client_name}</p>}
        </div>
      </section>
      <article className="py-12 px-4">
        <div className="container mx-auto">
          {item.cover_image_url && <img src={item.cover_image_url} alt={item.title} className="rounded-2xl w-full mb-10" />}
          <p className="text-lg text-muted-foreground leading-relaxed mb-10 whitespace-pre-line">{item.description}</p>
          <Block title="The challenge" text={item.challenge} />
          <Block title="Our solution" text={item.solution} />
          <Block title="Results" text={item.results} />
          {item.technologies && item.technologies.length > 0 && (
            <div className="mb-10 flex flex-wrap gap-1.5">{item.technologies.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}</div>
          )}
          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="font-display font-bold text-xl mb-2">Have something similar in mind?</h2>
            <p className="text-sm text-muted-foreground mb-5">Describe it and get a tailored quote within 24 hours.</p>
            <Button asChild className="glow-primary"><Link to="/start-project">Get a quote <ArrowRight className="ml-2" size={16} /></Link></Button>
          </div>
        </div>
      </article>
    </>
  );
};

export default PortfolioDetail;
