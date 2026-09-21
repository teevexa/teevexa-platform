// Shared instant-estimate engine.
// Pure TypeScript (no Deno / DOM APIs) so it runs identically in the browser
// (src/pages/StartProject.tsx) and in Supabase edge functions (intake-project).
//
// >>> INTERNAL USE ONLY. <<<
// These numbers are a guide for the Teevexa team (shown in the admin Leads page). They are NEVER shown to
// visitors: clients receive an actual quote by email within 24 hours. Placeholder values — tune freely.

export type ProjectKind =
  | "prototype"
  | "website"
  | "webapp"
  | "mobile"
  | "ecommerce"
  | "enterprise"
  | "ai"
  | "other";

export type StartingPoint = "prototype" | "existing" | "scratch";
export type Timing = "flexible" | "normal" | "rush";

export interface EstimateInput {
  kind: ProjectKind;
  startingPoint: StartingPoint;
  capabilities: string[];
  integrations: string[];
  timing: Timing;
}

export interface LineItem {
  label: string;
  low: number;
  high: number;
}

export interface Estimate {
  mode: "fixed" | "range";
  packageId: "prototype-to-production" | "custom";
  packageName: string;
  low: number;
  high: number;
  weeksLow: number;
  weeksHigh: number;
  lineItems: LineItem[];
  includes: string[];
  assumptions: string[];
}

export const KINDS: { id: ProjectKind; label: string; hint: string }[] = [
  { id: "prototype", label: "Take my AI prototype live", hint: "Built with Lovable, Bolt, v0, Replit, Cursor, ChatGPT…" },
  { id: "website", label: "Website", hint: "Company site, landing pages, content" },
  { id: "webapp", label: "Web app / SaaS", hint: "Dashboards, portals, internal tools" },
  { id: "mobile", label: "Mobile app", hint: "iOS & Android" },
  { id: "ecommerce", label: "E-commerce", hint: "Store, marketplace, subscriptions" },
  { id: "enterprise", label: "Enterprise system", hint: "ERP/CRM, workflows, data pipelines" },
  { id: "ai", label: "AI agent / automation", hint: "Assistants, chatbots, document AI" },
  { id: "other", label: "Something else", hint: "IoT, blockchain, data, …" },
];

export const STARTING_POINTS: { id: StartingPoint; label: string; hint: string }[] = [
  { id: "prototype", label: "I have an AI-built prototype", hint: "It works on screen but isn't production-ready" },
  { id: "existing", label: "I have an existing product", hint: "Needs new features, fixes or a rebuild" },
  { id: "scratch", label: "Starting from scratch", hint: "An idea, notes or wireframes" },
];

export const CAPABILITIES: { id: string; label: string; low: number; high: number; weeks: number }[] = [
  { id: "auth", label: "User accounts & login", low: 600, high: 1500, weeks: 0.5 },
  { id: "payments", label: "Payments & billing", low: 900, high: 2200, weeks: 1 },
  { id: "admin", label: "Admin dashboard", low: 1200, high: 3000, weeks: 1.5 },
  { id: "realtime", label: "Real-time / chat / notifications", low: 900, high: 2400, weeks: 1 },
  { id: "ai", label: "AI features (agents, RAG, document AI)", low: 1500, high: 4500, weeks: 2 },
  { id: "files", label: "File uploads & media", low: 400, high: 1200, weeks: 0.5 },
  { id: "reports", label: "Reports & analytics", low: 800, high: 2200, weeks: 1 },
  { id: "multi", label: "Multi-language / multi-currency", low: 600, high: 1800, weeks: 0.75 },
  { id: "offline", label: "Offline-first / low-bandwidth mode", low: 1500, high: 3800, weeks: 2 },
  { id: "roles", label: "Roles & permissions", low: 700, high: 1800, weeks: 0.75 },
];

export const INTEGRATIONS: { id: string; label: string; fixed: number; low: number; high: number; weeks: number }[] = [
  { id: "cards", label: "Cards & wallets (Stripe, PayPal, Adyen, Apple/Google Pay)", fixed: 550, low: 600, high: 1500, weeks: 0.5 },
  { id: "local", label: "Local & mobile payments (M-Pesa, Pesapal, Paystack, Flutterwave, Razorpay, UPI…)", fixed: 650, low: 700, high: 1800, weeks: 0.5 },
  { id: "whatsapp", label: "WhatsApp Business", fixed: 600, low: 800, high: 2000, weeks: 0.75 },
  { id: "messaging", label: "Email / SMS", fixed: 250, low: 300, high: 800, weeks: 0.25 },
  { id: "maps", label: "Maps & location", fixed: 300, low: 400, high: 1200, weeks: 0.25 },
  { id: "crm", label: "CRM / ERP / accounting", fixed: 800, low: 1500, high: 4500, weeks: 1.5 },
  { id: "other", label: "Another third-party API", fixed: 450, low: 600, high: 2000, weeks: 0.75 },
];

