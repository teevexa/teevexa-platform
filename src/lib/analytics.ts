// Consent-gated, privacy-friendly analytics (Plausible).
// Nothing loads unless (a) VITE_PLAUSIBLE_DOMAIN is set and (b) the visitor accepted analytics cookies.

const CONSENT_KEY = "teevexa_cookie_consent";
const SCRIPT_ID = "plausible-script";

type Plausible = ((event: string, opts?: { props?: Record<string, string | number | boolean> }) => void) & { q?: unknown[] };
declare global {
  interface Window { plausible?: Plausible }
}

export function analyticsAllowed(): boolean {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return !!raw && JSON.parse(raw)?.analytics === true;
  } catch {
    return false;
  }
}

export function initAnalytics(): void {
  const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined;
  if (!domain || !analyticsAllowed() || document.getElementById(SCRIPT_ID)) return;
  window.plausible =
    window.plausible ||
    (Object.assign(function (...args: unknown[]) { (window.plausible!.q = window.plausible!.q || []).push(args); }, {}) as Plausible);
  const s = document.createElement("script");
  s.id = SCRIPT_ID;
  s.defer = true;
  s.dataset.domain = domain;
  s.src = "https://plausible.io/js/script.js";
  document.head.appendChild(s);
}

export function stopAnalytics(): void {
  document.getElementById(SCRIPT_ID)?.remove();
  delete window.plausible;
}

/** Records a conversion-funnel event. Safe no-op when analytics is off. */
export function track(event: string, props?: Record<string, string | number | boolean>): void {
  if (!analyticsAllowed()) return;
  try {
    window.plausible?.(event, props ? { props } : undefined);
  } catch {
    /* never let analytics break the app */
  }
}

// React to consent changes made in the cookie banner.
if (typeof window !== "undefined") {
  window.addEventListener("teevexa:consent", () => (analyticsAllowed() ? initAnalytics() : stopAnalytics()));
  window.addEventListener("load", initAnalytics);
}
