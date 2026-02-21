import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SectionHeading from "@/components/SectionHeading";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileText } from "lucide-react";

interface Post {
  id: string; title: string; slug: string; excerpt: string | null;
  cover_image_url: string | null; tags: string[]; published_at: string | null;
}

const Insights = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("blog_posts").select("id, title, slug, excerpt, cover_image_url, tags, published_at")
      .eq("status", "published").order("published_at", { ascending: false })
      .then(({ data }) => { setPosts(data || []); setLoading(false); });
  }, []);

  return (
    <>
      <section className="py-24 px-4 gradient-hero network-bg">
        <div className="container mx-auto text-center animate-fade-in">
          <SectionHeading label="Insights" title="Blog & Insights" description="Thoughts, tutorials, and updates from our team." />
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          {loading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="mx-auto text-muted-foreground mb-4" size={48} />
              <p className="text-muted-foreground">No articles published yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post.id} to={`/insights/${post.slug}`}>
                  <Card className="glass h-full hover:border-primary/40 transition-all group">
                    {post.cover_image_url && (
                      <div className="aspect-video overflow-hidden rounded-t-xl">
                        <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    <CardContent className="p-5 space-y-3">
                      <div className="flex gap-1 flex-wrap">
                        {(post.tags || []).slice(0, 3).map((t) => (
                          <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                      <h3 className="font-display font-semibold text-lg leading-tight">{post.title}</h3>
                      {post.excerpt && <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-muted-foreground">
                          {post.published_at ? new Date(post.published_at).toLocaleDateString() : ""}
                        </span>
                        <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                          Read <ArrowRight size={14} />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Insights;