export const TIMINGS: { id: Timing; label: string; hint: string }[] = [
  { id: "rush", label: "As fast as possible", hint: "We'll prioritise scheduling" },
  { id: "normal", label: "Within 1–3 months", hint: "Standard schedule" },
  { id: "flexible", label: "No fixed date", hint: "Most cost-effective" },
];

// Rebuild-from-scratch base prices (USD) and delivery weeks.
const BASE: Record<ProjectKind, { low: number; high: number; weeksLow: number; weeksHigh: number }> = {
  prototype: { low: 5000, high: 12000, weeksLow: 5, weeksHigh: 9 }, // only used if they pick "scratch" for a prototype-ish idea
  website: { low: 2500, high: 6000, weeksLow: 3, weeksHigh: 5 },
  webapp: { low: 7000, high: 16000, weeksLow: 6, weeksHigh: 10 },
  mobile: { low: 11000, high: 24000, weeksLow: 8, weeksHigh: 14 },
  ecommerce: { low: 6500, high: 15000, weeksLow: 5, weeksHigh: 9 },
  enterprise: { low: 22000, high: 55000, weeksLow: 12, weeksHigh: 24 },
  ai: { low: 5500, high: 16000, weeksLow: 4, weeksHigh: 9 },
  other: { low: 5000, high: 18000, weeksLow: 4, weeksHigh: 10 },
};

// Existing product: modernise/extend, cheaper than a greenfield build.
const EXISTING_FACTOR = 0.7;

// ---- Fixed-price "AI prototype -> production" package ----------------------
export const PROTOTYPE_PACKAGE = {
  id: "prototype-to-production" as const,
  name: "Prototype-to-Production Sprint",
  basePrice: 2900,
  baseWeeksLow: 2,
  baseWeeksHigh: 3,
  // Above this many capabilities the scope no longer fits a fixed sprint -> quoted as custom.
  maxCapabilities: 5,
  includes: [
    "Code & architecture audit of your prototype",
    "Security hardening: auth, access rules, secrets, input validation",
    "Database, backups and data-model clean-up",
    "Production deployment, CI/CD, domain, SSL and monitoring",
    "Payment / API integrations wired to live accounts (priced below)",
    "Performance, error tracking and load sanity checks",
    "Handover docs + 30 days of post-launch support",
  ],
};

const round50 = (n: number) => Math.round(n / 50) * 50;

const uniq = (a: string[]) => [...new Set(a)];

