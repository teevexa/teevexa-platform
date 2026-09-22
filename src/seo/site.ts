// Site-wide SEO constants and JSON-LD builders. Pure TypeScript with no React or path aliases,
// because the build-time prerender script bundles this file with esbuild.

export const SITE_URL = "https://teevexa.com";
export const SITE_NAME = "Teevexa";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
export const TWITTER_HANDLE = "@teevexa";
export const LOCALE = "en_US";
export const THEME_COLOR = "#0e7490";

export const SOCIAL_PROFILES = [
  "https://www.linkedin.com/company/teevexa",
  "https://x.com/teevexa",
  "https://www.instagram.com/teevexa",
  "https://www.facebook.com/teevexa",
  "https://www.tiktok.com/@teevexa",
  "https://www.youtube.com/@teevexa",
  "https://github.com/teevexa",
];

export const TRACE_PLAY_URL = "https://play.google.com/store/apps/details?id=com.teevexa.trace";
export const FIELD_PLAY_URL = "https://play.google.com/store/apps/details?id=com.teevexa.field";
export const TEEDESK_REPO = "https://github.com/teevexa/teedesk";
export const CYBERGUARD_REPO = "https://github.com/teevexa/cyberguard-ai";

export type JsonLd = Record<string, unknown>;

/** Final <title>: appends the site name unless the title already contains it. */
export const fullTitle = (t: string): string => (t.includes(SITE_NAME) ? t : `${t} | ${SITE_NAME}`);

export const absoluteUrl = (path: string): string => `${SITE_URL}${path === "/" ? "" : path}`;

const ORG_ID = `${SITE_URL}/#organization`;

/** Global: emitted on every page. */
export const globalJsonLd = (): JsonLd[] => [
  {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    "@id": ORG_ID,
    name: "Teevexa Ltd",
    alternateName: "Teevexa",
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
    image: DEFAULT_OG_IMAGE,
    description:
      "AI-native product engineering company in Nairobi, Kenya. Custom software, AI agents and production-ready apps for businesses worldwide.",
    email: "hello@teevexa.com",
    telephone: "+254783797132",
    foundingDate: "2025",
    address: { "@type": "PostalAddress", addressLocality: "Nairobi", addressCountry: "KE" },
    areaServed: "Worldwide",
    knowsAbout: ["Software development", "AI agents", "Mobile app development", "Supply chain traceability", "Payments integration"],
    sameAs: SOCIAL_PROFILES,
    contactPoint: [{ "@type": "ContactPoint", contactType: "sales", email: "hello@teevexa.com", availableLanguage: "English" }],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { "@id": ORG_ID },
    inLanguage: "en",
  },
];

export const breadcrumbLd = (items: { name: string; path: string }[]): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: absoluteUrl(it.path),
  })),
});

export const faqLd = (faqs: { q: string; a: string }[]): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});

export const serviceLd = (name: string, description: string, path: string): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name,
  description,
  url: absoluteUrl(path),
  provider: { "@id": ORG_ID },
  areaServed: "Worldwide",
  serviceType: name,
});

export const androidAppLd = (name: string, description: string, path: string, playUrl: string): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name,
  description,
  url: absoluteUrl(path),
  downloadUrl: playUrl,
  installUrl: playUrl,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Android",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@id": ORG_ID },
});

export const openSourceLd = (name: string, description: string, path: string, repo: string, license?: string): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  name,
  description,
  url: absoluteUrl(path),
  codeRepository: repo,
  programmingLanguage: "Python",
  ...(license ? { license } : {}),
  author: { "@id": ORG_ID },
});

export const webPageLd = (type: "AboutPage" | "ContactPage" | "CollectionPage" | "WebPage", name: string, description: string, path: string): JsonLd => ({
  "@context": "https://schema.org",
  "@type": type,
  name,
  description,
  url: absoluteUrl(path),
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": ORG_ID },
});

export const articleLd = (p: {
  title: string; description: string; path: string; image?: string | null; published?: string | null; modified?: string | null;
}): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: p.title,
  description: p.description,
  url: absoluteUrl(p.path),
  mainEntityOfPage: absoluteUrl(p.path),
  image: p.image || DEFAULT_OG_IMAGE,
  datePublished: p.published || undefined,
  dateModified: p.modified || p.published || undefined,
  author: { "@type": "Organization", name: "Teevexa", url: SITE_URL },
  publisher: { "@id": ORG_ID },
});

export const jobPostingLd = (p: {
  title: string; description: string; path: string; posted?: string | null; employmentType?: string | null; location: string;
}): JsonLd => {
  const map: Record<string, string> = {
    "full-time": "FULL_TIME", "part-time": "PART_TIME", contract: "CONTRACTOR", internship: "INTERN", temporary: "TEMPORARY",
  };
  const remote = /remote/i.test(p.location);
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: p.title,
    description: p.description,
    url: absoluteUrl(p.path),
    datePosted: p.posted || undefined,
    employmentType: map[(p.employmentType || "").toLowerCase()] || "FULL_TIME",
    hiringOrganization: { "@type": "Organization", name: "Teevexa Ltd", sameAs: SITE_URL, logo: `${SITE_URL}/icon-512.png` },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: remote ? "Nairobi" : p.location, addressCountry: "KE" },
    },
    ...(remote ? { jobLocationType: "TELECOMMUTE", applicantLocationRequirements: { "@type": "Country", name: "Worldwide" } } : {}),
  };
};
