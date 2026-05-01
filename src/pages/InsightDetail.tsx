import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Clock, FileText } from "lucide-react";
import SEO from "@/components/SEO";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  tags: string[];
  published_at: string | null;
  created_at: string;
}

const InsightDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single()
      .then(({ data }) => {
        setPost(data);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading article...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
          <FileText className="text-muted-foreground" size={32} />
        </div>
        <div>
          <h2 className="font-display font-bold text-xl mb-2">Article Not Found</h2>
          <p className="text-muted-foreground text-sm">It may have been moved or unpublished.</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/insights"><ArrowLeft size={16} className="mr-1" /> Back to Insights</Link>
        </Button>
      </div>
    );
  }

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "";

  return (
    <>
      <SEO
        title={post.title}
        description={post.excerpt || `Read ${post.title} on the Teevexa engineering blog.`}
        canonical={`/insights/${post.slug}`}
        ogImage={post.cover_image_url || undefined}
        ogType="article"
        publishedAt={post.published_at || undefined}
        author="Teevexa"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt || "",
          image: post.cover_image_url || undefined,
          datePublished: post.published_at || undefined,
          author: { "@type": "Organization", name: "Teevexa" },
          publisher: { "@type": "Organization", name: "Teevexa", url: "https://teevexa.com" },
          url: `https://teevexa.com/insights/${post.slug}`,
        }}
      />
      {/* ── Hero ── */}
      <section className="relative pt-32 pb-16 px-4 gradient-hero network-bg overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-primary/8 blur-3xl animate-pulse-glow" />
        </div>
        <div className="container mx-auto max-w-3xl relative z-10 animate-fade-in">
          <Link
            to="/insights"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={15} /> All Articles
          </Link>
          <div className="flex flex-wrap gap-1.5 mb-5">
            {(post.tags || []).map((t) => (
              <Badge key={t} variant="outline">{t}</Badge>
            ))}
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl leading-tight mb-4">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-lg text-muted-foreground leading-relaxed mb-5">{post.excerpt}</p>
          )}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock size={14} /> {formattedDate}
          </div>
        </div>
      </section>

      {/* ── Cover Image ── */}
      {post.cover_image_url && (
        <section className="px-4 -mt-4">
          <div className="container mx-auto max-w-3xl">
            <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full max-h-[420px] object-cover"
              />
            </div>
          </div>
        </section>
      )}

      {/* ── Article body ── */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="prose prose-slate dark:prose-invert max-w-none leading-relaxed text-[15px]">
            {post.content}
          </div>

          {/* Tags + navigation */}
          <div className="mt-14 pt-8 border-t border-border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-1.5">
                {(post.tags || []).map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                ))}
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/insights"><ArrowLeft size={14} className="mr-1" /> All Articles</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-teal py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-display font-bold mb-3">
            Ready to Put This Into <span className="gradient-text">Practice?</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Book a free consultation and let's talk through your specific situation — no pitch, just honest advice.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="glow-primary px-8" asChild>
              <Link to="/book-consultation">Book a Free Call <ArrowRight className="ml-2" size={18} /></Link>
            </Button>
            <Button variant="outline" size="lg" className="px-8" asChild>
              <Link to="/insights">More Articles</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default InsightDetail;