export function computeEstimate(input: EstimateInput): Estimate {
  const capabilities = uniq(input.capabilities).filter((id) => CAPABILITIES.some((c) => c.id === id));
  const integrations = uniq(input.integrations).filter((id) => INTEGRATIONS.some((i) => i.id === id));
  const rush = input.timing === "rush";
  const capDefs = capabilities.map((id) => CAPABILITIES.find((c) => c.id === id)!);
  const intDefs = integrations.map((id) => INTEGRATIONS.find((i) => i.id === id)!);

  const startingPoint: StartingPoint = input.kind === "prototype" ? "prototype" : input.startingPoint;
  const isPrototypePath =
    startingPoint === "prototype" &&
    capDefs.length <= PROTOTYPE_PACKAGE.maxCapabilities &&
    input.kind !== "enterprise" &&
    input.kind !== "mobile";

  if (isPrototypePath) {
    const lineItems: LineItem[] = [
      { label: PROTOTYPE_PACKAGE.name, low: PROTOTYPE_PACKAGE.basePrice, high: PROTOTYPE_PACKAGE.basePrice },
      ...intDefs.map((i) => ({ label: i.label, low: i.fixed, high: i.fixed })),
    ];
    const subtotal = lineItems.reduce((s, l) => s + l.low, 0);
    const rushFee = rush ? round50(subtotal * 0.25) : 0;
    if (rushFee) lineItems.push({ label: "Rush scheduling (+25%)", low: rushFee, high: rushFee });
    const price = subtotal + rushFee;
    const extraWeeks = intDefs.reduce((s, i) => s + i.weeks, 0) * 0.5;
    const weeksLow = Math.max(1, Math.ceil((PROTOTYPE_PACKAGE.baseWeeksLow + extraWeeks) * (rush ? 0.75 : 1)));
    const weeksHigh = Math.max(weeksLow, Math.ceil((PROTOTYPE_PACKAGE.baseWeeksHigh + extraWeeks) * (rush ? 0.75 : 1)));
    return {
      mode: "fixed",
      packageId: "prototype-to-production",
      packageName: PROTOTYPE_PACKAGE.name,
      low: price,
      high: price,
      weeksLow,
      weeksHigh,
      lineItems,
      includes: PROTOTYPE_PACKAGE.includes,
      assumptions: [
        "Fixed price once we've reviewed your prototype and confirmed scope on a short call.",
        "Assumes the prototype's core flows already work; a major redesign or rebuild would be re-quoted.",
        "Third-party fees (hosting, payment providers, SMS, AI usage) are billed by those providers directly.",
      ],
    };
  }

  const base = BASE[input.kind];
  const factor = startingPoint === "existing" || startingPoint === "prototype" ? EXISTING_FACTOR : 1;
  const lineItems: LineItem[] = [
    {
      label: `${KINDS.find((k) => k.id === input.kind)?.label ?? "Project"} — core build`,
      low: round50(base.low * factor),
      high: round50(base.high * factor),
    },
    ...capDefs.map((c) => ({ label: c.label, low: c.low, high: c.high })),
    ...intDefs.map((i) => ({ label: i.label, low: i.low, high: i.high })),
  ];
  let low = lineItems.reduce((s, l) => s + l.low, 0);
  let high = lineItems.reduce((s, l) => s + l.high, 0);
  if (rush) {
    const rushLow = round50(low * 0.25);
    const rushHigh = round50(high * 0.25);
    lineItems.push({ label: "Rush scheduling (+25%)", low: rushLow, high: rushHigh });
    low += rushLow;
    high += rushHigh;
  }
  const extraWeeks =
    capDefs.reduce((s, c) => s + c.weeks, 0) * 0.6 + intDefs.reduce((s, i) => s + i.weeks, 0) * 0.6;
  const wf = rush ? 0.75 : input.timing === "flexible" ? 1.1 : 1;
  const weeksLow = Math.max(2, Math.ceil((base.weeksLow * factor + extraWeeks * 0.6) * wf));
  const weeksHigh = Math.max(weeksLow + 1, Math.ceil((base.weeksHigh * factor + extraWeeks) * wf));

  return {
    mode: "range",
    packageId: "custom",
    packageName: "Custom build",
    low,
    high,
    weeksLow,
    weeksHigh,
    lineItems,
    includes: [
      "Discovery workshop and written scope",
      "UI/UX design and clickable prototype",
      "Agile build with bi-weekly demos",
      "Security review, testing and production launch",
      "30 days of post-launch support",
    ],
    assumptions: [
      "This is a ballpark from your answers; a fixed quote follows after a short scoping call.",
      "Excludes third-party fees (hosting, payment providers, SMS, AI usage).",
      "Design/brand assets and content are assumed to be supplied by you.",
    ],
  };
}

// ---------------------------------------------------------------------------
// Heuristic brief extraction (used when no AI key is configured or AI fails).
// ---------------------------------------------------------------------------

export interface Brief {
  kind: ProjectKind;
  startingPoint: StartingPoint;
  capabilities: string[];
  integrations: string[];
  timing: Timing;
  summary: string;
}

