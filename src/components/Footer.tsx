import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/teevexa-logo.jpeg";

const TikTokIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.28 8.28 0 0 0 4.84 1.54V6.79a4.85 4.85 0 0 1-1.07-.1z" />
  </svg>
);

const socials = [
  { href: "https://www.linkedin.com/company/teevexa", label: "LinkedIn", icon: <Linkedin size={18} /> },
  { href: "https://www.instagram.com/teevexa", label: "Instagram", icon: <Instagram size={18} /> },
  { href: "https://x.com/teevexa", label: "X (Twitter)", icon: <Twitter size={18} /> },
  { href: "https://www.facebook.com/teevexa", label: "Facebook", icon: <Facebook size={18} /> },
  { href: "https://www.tiktok.com/@teevexa", label: "TikTok", icon: <TikTokIcon size={18} /> },
  { href: "https://www.youtube.com/@teevexa", label: "YouTube", icon: <Youtube size={18} /> },
];

type FooterLink = { label: string; to?: string; href?: string };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Services",
    links: [
      { label: "Prototype to Production", to: "/prototype-to-production" },
      { label: "AI Agent Development", to: "/services/ai-agents" },
      { label: "Web Development", to: "/services/web-development" },
      { label: "Mobile Development", to: "/services/mobile-development" },
      { label: "E-Commerce Systems", to: "/services/e-commerce-systems" },
      { label: "Enterprise Software", to: "/services/enterprise-software" },
      { label: "UI/UX Design", to: "/services/ui-ux-design" },
    ],
  },
  {
    title: "Products",
    links: [
      { label: "Teevexa Trace", to: "/teevexa-trace" },
      { label: "Teevexa Field", to: "/teevexa-field" },
      { label: "Verify a Batch", to: "/verify" },
      { label: "Pricing", to: "/pricing" },
      { label: "API Docs", to: "/api-docs" },
    ],
  },
  {
    title: "Open Source",
    links: [
      { label: "TeeDesk", to: "/teedesk" },
      { label: "CyberGuard AI", to: "/cyberguard-ai" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Our Work", to: "/portfolio" },
      { label: "Insights", to: "/insights" },
      { label: "Careers", to: "/careers" },
      { label: "Contact", to: "/contact" },
      { label: "Client login", to: "/auth" },
    ],
  },
];

const linkClass = "text-sm text-muted-foreground hover:text-primary transition-colors";

const Footer = () => (
  <footer className="nav-dark-surface border-t">
    <div className="container mx-auto pt-16 pb-8">
      {/* Call to action */}
      <div className="rounded-3xl p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-primary/30 bg-gradient-to-br from-primary/25 via-primary/10 to-transparent">
        <div>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-white">Have a project in mind?</h2>
          <p className="text-white/70 mt-1.5">Tell us about it and get a tailored quote by email within 24 hours.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <Button size="lg" className="glow-primary" asChild>
            <Link to="/start-project">Get a Quote <ArrowRight className="ml-2" size={16} /></Link>
          </Button>
          <Button size="lg" variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white" asChild>
            <Link to="/book-consultation"><CalendarDays className="mr-2" size={16} /> Book a call</Link>
          </Button>
        </div>
      </div>

      {/* Main */}
      <div className="mt-14 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4 space-y-5">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <img src={logo} alt="Teevexa" className="h-10 w-10 rounded-md object-cover" />
            <span className="text-xl font-display font-bold gradient-text tracking-tight">TEEVEXA</span>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
            Tech Evolution for Exceptional Applications. An AI-native product engineering team building software, AI agents and production-ready apps for ambitious businesses worldwide.
          </p>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li><a href="mailto:hello@teevexa.com" className="inline-flex items-center gap-2 hover:text-primary transition-colors"><Mail size={15} className="text-primary" /> hello@teevexa.com</a></li>
            <li><a href="tel:+254783797132" className="inline-flex items-center gap-2 hover:text-primary transition-colors"><Phone size={15} className="text-primary" /> +254 783 797 132</a></li>
            <li className="inline-flex items-start gap-2"><MapPin size={15} className="text-primary mt-0.5" /><span>Nairobi, Kenya · serving clients globally</span></li>
          </ul>
          <div className="flex flex-wrap gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-9 h-9 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Footer" className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-display font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.to ? (
                      <Link to={l.to} className={linkClass}>{l.label}</Link>
                    ) : (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className={linkClass}>{l.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom bar */}
      <div className="mt-14 pt-6 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} TEEVEXA LTD. All rights reserved.</p>
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <li><Link to="/legal/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
          <li><Link to="/legal/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link></li>
          <li><Link to="/legal/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
          <li><Link to="/accessibility" className="hover:text-primary transition-colors">Accessibility</Link></li>
          <li>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("teevexa:open-cookie-settings"))}
              className="hover:text-primary transition-colors underline-offset-2 hover:underline"
            >
              Cookie settings
            </button>
          </li>
        </ul>
      </div>
    </div>
  </footer>
);

export default Footer;
