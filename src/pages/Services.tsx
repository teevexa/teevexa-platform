import { Link } from "react-router-dom";
import SectionHeading from "@/components/SectionHeading";
import { Globe, Smartphone, ShoppingCart, Building2, Palette, Sparkles, ArrowRight } from "lucide-react";

const services = [
  { icon: Globe, title: "Web Development", desc: "Custom, high-performance web applications built with modern frameworks and scalable architecture.", path: "/services/web-development" },
  { icon: Smartphone, title: "Mobile Development", desc: "Cross-platform mobile apps with native performance, offline-first capabilities, and seamless UX.", path: "/services/mobile-development" },
  { icon: ShoppingCart, title: "E-Commerce Systems", desc: "Full-featured e-commerce platforms with payment integration, inventory management, and analytics.", path: "/services/e-commerce-systems" },
  { icon: Building2, title: "Enterprise Software", desc: "Custom ERP, CRM, and workflow automation solutions for complex business operations.", path: "/services/enterprise-software" },
  { icon: Palette, title: "UI/UX Design", desc: "User-centered design with research-driven interfaces, design systems, and interactive prototypes.", path: "/services/ui-ux-design" },
  { icon: Sparkles, title: "Digital Transformation", desc: "End-to-end digitization of business processes, cloud migration, and legacy modernization.", path: "/services" },
];

const Services = () => (
  <>
    <section className="py-24 px-4 gradient-hero network-bg">
      <div className="container mx-auto text-center animate-fade-in">
        <SectionHeading label="Services" title="What We Build" description="End-to-end digital solutions tailored to your business needs." />
      </div>
    </section>

    <section className="py-24 px-4">
      <div className="container mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <Link key={s.title} to={s.path} className="glass rounded-2xl p-8 group hover:border-primary/40 transition-all duration-300 hover:-translate-y-1">
              <s.icon className="text-primary mb-4 group-hover:scale-110 transition-transform" size={36} />
              <h3 className="font-display font-semibold text-xl mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{s.desc}</p>
              <span className="inline-flex items-center text-sm font-medium text-primary">
                Learn More <ArrowRight size={14} className="ml-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default Services;
