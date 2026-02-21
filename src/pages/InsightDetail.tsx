import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Post {
  id: string; title: string; slug: string; excerpt: string | null;
  content: string; cover_image_url: string | null; tags: string[];
  published_at: string | null; created_at: string;
}

const InsightDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase.from("blog_posts").select("*").eq("slug", slug).eq("status", "published").single()
      .then(({ data }) => { setPost(data); setLoading(false); });
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!post) return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <h2 className="font-display font-bold text-2xl mb-4">Article Not Found</h2>
        <Button asChild><Link to="/insights"><ArrowLeft size={16} className="mr-1" /> Back to Insights</Link></Button>
      </div>
    </div>
  );

  return (
    <>
      <section className="py-24 px-4 gradient-hero network-bg">
        <div className="container mx-auto max-w-3xl animate-fade-in">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link to="/insights"><ArrowLeft size={14} className="mr-1" /> Back to Insights</Link>
          </Button>
          <div className="flex gap-2 flex-wrap mb-4">
            {(post.tags || []).map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-4">{post.title}</h1>
          {post.excerpt && <p className="text-lg text-muted-foreground">{post.excerpt}</p>}
          <p className="text-sm text-muted-foreground mt-4">
            {post.published_at ? new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          {post.cover_image_url && (
            <img src={post.cover_image_url} alt={post.title} className="w-full rounded-2xl mb-8 object-cover max-h-[400px]" />
          )}
          <div className="prose prose-invert max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </div>
      </section>
    </>
  );
};

export default InsightDetail;
