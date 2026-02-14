import SectionHeading from "@/components/SectionHeading";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface PlaceholderPageProps {
  label: string;
  title: string;
  description?: string;
}

const PlaceholderPage = ({ label, title, description = "This page is under construction. Check back soon for updates." }: PlaceholderPageProps) => (
  <>
    <section className="py-24 px-4 gradient-hero network-bg">
      <div className="container mx-auto text-center animate-fade-in">
        <SectionHeading label={label} title={title} description={description} />
      </div>
    </section>
    <section className="py-24 px-4 text-center">
      <p className="text-muted-foreground mb-6">We're building something great here.</p>
      <Button asChild>
        <Link to="/">Back to Home <ArrowRight className="ml-2" size={16} /></Link>
      </Button>
    </section>
  </>
);

export default PlaceholderPage;
