import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const DISMISSED_KEY = "teevexa_portal_beta_banner_dismissed_v1";
const URGENT_DAYS = 7;

interface UsageStats {
  tier: string;
  beta_days_remaining: number | null;
}

export function BetaBanner() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(DISMISSED_KEY);
    if (stored === "true") {
      setDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (!user || dismissed) return;

    supabase
      .from("trace_usage_stats")
      .select("tier, beta_days_remaining")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setStats(data as UsageStats);
          if (
            data.tier === "beta" &&
            data.beta_days_remaining !== null &&
            data.beta_days_remaining <= 30
          ) {
            setVisible(true);
          }
        }
      });
  }, [user, dismissed]);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "true");
    setDismissed(true);
  };

  if (!visible || !stats) return null;

  const days = stats.beta_days_remaining ?? 0;
  const isUrgent = days <= URGENT_DAYS;

  const message =
    days === 0
      ? "Your beta access expires today."
      : days === 1
      ? "Your beta access expires tomorrow."
      : `Your beta access expires in ${days} day${days !== 1 ? "s" : ""}.`;

  return (
    <div
      className={`mx-6 lg:mx-8 mb-4 rounded-xl border px-4 py-3 flex items-center justify-between gap-3 transition-all ${
        isUrgent
          ? "bg-red-500/10 border-red-500/30"
          : "bg-amber-500/10 border-amber-500/30"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {isUrgent ? (
          <AlertTriangle size={18} className="text-red-400 shrink-0" />
        ) : (
          <Clock size={18} className="text-amber-400 shrink-0" />
        )}
        <div className="min-w-0">
          <span
            className={`text-sm font-semibold ${isUrgent ? "text-red-400" : "text-amber-400"}`}
          >
            Beta Ending Soon&nbsp;—&nbsp;
          </span>
          <span className="text-sm text-muted-foreground">
            {message} Upgrade to keep full access.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          to="/pricing"
          className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
            isUrgent
              ? "border-red-400/60 text-red-400 hover:bg-red-400/10"
              : "border-amber-400/60 text-amber-400 hover:bg-amber-400/10"
          }`}
        >
          Upgrade
        </Link>
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
