import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Cookie, ChevronDown, ChevronUp, Shield, BarChart2, Settings2, Megaphone } from "lucide-react";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
}

const STORAGE_KEY = "teevexa_cookie_consent";

function loadPrefs(): CookiePreferences | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookiePreferences;
  } catch {
    return null;
  }
}

function savePrefs(prefs: CookiePreferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // localStorage unavailable — fail silently
  }
}

const NECESSARY: CookiePreferences = { necessary: true, analytics: false, functional: false, marketing: false };
const ALL: CookiePreferences = { necessary: true, analytics: true, functional: true, marketing: true };

const CATEGORIES = [
  {
    key: "necessary" as const,
    icon: Shield,
    label: "Strictly Necessary",
    description: "Essential for the site to function — session management, security, and the client portal. Cannot be disabled.",
    locked: true,
  },
  {
    key: "analytics" as const,
    icon: BarChart2,
    label: "Analytical",
    description: "Help us understand how visitors use our site so we can improve it. Data is aggregated and anonymized.",
    locked: false,
  },
  {
    key: "functional" as const,
    icon: Settings2,
    label: "Functional",
    description: "Remember your preferences (language, theme, layout) across visits for a more personalized experience.",
    locked: false,
  },
  {
    key: "marketing" as const,
    icon: Megaphone,
    label: "Marketing",
    description: "Used to deliver relevant advertising and measure campaign effectiveness. Only set with explicit consent.",
    locked: false,
  },
];

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>({ ...NECESSARY });

  useEffect(() => {
    const saved = loadPrefs();
    if (!saved) {
      // Slight delay so the page renders first
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = (p: CookiePreferences) => {
    savePrefs(p);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 flex justify-center"
    >
      <div className="w-full max-w-2xl bg-card border border-border/60 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Cookie size={17} className="text-primary" />
            </div>
            <div>
              <p className="font-display font-bold text-foreground text-sm">We use cookies</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                To improve your experience, analyze traffic, and remember your preferences.{" "}
                <Link to="/legal/cookies" className="text-primary hover:underline" onClick={() => setVisible(false)}>
                  Cookie Policy
                </Link>
              </p>
            </div>
          </div>
          <button
            onClick={() => accept(NECESSARY)}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Close and accept only necessary cookies"
          >
            <X size={16} />
          </button>
        </div>

        {/* Expandable settings */}
        <div className="border-t border-border/30">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center justify-between w-full px-5 py-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Customize cookie settings</span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {expanded && (
            <div className="px-5 pb-4 space-y-3 max-h-60 overflow-y-auto">
              {CATEGORIES.map(({ key, icon: Icon, label, description, locked }) => (
                <div key={key} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={13} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground">{label}</p>
                      {locked ? (
                        <span className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">Always on</span>
                      ) : (
                        <button
                          role="switch"
                          aria-checked={prefs[key]}
                          onClick={() => setPrefs((p) => ({ ...p, [key]: !p[key] }))}
                          className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
                            prefs[key] ? "bg-primary" : "bg-muted-foreground/30"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                              prefs[key] ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5 px-5 py-4 border-t border-border/30 bg-muted/10">
          {expanded ? (
            <>
              <button
                onClick={() => accept(NECESSARY)}
                className="flex-1 text-xs font-semibold py-2.5 px-4 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
              >
                Necessary Only
              </button>
              <button
                onClick={() => accept(prefs)}
                className="flex-1 text-xs font-semibold py-2.5 px-4 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Save Preferences
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => accept(NECESSARY)}
                className="flex-1 text-xs font-semibold py-2.5 px-4 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
              >
                Necessary Only
              </button>
              <button
                onClick={() => { setExpanded(true); }}
                className="flex-1 text-xs font-semibold py-2.5 px-4 rounded-lg border border-border/60 text-foreground hover:bg-muted/40 transition-colors"
              >
                Cookie Settings
              </button>
              <button
                onClick={() => accept(ALL)}
                className="flex-1 text-xs font-semibold py-2.5 px-4 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Accept All
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
