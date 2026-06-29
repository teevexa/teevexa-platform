import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Linkedin, Twitter, Instagram, Facebook, Youtube } from "lucide-react";

const TikTokIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.28 8.28 0 0 0 4.84 1.54V6.79a4.85 4.85 0 0 1-1.07-.1z" />
  </svg>
);
import logo from "@/assets/teevexa-logo.jpeg";

const Footer = () => {
  return (
    <footer className="nav-dark-surface border-t">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Teevexa" className="h-9 w-9 rounded-md object-cover" />
              <span className="text-xl font-display font-bold gradient-text">TEEVEXA</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tech Evolution for Exceptional Applications. Building digital infrastructure for businesses worldwide.
            </p>
            <div className="flex gap-3">
              <a href="https://www.linkedin.com/company/teevexa" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn"><Linkedin size={18} /></a>
              <a href="https://www.instagram.com/teevexa" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram"><Instagram size={18} /></a>
              <a href="https://x.com/teevexa" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="X (Twitter)"><Twitter size={18} /></a>
              <a href="https://www.facebook.com/teevexa" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook"><Facebook size={18} /></a>
              <a href="https://www.tiktok.com/@teevexa" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="TikTok"><TikTokIcon size={18} /></a>
              <a href="https://www.youtube.com/@teevexa" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="YouTube"><Youtube size={18} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-foreground">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {[
                { label: "About Us", path: "/about" },
                { label: "Services", path: "/services" },
                { label: "Insights", path: "/insights" },
                { label: "Careers", path: "/careers" },
                { label: "Contact", path: "/contact" },
              ].map((l) => (
                <Link key={l.path} to={l.path} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Products */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-foreground">Products</h4>
            <div className="flex flex-col gap-2">
              {[
                { label: "Teevexa Trace", path: "/teevexa-trace" },
                { label: "Teevexa Field", path: "/teevexa-field" },
                { label: "Teevexa Desk", path: "/teevexa-desk" },
                { label: "Teevexa Base", path: "/teevexa-base" },
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
                { label: "AI Agent Development", path: "/services/ai-agents" },
                { label: "Web Development", path: "/services/web-development" },
                { label: "Mobile Development", path: "/services/mobile-development" },
                { label: "E-Commerce Systems", path: "/services/e-commerce-systems" },
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
              <div className="flex items-center gap-2"><Phone size={14} className="text-primary" /> +254 783 797 132</div>
              <div className="flex items-start gap-2"><MapPin size={14} className="text-primary mt-0.5" /><span>Nairobi, Kenya<br /><span className="text-xs opacity-70">Serving clients globally</span></span></div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} TEEVEXA LTD. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/legal/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/legal/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="/legal/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
