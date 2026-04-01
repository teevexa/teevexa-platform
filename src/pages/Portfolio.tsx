import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/SectionHeading";
import { BarChart3, ArrowRight } from "lucide-react";

interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  client_name: string | null;
  industry: string | null;
  description: string;
  cover_image_url: string | null;
  technologies: string[] | null;
}

const Portfolio = () => {
  const [items, setItems] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("case_studies")
      .select("id, title, slug, client_name, industry, description, cover_image_url, technologies")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        setItems((data as CaseStudy[]) || []);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <section className="pt-32 pb-16 px-4 gradient-hero">
        <div className="container mx-auto text-center">
          <SectionHeading label="Portfolio" title="Our Work" description="Explore the digital solutions we've built for businesses across Africa." />
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto">
          {loading ? (
            <p className="text-center text-muted-foreground">Loading projects...</p>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <BarChart3 className="mx-auto text-muted-foreground mb-4" size={48} />
              <p className="text-muted-foreground">No published case studies yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <Link
                  key={item.id}
                  to={`/portfolio/${item.slug}`}
                  className="glass rounded-2xl overflow-hidden group hover:border-primary/40 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="h-48 gradient-primary relative flex items-center justify-center">
                    {item.cover_image_url ? (
                      <img src={item.cover_image_url} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <BarChart3 className="text-primary/30" size={64} />
                    )}
                    <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="outline" size="sm">View Case Study</Button>
                    </div>
                  </div>
                  <div className="p-5">
                    {item.industry && <span className="text-xs text-primary font-medium">{item.industry}</span>}
                    <h3 className="font-display font-semibold mt-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                    {item.technologies && item.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {item.technologies.slice(0, 3).map((t) => (
                          <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-card/30">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-display font-bold">Want to Be Our Next Success Story?</h2>
          <p className="mt-3 text-muted-foreground">Let's build something extraordinary together.</p>
          <Button size="lg" className="mt-6 glow-primary" asChild>
            <Link to="/start-project">Start a Project <ArrowRight className="ml-2" size={18} /></Link>
          </Button>
        </div>
      </section>
    </>
  );
};

export default Portfolio;
