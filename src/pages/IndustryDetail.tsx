import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import IndustryIcon from "@/components/IndustryIcon";
import { ArrowLeft, ArrowRight, Building2 } from "lucide-react";

interface Industry {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string | null;
  cover_image_url: string | null;
  services: string[] | null;
}

const IndustryDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [industry, setIndustry] = useState<Industry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("industries")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
      .then(({ data }) => {
        setIndustry(data as Industry | null);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-glow text-primary">Loading...</div>
      </div>
    );
  }

  if (!industry) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Building2 size={48} className="text-muted-foreground" />
        <p className="text-muted-foreground">Industry not found.</p>
        <Button variant="outline" asChild>
          <Link to="/industries"><ArrowLeft size={16} className="mr-2" /> Back to Industries</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 px-4 gradient-hero">
        <div className="container mx-auto">
          <Link to="/industries" className="text-sm text-primary hover:underline inline-flex items-center gap-1 mb-6">
            <ArrowLeft size={14} /> Back to Industries
          </Link>
          <div className="flex items-center gap-3 mb-4">
            {industry.icon && <span className="text-4xl">{industry.icon}</span>}
            <h1 className="text-4xl md:text-5xl font-display font-bold">{industry.title}</h1>
          </div>
        </div>
      </section>

      {/* Cover Image */}
      {industry.cover_image_url && (
        <section className="px-4">
          <div className="container mx-auto -mt-8">
            <img
              src={industry.cover_image_url}
              alt={industry.title}
              className="w-full max-h-96 object-cover rounded-2xl border border-border/30"
            />
          </div>
        </section>
      )}

      {/* Content */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">{industry.description}</p>

          {industry.services && industry.services.length > 0 && (
            <div className="mt-10">
              <h2 className="text-2xl font-display font-semibold mb-4">Services We Offer</h2>
              <div className="flex flex-wrap gap-2">
                {industry.services.map((s) => (
                  <Badge key={s} variant="secondary" className="text-sm px-3 py-1">{s}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-card/30">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-display font-bold">Ready to Transform Your {industry.title} Business?</h2>
          <p className="mt-3 text-muted-foreground">Let's build a solution tailored to your industry needs.</p>
          <Button size="lg" className="mt-6 glow-primary" asChild>
            <Link to="/start-project">Start a Project <ArrowRight className="ml-2" size={18} /></Link>
          </Button>
        </div>
      </section>
    </>
  );
};

export default IndustryDetail;
