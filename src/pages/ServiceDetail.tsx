import { useParams, Link } from "react-router-dom";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

const serviceData: Record<string, { title: string; tagline: string; problem: string; gap: string; approach: string; features: string[]; }> = {
  "web-development": {
    title: "Web Development",
    tagline: "High-performance web applications built to scale.",
    problem: "Many African businesses rely on outdated, poorly maintained websites that fail to convert visitors or support operations.",
    gap: "A lack of skilled, affordable web development partners who understand both global standards and local context.",
    approach: "We build custom, responsive web applications using modern frameworks with built-in security, SEO, and analytics.",
    features: ["Custom CMS", "API integrations", "Authentication systems", "Role-based dashboards", "Admin control panel", "Analytics integration", "SEO architecture", "Security hardening"],
  },
  "mobile-development": {
    title: "Mobile Development",
    tagline: "Cross-platform apps with native performance.",
    problem: "Mobile-first markets need reliable apps, but many businesses struggle with fragmented development across iOS and Android.",
    gap: "Cross-platform solutions that don't sacrifice performance or user experience.",
    approach: "We deliver cross-platform mobile apps with offline-first architecture, push notifications, and seamless backend integration.",
    features: ["Cross-platform (iOS & Android)", "Offline-first architecture", "Push notifications", "Biometric authentication", "Real-time sync", "App store optimization", "Analytics dashboard", "OTA updates"],
  },
  "e-commerce-systems": {
    title: "E-Commerce Systems",
    tagline: "Full-featured online stores that convert.",
    problem: "E-commerce adoption in Africa is growing rapidly, but businesses lack robust platforms that handle local payment methods and logistics.",
    gap: "Platforms that integrate local payment gateways, manage complex shipping logic, and scale with demand.",
    approach: "We build custom e-commerce platforms with multi-currency support, local payment integration, and intelligent inventory management.",
    features: ["Payment gateways", "Inventory management", "Shipping logic", "Coupon & discount system", "Subscription model", "Multi-vendor support", "Order tracking", "Analytics & reporting"],
  },
  "enterprise-software": {
    title: "Enterprise Software",
    tagline: "Custom solutions for complex operations.",
    problem: "Enterprises struggle with disconnected legacy systems that slow down operations and hinder data-driven decisions.",
    gap: "Integrated, scalable software that unifies operations without vendor lock-in.",
    approach: "We design and build custom ERP, CRM, and workflow automation solutions that grow with your organization.",
    features: ["ERP systems", "CRM platforms", "Workflow automation", "Data analytics", "Role-based access", "API-first architecture", "Real-time dashboards", "Compliance tools"],
  },
  "ui-ux-design": {
    title: "UI/UX Design",
    tagline: "User-centered design that drives engagement.",
    problem: "Poor user experience leads to low adoption, high churn, and missed revenue opportunities.",
    gap: "Design teams that combine global best practices with deep understanding of local user behaviors.",
    approach: "We conduct user research, build design systems, and create interactive prototypes that are tested and validated before development.",
    features: ["User research", "Design systems", "Interactive prototyping", "Usability testing", "Accessibility audits", "Brand identity", "Motion design", "Design handoff"],
  },
};

const processSteps = ["Discovery", "Architecture", "UI/UX", "Development", "Testing", "Deployment", "Support"];

const ServiceDetail = () => {
  const { slug } = useParams();
  const service = serviceData[slug || ""];

  if (!service) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold mb-2">Service Not Found</h2>
          <Button asChild><Link to="/services">View All Services</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="py-24 px-4 gradient-hero network-bg">
        <div className="container mx-auto text-center animate-fade-in">
          <SectionHeading label="Service" title={service.title} description={service.tagline} />
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: "The Problem", text: service.problem },
              { label: "The Gap", text: service.gap },
              { label: "Our Approach", text: service.approach },
            ].map((item) => (
              <div key={item.label} className="glass rounded-2xl p-6">
                <h3 className="font-display font-semibold text-primary mb-2">{item.label}</h3>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-card/30">
        <div className="container mx-auto max-w-4xl">
          <SectionHeading label="Features" title="What's Included" />
          <div className="mt-10 grid sm:grid-cols-2 gap-3">
            {service.features.map((f) => (
              <div key={f} className="flex items-center gap-3 glass rounded-xl p-4">
                <CheckCircle className="text-primary shrink-0" size={18} />
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <SectionHeading label="Process" title="How We Work" />
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {processSteps.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="glass rounded-xl px-4 py-3 text-sm font-medium">{step}</div>
                {i < processSteps.length - 1 && <ArrowRight size={16} className="text-primary" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-card/30 text-center">
        <div className="container mx-auto">
          <h2 className="text-3xl font-display font-bold mb-4">Ready to Get Started?</h2>
          <Button size="lg" className="glow-primary" asChild>
            <Link to="/start-project">Start Your Project <ArrowRight className="ml-2" size={18} /></Link>
          </Button>
        </div>
      </section>
    </>
  );
};

export default ServiceDetail;
