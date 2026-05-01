import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SectionHeading from "@/components/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Clock, Tag, Sparkles } from "lucide-react";
import SEO from "@/components/SEO";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  tags: string[];
  published_at: string | null;
}

const Insights = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState("All");

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, cover_image_url, tags, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        setPosts(data || []);
        setLoading(false);
      });
  }, []);

  const allTags = ["All", ...Array.from(new Set(posts.flatMap((p) => p.tags || [])))];
  const filtered = activeTag === "All" ? posts : posts.filter((p) => (p.tags || []).includes(activeTag));

  const featured = filtered[0];
  const rest = filtered.slice(1);

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "";

  return (
    <>
      <SEO
        title="Insights | Engineering Blog & Articles | Teevexa"
        description="Read Teevexa's engineering blog — articles on software architecture, mobile development, cloud, and Africa's tech ecosystem."
        canonical="/insights"
      />
      {/* ── Hero ── */}
      <section className="relative py-32 px-4 gradient-hero network-bg overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-primary/8 blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 left-1/3 w-60 h-60 rounded-full bg-accent/7 blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
        </div>
        <div className="container mx-auto text-center relative z-10 animate-fade-in max-w-4xl">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary block mb-4">Insights</span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
            Ideas, <span className="gradient-text">Perspectives</span> &amp; Craft
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Practical insights from our engineers, designers, and strategists — on technology, product, and building for Africa.
          </p>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Tag filters */}
          {!loading && allTags.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-12 justify-center">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                    activeTag === tag
                      ? "bg-primary text-primary-foreground border-primary glow-primary"
                      : "glass border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {tag !== "All" && <Tag size={11} />}
                  {tag}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="space-y-10">
              <div className="glass rounded-2xl overflow-hidden animate-pulse h-72" />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse h-56" />
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <FileText className="mx-auto text-muted-foreground mb-4 opacity-30" size={56} />
              <p className="text-lg font-display font-semibold mb-1">No articles yet</p>
              <p className="text-muted-foreground text-sm">Check back soon for insights from our team.</p>
            </div>
          ) : (
            <>
              {/* Featured post */}
              {featured && (
                <Link
                  to={`/insights/${featured.slug}`}
                  className="group block glass rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-xl transition-all duration-300 mb-12"
                >
                  <div className="grid lg:grid-cols-2 min-h-[340px]">
                    <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center min-h-[200px]">
                      {featured.cover_image_url ? (
                        <img
                          src={featured.cover_image_url}
                          alt={featured.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          style={{ position: "absolute", inset: 0 }}
                        />
                      ) : (
                        <Sparkles className="text-primary/30" size={72} />
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                          Featured
                        </span>
                      </div>
                    </div>
                    <div className="p-8 lg:p-10 flex flex-col justify-center">
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {(featured.tags || []).slice(0, 3).map((t) => (
                          <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                      <h2 className="font-display font-bold text-2xl lg:text-3xl leading-tight mb-3 group-hover:text-primary transition-colors">
                        {featured.title}
                      </h2>
                      {featured.excerpt && (
                        <p className="text-muted-foreground leading-relaxed text-sm mb-6 line-clamp-3">{featured.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock size={12} />
                          {formatDate(featured.published_at)}
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all">
                          Read Article <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Rest of posts */}
              {rest.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((post) => (
                    <Link
                      key={post.id}
                      to={`/insights/${post.slug}`}
                      className="glass rounded-2xl overflow-hidden group hover:border-primary/50 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
                    >
                      {post.cover_image_url ? (
                        <div className="aspect-video overflow-hidden relative">
                          <img
                            src={post.cover_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/5 flex items-center justify-center">
                          <FileText className="text-primary/30" size={40} />
                        </div>
                      )}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {(post.tags || []).slice(0, 2).map((t) => (
                            <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                          ))}
                        </div>
                        <h3 className="font-display font-bold text-base leading-snug mb-2 group-hover:text-primary transition-colors flex-1">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">{post.excerpt}</p>
                        )}
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock size={11} /> {formatDate(post.published_at)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-1.5 transition-all">
                            Read <ArrowRight size={12} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Newsletter CTA ── */}
      <section className="section-teal py-24 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary block mb-4">Stay Sharp</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Thinking About Building <span className="gradient-text">Something?</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Book a free consultation and let's talk through your ideas — no pitch, just honest advice.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="glow-primary px-8" asChild>
              <Link to="/book-consultation">Book a Free Call <ArrowRight className="ml-2" size={18} /></Link>
            </Button>
            <Button variant="outline" size="lg" className="px-8" asChild>
              <Link to="/start-project">Start a Project</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Insights;