const PROTOTYPE_RE = /\b(lovable|bolt(\.new)?|v0(\.dev)?|replit|cursor|windsurf|base44|figma make|chatgpt|claude|copilot|ai[- ]built|ai[- ]generated|prototype|vibe[- ]?cod)/i;
const KIND_RULES: [ProjectKind, RegExp][] = [
  ["ecommerce", /\b(e-?commerce|online store|shop|marketplace|checkout|cart|storefront|subscription box)\b/i],
  ["mobile", /\b(mobile app|android|ios|iphone|flutter|react native|app store|play store)\b/i],
  ["ai", /\b(ai agent|chatbot|assistant|rag|llm|gpt|automation|machine learning|nlp|copilot for)\b/i],
  ["enterprise", /\b(erp|crm|enterprise|hr system|inventory system|workflow|ministry|government|bank|hospital)\b/i],
  ["webapp", /\b(saas|dashboard|portal|web app|platform|admin panel|internal tool|booking system|management system)\b/i],
  ["website", /\b(website|landing page|blog|portfolio site|company site|web ?site)\b/i],
];
const CAP_RULES: [string, RegExp][] = [
  ["auth", /\b(log ?in|sign ?up|accounts?|users?|authentication|register)\b/i],
  ["payments", /\b(pay(ment)?s?|billing|checkout|invoice|subscription|stripe|paystack|flutterwave)\b/i],
  ["admin", /\b(admin|back ?office|dashboard|moderat)/i],
  ["realtime", /\b(real[- ]?time|live chat|chat|notifications?|push)\b/i],
  ["ai", /\b(ai|gpt|llm|rag|agent|recommend|classification|summariz)/i],
  ["files", /\b(upload|files?|documents?|images?|photos?|media|video)\b/i],
  ["reports", /\b(reports?|analytics|insights|charts?|kpi|export)\b/i],
  ["multi", /\b(multi[- ]?(language|lingual|currency)|swahili|french|translate|i18n|currenc)/i],
  ["offline", /\b(offline|low[- ]bandwidth|poor connectivity|rural)\b/i],
  ["roles", /\b(roles?|permissions?|teams?|staff|managers?|agents?)\b/i],
];
const INT_RULES: [string, RegExp][] = [
  ["cards", /\b(stripe|paypal|adyen|square|braintree|checkout\.com|apple pay|google pay|visa|mastercard|card payments?)\b/i],
  ["local", /\b(m-?pesa|daraja|pesapal|paystack|flutterwave|razorpay|upi|mobile money|airtel money|mtn momo|momo|mercadopago|pix|ideal|klarna)\b/i],
  ["whatsapp", /\bwhats ?app\b/i],
  ["messaging", /\b(sms|email notifications?|newsletter|twilio|sendgrid|africa'?s talking)\b/i],
  ["maps", /\b(maps?|gps|location|geolocation|delivery tracking)\b/i],
  ["crm", /\b(crm|erp|quickbooks|xero|odoo|salesforce|hubspot|zoho|sap)\b/i],
];

const clean = (s: string) => s.replace(/\s+/g, " ").trim();

export function heuristicBrief(description: string): Brief {
  const text = description || "";
  const hasPrototype = PROTOTYPE_RE.test(text);
  let kind: ProjectKind = "other";
  for (const [k, re] of KIND_RULES) {
    if (re.test(text)) {
      kind = k;
      break;
    }
  }
  if (hasPrototype && kind === "other") kind = "webapp";
  const capabilities = CAP_RULES.filter(([, re]) => re.test(text)).map(([id]) => id).slice(0, 6);
  const integrations = INT_RULES.filter(([, re]) => re.test(text)).map(([id]) => id);
  const timing: Timing = /\b(asap|urgent|immediately|this week|next week|deadline|launch (in|by))\b/i.test(text)
    ? "rush"
    : "normal";
  const startingPoint: StartingPoint = hasPrototype
    ? "prototype"
    : /\b(existing|already (have|built)|legacy|rebuild|migrate|revamp)\b/i.test(text)
      ? "existing"
      : "scratch";
  return {
    kind: hasPrototype && kind === "other" ? "webapp" : kind,
    startingPoint,
    capabilities,
    integrations,
    timing,
    summary: clean(text).slice(0, 280),
  };
}

// Whitelist-sanitise any brief (from AI or from the client) before it is trusted.
export function sanitizeBrief(raw: Partial<Brief> | null | undefined, fallbackText = ""): Brief {
  const fb = heuristicBrief(fallbackText);
  const b = raw || {};
  const kind = KINDS.some((k) => k.id === b.kind) ? (b.kind as ProjectKind) : fb.kind;
  const startingPoint = STARTING_POINTS.some((s) => s.id === b.startingPoint) ? (b.startingPoint as StartingPoint) : fb.startingPoint;
  const timing = TIMINGS.some((t) => t.id === b.timing) ? (b.timing as Timing) : fb.timing;
  const caps = Array.isArray(b.capabilities) ? b.capabilities : fb.capabilities;
  // "mpesa" was folded into the broader "local" payments option
  const ints = (Array.isArray(b.integrations) ? b.integrations : fb.integrations).map((i) => (i === "mpesa" ? "local" : i));
  return {
    kind,
    startingPoint,
    timing,
    capabilities: uniq(caps.filter((c) => CAPABILITIES.some((x) => x.id === c))),
    integrations: uniq(ints.filter((c) => INTEGRATIONS.some((x) => x.id === c))),
    summary: clean(String(b.summary ?? fb.summary)).slice(0, 400),
  };
}

export const formatUsd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

export function formatPrice(e: Estimate): string {
  return e.mode === "fixed" ? formatUsd(e.low) : `${formatUsd(e.low)} – ${formatUsd(e.high)}`;
}

export function formatWeeks(e: Estimate): string {
  return e.weeksLow === e.weeksHigh ? `${e.weeksLow} weeks` : `${e.weeksLow}–${e.weeksHigh} weeks`;
}

// Map estimate/brief values onto the legacy text columns the admin UI already shows.
export function budgetLabel(e: Estimate): string {
  return e.mode === "fixed" ? `Internal: ${formatUsd(e.low)} fixed` : `Internal: ${formatPrice(e)}`;
}
export function timelineLabel(e: Estimate): string {
  return `Internal: ${formatWeeks(e)}`;
}
export function legacyProjectType(kind: ProjectKind): string {
  return kind === "webapp" ? "website" : kind === "ai" || kind === "prototype" || kind === "other" ? "custom" : kind;
}
