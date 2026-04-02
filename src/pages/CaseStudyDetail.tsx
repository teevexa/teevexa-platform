import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Calendar, Building2, Layers, BarChart3 } from "lucide-react";

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
        <p className="text-muted-foreground">Loading case study...</p>
      </div>
    );
  }

  if (!study) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <BarChart3 className="text-muted-foreground" size={48} />
        <p className="text-muted-foreground">Case study not found.</p>
        <Button variant="outline" asChild>
          <Link to="/portfolio"><ArrowLeft size={16} className="mr-2" /> Back to Portfolio</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 px-4 gradient-hero">
        <div className="container mx-auto max-w-4xl">
          <Link to="/portfolio" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
            <ArrowLeft size={16} className="mr-1" /> Back to Portfolio
          </Link>
          <div className="flex flex-wrap gap-2 mb-4">
            {study.industry && <Badge variant="secondary">{study.industry}</Badge>}
            {study.published_at && (
              <span className="flex items-center text-xs text-muted-foreground gap-1">
                <Calendar size={12} />
                {new Date(study.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold">{study.title}</h1>
          {study.client_name && (
            <p className="mt-3 flex items-center gap-2 text-muted-foreground">
              <Building2 size={16} /> {study.client_name}
            </p>
          )}
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">{study.description}</p>
        </div>
      </section>

      {/* Cover Image */}
      {study.cover_image_url && (
        <section className="px-4 -mt-4">
          <div className="container mx-auto max-w-4xl">
            <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
              <img src={study.cover_image_url} alt={study.title} className="w-full h-64 md:h-96 object-cover" />
            </div>
          </div>
        </section>
      )}

      {/* Content Sections */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl space-y-12">
          {study.challenge && (
            <div>
              <h2 className="text-2xl font-display font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive text-sm font-bold">1</span>
                The Challenge
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{study.challenge}</p>
            </div>
          )}

          {study.solution && (
            <div>
              <h2 className="text-2xl font-display font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">2</span>
                Our Solution
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{study.solution}</p>
            </div>
          )}

          {study.results && (
            <div>
              <h2 className="text-2xl font-display font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 text-sm font-bold">3</span>
                Results
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{study.results}</p>
            </div>
          )}

          {/* Technologies */}
          {study.technologies && study.technologies.length > 0 && (
            <div>
              <Separator className="mb-8" />
              <h3 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                <Layers size={18} /> Technologies Used
              </h3>
              <div className="flex flex-wrap gap-2">
                {study.technologies.map((t) => (
                  <Badge key={t} variant="outline" className="text-sm px-3 py-1">{t}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Gallery */}
          {study.gallery_urls && study.gallery_urls.length > 0 && (
            <div>
              <Separator className="mb-8" />
              <h3 className="text-lg font-display font-semibold mb-4">Project Gallery</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {study.gallery_urls.map((url, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-border">
                    <img src={url} alt={`${study.title} screenshot ${i + 1}`} className="w-full h-48 object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-card/30">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-display font-bold">Want Similar Results?</h2>
          <p className="mt-3 text-muted-foreground">Let's discuss how we can help your business grow.</p>
          <Button size="lg" className="mt-6 glow-primary" asChild>
            <Link to="/start-project">Start a Project <ArrowRight className="ml-2" size={18} /></Link>
          </Button>
        </div>
      </section>
    </>
  );
};

export default CaseStudyDetail;
