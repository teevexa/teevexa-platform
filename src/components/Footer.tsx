import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Linkedin, Twitter, Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/30 bg-card/40">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <span className="text-xl font-display font-bold gradient-text">TEEVEXA</span>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tech Evolution for Exceptional Applications. Building digital infrastructure for Africa's future.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn"><Linkedin size={18} /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter"><Twitter size={18} /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="GitHub"><Github size={18} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-foreground">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {[
                { label: "About Us", path: "/about" },
                { label: "Services", path: "/services" },
                { label: "Portfolio", path: "/portfolio" },
                { label: "Insights", path: "/insights" },
                { label: "Teevexa Trace", path: "/teevexa-trace" },
              ].map((l) => (
                <Link key={l.path} to={l.path} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-foreground">Services</h4>
            <div className="flex flex-col gap-2">
              {[
                { label: "Web Development", path: "/services/web-development" },
                { label: "Mobile Development", path: "/services/mobile-development" },
                { label: "E-Commerce", path: "/services/e-commerce-systems" },
                { label: "Enterprise Software", path: "/services/enterprise-software" },
                { label: "UI/UX Design", path: "/services/ui-ux-design" },
              ].map((l) => (
                <Link key={l.path} to={l.path} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-foreground">Contact</h4>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Mail size={14} className="text-primary" /> info@teevexa.com</div>
              <div className="flex items-center gap-2"><Phone size={14} className="text-primary" /> +234 800 TEE VEXA</div>
              <div className="flex items-start gap-2"><MapPin size={14} className="text-primary mt-0.5" /> Lagos, Nigeria</div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} TEEVEXA. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/legal/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/legal/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
