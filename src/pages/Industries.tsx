import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SectionHeading from "@/components/SectionHeading";
import IndustryIcon from "@/components/IndustryIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2 } from "lucide-react";

interface Industry {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string | null;
  cover_image_url: string | null;
  services: string[] | null;
}

const Industries = () => {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("industries")
      .select("id, title, slug, description, icon, cover_image_url, services")
      .eq("status", "published")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setIndustries((data as Industry[]) || []);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <section className="pt-32 pb-16 px-4 gradient-hero">
        <div className="container mx-auto text-center">
          <SectionHeading
            label="Industries"
            title="Industries We Serve"
            description="We deliver tailored digital solutions across a wide range of sectors, helping businesses transform and thrive in the digital age."
          />
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto">
          {loading ? (
            <p className="text-center text-muted-foreground">Loading industries...</p>
          ) : industries.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="mx-auto text-muted-foreground mb-4" size={48} />
              <p className="text-muted-foreground">No industries listed yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {industries.map((item) => (
                <Link
                  key={item.id}
                  to={`/industries/${item.slug}`}
                  className="glass rounded-2xl overflow-hidden group hover:border-primary/40 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="h-48 gradient-primary relative flex items-center justify-center">
                    {item.cover_image_url ? (
                      <img src={item.cover_image_url} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="text-primary/30" size={64} />
                    )}
                    <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="outline" size="sm">Explore <ArrowRight className="ml-1" size={14} /></Button>
                    </div>
                  </div>
                  <div className="p-5">
                    {item.icon && <span className="text-2xl mb-2 block">{item.icon}</span>}
                    <h3 className="font-display font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{item.description}</p>
                    {item.services && item.services.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {item.services.slice(0, 3).map((s) => (
                          <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                        ))}
                        {item.services.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{item.services.length - 3}</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-4 bg-card/30">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-display font-bold">Don't See Your Industry?</h2>
          <p className="mt-3 text-muted-foreground">We build custom solutions for every sector. Let's talk about your needs.</p>
          <Button size="lg" className="mt-6 glow-primary" asChild>
            <Link to="/contact">Get in Touch <ArrowRight className="ml-2" size={18} /></Link>
          </Button>
        </div>
      </section>
    </>
  );
};

export default Industries;
