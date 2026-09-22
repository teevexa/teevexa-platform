import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { PAGES, breadcrumbItems } from "@/seo/routes";
import {
  DEFAULT_OG_IMAGE, LOCALE, SITE_NAME, SITE_URL, THEME_COLOR, TWITTER_HANDLE,
  absoluteUrl, breadcrumbLd, fullTitle as buildTitle, globalJsonLd, type JsonLd,
} from "@/seo/site";

interface SEOProps {
  /** Static page key from src/seo/routes.ts. Supplies title, description, noindex and structured data. */
  route?: string;
  title?: string;
  description?: string;
  /** Path (e.g. "/about"). Defaults to `route`, else the current pathname (query strings are dropped). */
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  noindex?: boolean;
  structuredData?: JsonLd | JsonLd[];
  /** Label for the last breadcrumb (dynamic pages). Pass `false` to skip breadcrumbs. */
  breadcrumb?: string | false;
  publishedAt?: string;
  modifiedAt?: string;
  author?: string;
}

export default function SEO({
  route, title, description, canonical, ogImage, ogType = "website", noindex, structuredData, breadcrumb,
  publishedAt, modifiedAt, author,
}: SEOProps) {
  const { pathname } = useLocation();
  const meta = route ? PAGES[route] : undefined;

  const rawTitle = title ?? meta?.title ?? SITE_NAME;
  const fullTitle = buildTitle(rawTitle);
  const desc = description ?? meta?.description ?? "";
  const path = canonical ?? route ?? pathname;
  const url = absoluteUrl(path);
  const hidden = noindex ?? meta?.noindex ?? false;
  const image = ogImage && /^https?:\/\//.test(ogImage) ? ogImage : ogImage ? `${SITE_URL}${ogImage}` : DEFAULT_OG_IMAGE;

  const crumbs = breadcrumb === false || hidden ? [] : breadcrumbItems(path, breadcrumb || undefined);
  const ld: JsonLd[] = [
    ...globalJsonLd(),
    ...(meta?.jsonLd ?? []),
    ...(crumbs.length > 1 ? [breadcrumbLd(crumbs)] : []),
    ...(structuredData ? (Array.isArray(structuredData) ? structuredData : [structuredData]) : []),
  ];

  return (
    <Helmet>
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta
        name="robots"
        content={hidden ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}
      />
      <meta name="theme-color" content={THEME_COLOR} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={LOCALE} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={fullTitle} />
      {image === DEFAULT_OG_IMAGE && <meta property="og:image:width" content="1200" />}
      {image === DEFAULT_OG_IMAGE && <meta property="og:image:height" content="630" />}
      {ogType === "article" && publishedAt && <meta property="article:published_time" content={publishedAt} />}
      {ogType === "article" && modifiedAt && <meta property="article:modified_time" content={modifiedAt} />}
      {ogType === "article" && author && <meta property="article:author" content={author} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={fullTitle} />

      {ld.map((obj, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(obj)}</script>
      ))}
    </Helmet>
  );
}
