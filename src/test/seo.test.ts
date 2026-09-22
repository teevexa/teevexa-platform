import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { PAGES, INDEXABLE_PATHS, breadcrumbItems } from "../seo/routes";
import { articleLd, breadcrumbLd, faqLd, fullTitle, globalJsonLd, jobPostingLd, absoluteUrl } from "../seo/site";
import { prototypeFaqs } from "../content/faqs";

const entries = Object.entries(PAGES);

describe("page SEO data", () => {
  it("has a final title (with brand suffix) of at most 60 characters for every page", () => {
    for (const [path, m] of entries) expect(fullTitle(m.title).length, `${path} title "${fullTitle(m.title)}"`).toBeLessThanOrEqual(60);
  });

  it("has a 110-160 character description for every indexable page", () => {
    for (const [path, m] of entries) {
      if (m.noindex) continue;
      expect(m.description.length, `${path} description length`).toBeGreaterThanOrEqual(110);
      expect(m.description.length, `${path} description length`).toBeLessThanOrEqual(160);
    }
  });

  it("uses unique titles and descriptions", () => {
    const titles = entries.map(([, m]) => fullTitle(m.title));
    const descs = entries.map(([, m]) => m.description);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descs).size).toBe(descs.length);
  });

  it("mentions the brand in every title", () => {
    for (const [path, m] of entries) expect(fullTitle(m.title), path).toMatch(/Teevexa/);
  });

  it("keeps noindex pages out of the indexable list", () => {
    for (const [path, m] of entries) expect(INDEXABLE_PATHS.includes(path)).toBe(!m.noindex);
  });
});

describe("routes stay in sync with the app", () => {
  const app = readFileSync("src/App.tsx", "utf8");
  const publicBlock = app.slice(app.indexOf("{/* Public pages */}"), app.indexOf("{/* Auth */}"));
  const routes = [...publicBlock.matchAll(/<Route path="([^"]+)" element=\{(<[A-Za-z]+)/g)]
    .filter((m) => m[2] !== "<Navigate")
    .map((m) => m[1]);
  const matchesRoute = (path: string) =>
    routes.some((r) => new RegExp("^" + r.replace(/:[^/]+/g, "[^/]+") + "$").test(path));

  it("has SEO data for every static public route", () => {
    // Batch verification pages and the batch lookup input are utility pages handled separately.
    const missing = routes.filter((r) => !r.includes(":") && !PAGES[r] && r !== "/verify");
    expect(missing).toEqual([]);
  });

  it("only describes routes that exist", () => {
    for (const path of Object.keys(PAGES)) expect(matchesRoute(path), `${path} is not a route in App.tsx`).toBe(true);
  });
});

describe("service pages", () => {
  it("has SEO data for every service slug and vice versa", () => {
    const src = readFileSync("src/pages/ServiceDetail.tsx", "utf8");
    const slugs = [...src.matchAll(/^ {2}"([a-z0-9-]+)": \{$/gm)].map((m) => `/services/${m[1]}`);
    expect(slugs.length).toBeGreaterThan(3);
    const described = Object.keys(PAGES).filter((p) => p.startsWith("/services/"));
    expect(slugs.sort()).toEqual(described.sort());
  });
});

describe("structured data", () => {
  it("builds absolute breadcrumb URLs and skips the home page", () => {
    expect(breadcrumbItems("/")).toEqual([]);
    const items = breadcrumbItems("/services/ai-agents");
    expect(items.map((i) => i.name)).toEqual(["Home", "Services", "AI Agent Development"]);
    const ld = breadcrumbLd(items) as { itemListElement: { item: string; position: number }[] };
    expect(ld.itemListElement[2].item).toBe("https://www.teevexa.com/services/ai-agents");
    expect(ld.itemListElement.map((i) => i.position)).toEqual([1, 2, 3]);
  });

  it("emits Organization and WebSite globally", () => {
    const types = globalJsonLd().map((o) => JSON.stringify(o["@type"]));
    expect(types.join()).toMatch(/Organization/);
    expect(types.join()).toMatch(/WebSite/);
    expect(JSON.stringify(globalJsonLd())).toContain("hello@teevexa.com");
  });

  it("builds FAQPage data straight from the page copy", () => {
    const ld = faqLd(prototypeFaqs) as { mainEntity: { name: string }[] };
    expect(ld.mainEntity.map((q) => q.name)).toEqual(prototypeFaqs.map((f) => f.q));
  });

  it("builds Article and JobPosting data", () => {
    const a = articleLd({ title: "T", description: "D", path: "/insights/t", published: "2026-01-01" }) as Record<string, unknown>;
    expect(a["@type"]).toBe("Article");
    expect(a.image).toBe("https://www.teevexa.com/og-image.png");
    const j = jobPostingLd({ title: "Eng", description: "x", path: "/careers/eng", location: "Remote", employmentType: "full-time" }) as Record<string, unknown>;
    expect(j.employmentType).toBe("FULL_TIME");
    expect(j.jobLocationType).toBe("TELECOMMUTE");
  });

  it("uses no trailing slash in canonical URLs", () => {
    expect(absoluteUrl("/")).toBe("https://www.teevexa.com");
    expect(absoluteUrl("/about")).toBe("https://www.teevexa.com/about");
  });
});
