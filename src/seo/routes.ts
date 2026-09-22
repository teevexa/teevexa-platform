// Single source of truth for the SEO of every static public page.
// Used by: the <SEO route="..."/> component, the sitemap generator and the build-time prerender.
// Keep titles <= 60 characters and descriptions between 110 and 160 (enforced by src/test/seo.test.ts).

import { prototypeFaqs, contactFaqGroups } from "../content/faqs";
import {
  CYBERGUARD_REPO, FIELD_PLAY_URL, TEEDESK_REPO, TRACE_PLAY_URL,
  androidAppLd, faqLd, openSourceLd, serviceLd, webPageLd, type JsonLd,
} from "./site";

export interface PageMeta {
  title: string;
  description: string;
  /** Short label used in breadcrumbs (defaults to the last part of the title). */
  crumb?: string;
  noindex?: boolean;
  changefreq?: "daily" | "weekly" | "monthly" | "yearly";
  priority?: number;
  jsonLd?: JsonLd[];
}

const contactFaqs = contactFaqGroups.flatMap((g) => g.items);

export const PAGES: Record<string, PageMeta> = {
  "/": {
    title: "Teevexa | AI-Native Software Development in Nairobi",
    description:
      "Nairobi-based engineering team building custom software, AI agents and production-ready apps for businesses worldwide. Get a tailored quote in 24 hours.",
    crumb: "Home",
    changefreq: "weekly",
    priority: 1.0,
  },

  // ── Services ──
  "/services": {
    title: "Software Development Services: Web, Mobile, AI | Teevexa",
    description:
      "Custom web apps, mobile apps, AI agents, e-commerce and enterprise software, plus prototype-to-production engineering. Senior engineers, global standards.",
    crumb: "Services",
    changefreq: "monthly",
    priority: 0.9,
  },
  "/services/ai-agents": {
    title: "AI Agent Development Company | Teevexa",
    description:
      "Custom AI agents that automate support, document processing and internal workflows. Open-source models, on-premise or cloud, no per-query AI fees.",
    crumb: "AI Agent Development",
    changefreq: "monthly",
    priority: 0.8,
    jsonLd: [serviceLd("AI Agent Development", "Custom AI agents that automate support, document processing and internal workflows.", "/services/ai-agents")],
  },
  "/services/web-development": {
    title: "Custom Web Development Services | Teevexa",
    description:
      "High-performance web applications, from marketing sites to complex SaaS platforms. API-first architecture, headless CMS, SEO and Core Web Vitals built in.",
    crumb: "Web Development",
    changefreq: "monthly",
    priority: 0.8,
    jsonLd: [serviceLd("Web Development", "High-performance custom web applications and SaaS platforms.", "/services/web-development")],
  },
  "/services/mobile-development": {
    title: "Mobile App Development Company | Teevexa",
    description:
      "Cross-platform iOS and Android apps with native performance, offline-first sync and push notifications. We ship our own apps on Google Play too.",
    crumb: "Mobile Development",
    changefreq: "monthly",
    priority: 0.8,
    jsonLd: [serviceLd("Mobile App Development", "Cross-platform iOS and Android apps with offline-first capabilities.", "/services/mobile-development")],
  },
  "/services/e-commerce-systems": {
    title: "E-Commerce Development & Payments Integration | Teevexa",
    description:
      "Online stores and marketplaces with Stripe, PayPal, Pesapal, Paystack, Flutterwave and M-Pesa. Multi-currency, inventory, multi-vendor and analytics.",
    crumb: "E-Commerce Systems",
    changefreq: "monthly",
    priority: 0.8,
    jsonLd: [serviceLd("E-Commerce Development", "Commerce platforms with global and regional payment integrations.", "/services/e-commerce-systems")],
  },
  "/services/enterprise-software": {
    title: "Enterprise Software Development: ERP & CRM | Teevexa",
    description:
      "Custom ERP, CRM and workflow automation for large organisations. Data pipelines, business intelligence, multi-tenancy and role-based access.",
    crumb: "Enterprise Software",
    changefreq: "monthly",
    priority: 0.8,
    jsonLd: [serviceLd("Enterprise Software Development", "Custom ERP, CRM and workflow automation for large organisations.", "/services/enterprise-software")],
  },
  "/services/ui-ux-design": {
    title: "UI/UX Design Services | Teevexa",
    description:
      "Research-driven UI/UX design: user research, design systems, interactive prototypes and WCAG 2.2 AA accessibility for products used across devices and markets.",
    crumb: "UI/UX Design",
    changefreq: "monthly",
    priority: 0.8,
    jsonLd: [serviceLd("UI/UX Design", "Research-driven design systems, prototypes and accessible interfaces.", "/services/ui-ux-design")],
  },
  "/prototype-to-production": {
    title: "Take Your AI Prototype to Production | Teevexa",
    description:
      "Built an app with Lovable, Bolt, v0 or Cursor? We add security, live payments, deployment and 30 days of support so it is ready for real users.",
    crumb: "Prototype to Production",
    changefreq: "monthly",
    priority: 0.95,
    jsonLd: [
      serviceLd("Prototype to Production", "Security hardening, payments, deployment and support for AI-built prototypes.", "/prototype-to-production"),
      faqLd(prototypeFaqs),
    ],
  },

  // ── Conversion pages ──
  "/start-project": {
    title: "Get a Quote for Your Software Project | Teevexa",
    description:
      "Describe your project in your own words, answer five quick questions and get a tailored quote by email within 24 hours. No account needed.",
    crumb: "Get a Quote",
    changefreq: "monthly",
    priority: 0.9,
  },
  "/book-consultation": {
    title: "Book a Free 30-Minute Consultation | Teevexa",
    description:
      "Schedule a free 30-minute video call with the Teevexa team to discuss your goals, challenges and the best way to build your product. Any time zone.",
    crumb: "Book a Consultation",
    changefreq: "monthly",
    priority: 0.7,
  },
  "/contact": {
    title: "Contact Teevexa | Software Development Team, Nairobi",
    description:
      "Talk to the Teevexa team in Nairobi. Send a message, book a free call or start a project. We reply within one business day, worldwide.",
    crumb: "Contact",
    changefreq: "monthly",
    priority: 0.7,
    jsonLd: [webPageLd("ContactPage", "Contact Teevexa", "Contact the Teevexa team.", "/contact"), faqLd(contactFaqs)],
  },

  // ── Company ──
  "/about": {
    title: "About Teevexa | AI-Native Product Engineering Company",
    description:
      "Teevexa is a Nairobi-born product engineering company: senior engineers building software, AI agents and supply chain apps for ambitious businesses.",
    crumb: "About",
    changefreq: "monthly",
    priority: 0.7,
    jsonLd: [webPageLd("AboutPage", "About Teevexa", "About Teevexa Ltd, a Nairobi-born product engineering company.", "/about")],
  },
  "/portfolio": {
    title: "Our Work: Apps & Open-Source Projects | Teevexa",
    description:
      "Products Teevexa built and ships: Teevexa Trace and Field on Google Play, plus open-source TeeDesk and CyberGuard AI, alongside client case studies.",
    crumb: "Our Work",
    changefreq: "weekly",
    priority: 0.8,
    jsonLd: [webPageLd("CollectionPage", "Our Work", "Products and case studies from Teevexa.", "/portfolio")],
  },
  "/insights": {
    title: "Engineering Blog & Insights | Teevexa",
    description:
      "Articles from the Teevexa engineering team on software architecture, AI, mobile development, cloud and building software that lasts.",
    crumb: "Insights",
    changefreq: "weekly",
    priority: 0.8,
  },
  "/careers": {
    title: "Careers at Teevexa | Software Engineering Jobs",
    description:
      "Explore open roles at Teevexa in Nairobi and remote. Build AI-native software and supply chain products with a senior engineering team.",
    crumb: "Careers",
    changefreq: "weekly",
    priority: 0.6,
  },
  "/accessibility": {
    title: "Accessibility Statement | Teevexa",
    description:
      "Teevexa's commitment to making teevexa.com usable by everyone: our WCAG 2.2 AA goals, what we do, known limitations and how to report a barrier.",
    crumb: "Accessibility",
    changefreq: "yearly",
    priority: 0.3,
  },

  // ── Products ──
  "/teevexa-trace": {
    title: "Teevexa Trace | Supply Chain Traceability App",
    description:
      "Track, verify and certify products from source to shelf. QR verification, blockchain anchoring, certificates and compliance reports. Free on Google Play.",
    crumb: "Teevexa Trace",
    changefreq: "monthly",
    priority: 0.8,
    jsonLd: [androidAppLd("Teevexa Trace", "Supply chain traceability and verification for producers, exporters and buyers.", "/teevexa-trace", TRACE_PLAY_URL)],
  },
  "/teevexa-field": {
    title: "Teevexa Field | Offline Field Data Collection App",
    description:
      "Offline-first app for supply chain field agents: log events, scan QR codes and capture GPS and photo evidence with no internet. Free on Google Play.",
    crumb: "Teevexa Field",
    changefreq: "monthly",
    priority: 0.7,
    jsonLd: [androidAppLd("Teevexa Field", "Offline-first app for supply chain field agents.", "/teevexa-field", FIELD_PLAY_URL)],
  },
  "/pricing": {
    title: "Teevexa Trace & Field Pricing | Free While We Launch",
    description:
      "Teevexa Trace and Teevexa Field are free to use while we launch. Download on Google Play, or talk to us about API, white-label and enterprise needs.",
    crumb: "Pricing",
    changefreq: "monthly",
    priority: 0.6,
  },
  "/verify": {
    title: "Verify a Product Batch | Teevexa Trace",
    description:
      "Enter a batch ID to view a product's supply chain journey, GPS-tracked events and blockchain-anchored provenance records. No account required.",
    crumb: "Verify a Batch",
    changefreq: "monthly",
    priority: 0.5,
  },
  "/api-docs": {
    title: "Teevexa Trace API Docs | Batch Verification API",
    description:
      "REST API for batch provenance verification: trust scores, events and blockchain anchors. Integrate supply chain transparency into retail and compliance flows.",
    crumb: "API Docs",
    changefreq: "monthly",
    priority: 0.5,
  },

  // ── Open source ──
  "/open-source": {
    title: "Open-Source Projects: TeeDesk & CyberGuard AI | Teevexa",
    description:
      "Open-source projects by Teevexa for developers to use and contribute to: TeeDesk AI customer support and CyberGuard AI threat detection.",
    crumb: "Open Source",
    changefreq: "monthly",
    priority: 0.6,
  },
  "/teedesk": {
    title: "TeeDesk | Open-Source AI Customer Support Platform",
    description:
      "Open-source AI support platform: chat widget, admin dashboard, RAG knowledge base, ticket triage, sentiment analysis and WhatsApp. Runs local LLMs via Ollama.",
    crumb: "TeeDesk",
    changefreq: "monthly",
    priority: 0.6,
    jsonLd: [openSourceLd("TeeDesk", "Open-source AI-powered customer support platform.", "/teedesk", TEEDESK_REPO)],
  },
  "/cyberguard-ai": {
    title: "CyberGuard AI | Open-Source Threat Detection",
    description:
      "Open-source AI threat detection for small teams: ML anomaly scoring on network traffic, Slack, email and webhook alerts, and a local AI triage assistant.",
    crumb: "CyberGuard AI",
    changefreq: "monthly",
    priority: 0.6,
    jsonLd: [openSourceLd("CyberGuard AI", "AI-enhanced cybersecurity threat detector.", "/cyberguard-ai", CYBERGUARD_REPO, "https://www.apache.org/licenses/LICENSE-2.0")],
  },

  // ── Not indexed (kept out of the sitemap) ──
  "/legal/privacy-policy": {
    title: "Privacy Policy | Teevexa",
    description: "How Teevexa collects, uses and protects your personal data, and the rights you have over it.",
    crumb: "Privacy Policy",
    noindex: true,
  },
  "/legal/terms-of-service": {
    title: "Terms of Service | Teevexa",
    description: "The terms governing the use of Teevexa's website, products and services.",
    crumb: "Terms of Service",
    noindex: true,
  },
  "/legal/cookies": {
    title: "Cookie Policy | Teevexa",
    description: "How Teevexa uses cookies and similar technologies, and how you can control them.",
    crumb: "Cookie Policy",
    noindex: true,
  },
  "/account/delete": {
    title: "Delete Your Account | Teevexa Trace",
    description: "Instructions for deleting your Teevexa Trace or Teevexa Field account and associated data.",
    crumb: "Delete Account",
    noindex: true,
  },
};

/** Section labels for breadcrumbs of nested routes. */
const SECTIONS: Record<string, { name: string; path: string }> = {
  services: { name: "Services", path: "/services" },
  insights: { name: "Insights", path: "/insights" },
  portfolio: { name: "Our Work", path: "/portfolio" },
  careers: { name: "Careers", path: "/careers" },
};

export function breadcrumbItems(path: string, leaf?: string): { name: string; path: string }[] {
  if (path === "/") return [];
  const parts = path.split("/").filter(Boolean);
  const items = [{ name: "Home", path: "/" }];
  if (parts.length > 1 && SECTIONS[parts[0]]) items.push(SECTIONS[parts[0]]);
  items.push({ name: leaf || PAGES[path]?.crumb || parts[parts.length - 1], path });
  return items;
}

export const INDEXABLE_PATHS = Object.entries(PAGES)
  .filter(([, m]) => !m.noindex)
  .map(([path]) => path);
