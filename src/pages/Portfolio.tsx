import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/SectionHeading";
import SEO from "@/components/SEO";
import { BarChart3, ArrowRight, CheckCircle2, Filter } from "lucide-react";

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

const stats = [
  { value: "50+", label: "Projects Delivered" },
  { value: "8+", label: "Countries" },
  { value: "5", label: "Industries" },
  { value: "100%", label: "On-Time Delivery" },
];

const Portfolio = () => {
  const [items, setItems] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

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

  const industries = ["All", ...Array.from(new Set(items.map((i) => i.industry).filter(Boolean) as string[]))];
  const filtered = activeFilter === "All" ? items : items.filter((i) => i.industry === activeFilter);

  return (
    <>
      <SEO
        title="Portfolio | Our Work & Case Studies | Teevexa"
        description="Explore Teevexa's portfolio of digital products, mobile apps, and platforms built for clients across Africa and beyond."
        canonical="/portfolio"
      />
      {/* ── Hero ── */}
      <section className="relative py-32 px-4 gradient-hero network-bg overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-primary/8 blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 left-1/3 w-60 h-60 rounded-full bg-accent/7 blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
        </div>
        <div className="container mx-auto text-center relative z-10 animate-fade-in max-w-4xl">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary block mb-4">Our Portfolio</span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
            Work That <span className="gradient-text">Speaks</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            From ambitious startups to enterprise-scale platforms — real products built for real impact across Africa and beyond.
          </p>
          <Button size="lg" className="glow-primary px-8" asChild>
            <Link to="/start-project">Start Your Project <ArrowRight className="ml-2" size={18} /></Link>
          </Button>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="section-teal py-14 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-3xl mx-auto text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-4xl lg:text-5xl font-display font-bold gradient-text">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Portfolio Grid ── */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <SectionHeading
            label="Case Studies"
            title="Featured Projects"
            description="Each project reflects a unique challenge solved with precision and craft."
          />

          {/* Industry Filter */}
          {industries.length > 1 && (
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              {industries.map((ind) => (
                <button
                  key={ind}
                  onClick={() => setActiveFilter(ind)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                    activeFilter === ind
                      ? "bg-primary text-primary-foreground border-primary glow-primary"
                      : "glass border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {ind === "All" && <Filter size={13} />}
                  {ind}
                </button>
              ))}
            </div>
          )}

          <div className="mt-12">
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
                    <div className="h-52 bg-muted/50" />
                    <div className="p-5 space-y-3">
                      <div className="h-3 bg-muted/50 rounded w-1/3" />
                      <div className="h-4 bg-muted/50 rounded w-2/3" />
                      <div className="h-3 bg-muted/50 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <BarChart3 className="mx-auto text-muted-foreground mb-4 opacity-30" size={56} />
                <p className="text-lg font-display font-semibold mb-1">No projects found</p>
                <p className="text-muted-foreground text-sm">Try a different industry filter or check back soon.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((item) => (
                  <Link
                    key={item.id}
                    to={`/portfolio/${item.slug}`}
                    className="glass rounded-2xl overflow-hidden group hover:border-primary/50 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
                  >
                    <div className="h-52 gradient-primary relative flex items-center justify-center overflow-hidden">
                      {item.cover_image_url ? (
                        <img
                          src={item.cover_image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <BarChart3 className="text-primary/25" size={64} />
                      )}
                      <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="inline-flex items-center gap-2 bg-background/90 text-foreground px-4 py-2 rounded-full text-sm font-semibold">
                          View Case Study <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-2">
                        {item.industry && (
                          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">{item.industry}</span>
                        )}
                        {item.client_name && (
                          <span className="text-xs text-muted-foreground">{item.client_name}</span>
                        )}
                      </div>
                      <h3 className="font-display font-bold text-lg leading-snug mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">{item.description}</p>
                      {item.technologies && item.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {item.technologies.slice(0, 4).map((t) => (
                            <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                          ))}
                          {item.technologies.length > 4 && (
                            <Badge variant="outline" className="text-xs">+{item.technologies.length - 4}</Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <section className="section-card py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              "Discovery → delivery in every project",
              "Dedicated account manager included",
              "Full source-code handover on completion",
              "Post-launch support & SLA guarantee",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-navy py-24 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-4xl font-display font-bold mb-4">
            Ready to Be <span className="gradient-text">Our Next Success Story?</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-10">
            Let's build something extraordinary together. Tell us about your project — we'll take it from there.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="glow-primary px-10" asChild>
              <Link to="/start-project">Start a Project <ArrowRight className="ml-2" size={18} /></Link>
            </Button>
            <Button variant="outline" size="lg" className="px-8 bg-transparent text-foreground border-foreground/30 hover:bg-foreground/10 hover:border-foreground/50" asChild>
              <Link to="/book-consultation">Book a Consultation</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Portfolio;
