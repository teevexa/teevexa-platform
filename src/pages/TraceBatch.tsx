import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import {
  Shield, MapPin, Copy, Check, Share2, ExternalLink,
  ChevronRight, AlertCircle, Clock,
} from "lucide-react";

interface TraceProduct {
  id: string;
  batch_id: string;
  product_name: string;
  origin: string | null;
  created_at: string;
  updated_at: string;
}

interface TraceEvent {
  id: string;
  product_id: string;
  event_type: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  photo_url: string | null;
  recorded_at: string;
  blockchain_tx_hash: string | null;
}

function calcTrustScore(events: TraceEvent[]): number {
  if (!events.length) return 0;
  const total = events.length;
  const onChain = events.filter((e) => e.blockchain_tx_hash).length;
  const withGps = events.filter((e) => e.latitude !== null && e.longitude !== null).length;
  const distinctTypes = new Set(events.map((e) => e.event_type.toLowerCase().trim())).size;

  const onChainScore = (onChain / total) * 40;
  const gpsScore = (withGps / total) * 30;
  const continuityScore = Math.min(distinctTypes / 5, 1) * 20;
  const densityScore = Math.min(total / 5, 1) * 10;

  return Math.round(onChainScore + gpsScore + continuityScore + densityScore);
}

const EVENT_ICON_MAP: [string, string][] = [
  ["harvest", "🌱"],
  ["plant", "🌾"],
  ["wash", "💧"],
  ["dry", "☀️"],
  ["sort", "🗂️"],
  ["weigh", "⚖️"],
  ["lab", "🔬"],
  ["process", "⚙️"],
  ["packag", "📦"],
  ["inspect", "🔍"],
  ["certif", "🏅"],
  ["quality", "✅"],
  ["storag", "🏪"],
  ["transfer", "🔄"],
  ["export", "🚢"],
  ["import", "✈️"],
  ["distribut", "🏭"],
  ["deliver", "🚚"],
];

function getEventIcon(type: string): string {
  const lower = type.toLowerCase();
  for (const [key, icon] of EVENT_ICON_MAP) {
    if (lower.includes(key)) return icon;
  }
  return "📍";
}

function trustColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#84cc16";
  if (score >= 40) return "#eab308";
  if (score >= 20) return "#f97316";
  return "#ef4444";
}

function trustLabel(score: number): string {
  if (score >= 80) return "Highly Verified";
  if (score >= 60) return "Well Documented";
  if (score >= 40) return "Partially Verified";
  if (score >= 20) return "Minimal Data";
  return "Unverified";
}

function TrustRing({ score, animated }: { score: number; animated: boolean }) {
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const dash = animated ? (score / 100) * circumference : 0;
  const color = trustColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="136" height="136" viewBox="0 0 136 136" className="drop-shadow-lg">
        <circle cx="68" cy="68" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="11" />
        <circle
          cx="68" cy="68" r={r}
          fill="none"
          stroke={color}
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          strokeDashoffset={circumference / 4}
          style={{
            transition: "stroke-dasharray 1.4s cubic-bezier(0.4, 0, 0.2, 1)",
            filter: `drop-shadow(0 0 8px ${color}70)`,
          }}
        />
        <text
          x="68" y="62"
          textAnchor="middle"
          style={{ fill: color, fontSize: 30, fontWeight: 800 }}
        >
          {score}
        </text>
        <text
          x="68" y="83"
          textAnchor="middle"
          style={{ fill: "#94a3b8", fontSize: 10, letterSpacing: 1.5 }}
        >
          TRUST SCORE
        </text>
      </svg>
      <span
        className="text-xs font-semibold px-3 py-1 rounded-full"
        style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}
      >
        {trustLabel(score)}
      </span>
    </div>
  );
}

function JourneyStop({
  event,
  isLast,
}: {
  event: TraceEvent;
  isLast: boolean;
}) {
  const icon = getEventIcon(event.event_type);
  const hasChain = !!event.blockchain_tx_hash;

  return (
    <div className="flex items-start gap-0 flex-shrink-0">
      <div className="flex flex-col items-center">
        <div
          className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg border"
          style={{
            background: hasChain ? "rgba(34,197,94,0.12)" : "rgba(99,102,241,0.1)",
            borderColor: hasChain ? "rgba(34,197,94,0.3)" : "rgba(99,102,241,0.2)",
          }}
        >
          {icon}
          {hasChain && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
        </div>
        <div className="mt-2 text-center max-w-[80px]">
          <p className="text-[10px] font-semibold text-foreground leading-tight line-clamp-2">
            {event.event_type}
          </p>
          {event.location && (
            <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight line-clamp-1">
              {event.location}
            </p>
          )}
        </div>
      </div>
      {!isLast && (
        <div className="flex items-center mt-7 mx-2 flex-shrink-0">
          <div className="w-8 h-px bg-gradient-to-r from-primary/50 to-primary/10" />
          <ChevronRight size={12} className="text-primary/40 -ml-1" />
        </div>
      )}
    </div>
  );
}

function TraceSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 bg-muted/20 rounded-full mx-auto" />
      <div className="h-52 bg-muted/20 rounded-2xl" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted/20 rounded-xl" />)}
      </div>
      <div className="h-36 bg-muted/20 rounded-2xl" />
      {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-muted/20 rounded-xl" />)}
    </div>
  );
}

const POLYGONSCAN_BASE = "https://polygonscan.com/tx/";

export default function TraceBatch() {
  const { batchId } = useParams<{ batchId: string }>();
  const [product, setProduct] = useState<TraceProduct | null>(null);
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ringAnimated, setRingAnimated] = useState(false);

  useEffect(() => {
    if (!batchId) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setNotFound(false);
      setRingAnimated(false);

      const { data: productData, error: productError } = await supabase
        .from("trace_products")
        .select("*")
        .eq("batch_id", batchId)
        .single();

      if (cancelled) return;

      if (productError || !productData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProduct(productData as TraceProduct);

      const { data: eventsData } = await supabase
        .from("trace_events")
        .select("*")
        .eq("product_id", batchId)
        .order("recorded_at", { ascending: true });

      if (cancelled) return;

      setEvents((eventsData as TraceEvent[]) ?? []);
      setLoading(false);

      setTimeout(() => !cancelled && setRingAnimated(true), 120);
    };

    load();
    return () => { cancelled = true; };
  }, [batchId]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {}
  }, []);

  const handleShare = useCallback(async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: `${product.product_name} — Teevexa Trace`,
          text: `Verify the supply chain of ${product.product_name} (Batch: ${batchId})`,
          url: window.location.href,
        });
        return;
      } catch {}
    }
    handleCopy();
  }, [product, batchId, handleCopy]);

  const trustScore = calcTrustScore(events);
  const onChainEvents = events.filter((e) => e.blockchain_tx_hash);
  const gpsEvents = events.filter((e) => e.latitude !== null);
  const lastEvent = events[events.length - 1];

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero network-bg pt-8 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <TraceSkeleton />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <>
        <SEO title="Batch Not Found — Teevexa Trace" description="This product batch could not be found." />
        <div className="min-h-screen gradient-hero network-bg flex items-center justify-center pt-16 pb-16 px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={36} className="text-red-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Batch Not Found</h1>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              No product found for batch ID{" "}
              <span className="font-mono text-foreground bg-muted/30 px-1.5 py-0.5 rounded">{batchId}</span>.
              The QR code may be outdated or the ID is incorrect.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline">
                <Link to="/verify">Try Another Batch</Link>
              </Button>
              <Button asChild className="glow-primary">
                <Link to="/teevexa-trace">About Teevexa Trace</Link>
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!product) return null;

  return (
    <>
      <SEO
        title={`${product.product_name} — Verified | Teevexa Trace`}
        description={`Verify the complete supply chain of ${product.product_name} (Batch: ${product.batch_id}) from ${product.origin ?? "origin"} to destination. ${events.length} events recorded, ${onChainEvents.length} anchored on Polygon blockchain.`}
        canonical={`/trace/${product.batch_id}`}
      />

      <div className="min-h-screen gradient-hero network-bg pt-8 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">

          {/* Verification badge */}
          <div className="flex items-center justify-center gap-2 mb-5 px-4 py-2 rounded-full bg-green-500/8 border border-green-500/20 w-fit mx-auto">
            <Shield size={13} className="text-green-400" />
            <span className="text-[11px] font-semibold text-green-400 tracking-widest uppercase">Blockchain-Secured Verification</span>
          </div>

          {/* Hero card */}
          <div className="glass rounded-2xl p-6 mb-4 border border-white/8">
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold mb-1.5 gradient-text">{product.product_name}</h1>
                {product.origin && (
                  <p className="text-muted-foreground flex items-center gap-1.5 justify-center sm:justify-start mb-4">
                    <MapPin size={13} />
                    <span className="text-sm">{product.origin}</span>
                  </p>
                )}
                <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-muted/30 border border-white/6">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Batch ID</span>
                  <span className="font-mono text-sm font-bold">{product.batch_id}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2.5">
                  Registered {format(new Date(product.created_at), "MMMM d, yyyy")}
                </p>
              </div>
              <TrustRing score={trustScore} animated={ringAnimated} />
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { icon: "📋", label: "Total Events", value: String(events.length), sub: "supply chain steps" },
              {
                icon: "⛓️",
                label: "On-Chain",
                value: `${onChainEvents.length}/${events.length}`,
                sub: events.length ? `${Math.round((onChainEvents.length / events.length) * 100)}% anchored` : "none yet",
              },
              { icon: "📍", label: "GPS Tagged", value: String(gpsEvents.length), sub: "location-verified" },
              {
                icon: "🕐",
                label: "Last Updated",
                value: lastEvent
                  ? formatDistanceToNow(new Date(lastEvent.recorded_at), { addSuffix: true })
                  : "—",
                sub: lastEvent ? format(new Date(lastEvent.recorded_at), "MMM d, yyyy") : "no events",
              },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-xl p-3.5 border border-white/6">
                <div className="text-xl mb-1.5">{stat.icon}</div>
                <div className="font-bold text-sm leading-tight">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">{stat.label}</div>
                <div className="text-[9px] text-muted-foreground/60 leading-tight mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Journey flow */}
          {events.length > 0 && (
            <div className="glass rounded-2xl p-5 mb-4 border border-white/8">
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <span>🗺️</span>
                Supply Chain Journey
                <span className="ml-auto text-[10px] text-muted-foreground font-normal">
                  {events.length} {events.length === 1 ? "step" : "steps"}
                </span>
              </h2>
              <div className="overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
                <div className="flex items-start min-w-max">
                  {events.map((event, i) => (
                    <JourneyStop
                      key={event.id}
                      event={event}
                      isLast={i === events.length - 1}
                    />
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-3 flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-500 inline-flex items-center justify-center">
                  <svg width="6" height="6" viewBox="0 0 8 8" fill="none">
                    <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                Green badge = anchored on Polygon blockchain
              </p>
            </div>
          )}

          {/* Event timeline */}
          {events.length > 0 && (
            <div className="mb-4">
              <h2 className="text-sm font-semibold mb-3 px-1 flex items-center gap-2">
                <span>📜</span>
                Event Timeline
                <span className="ml-auto text-xs text-muted-foreground font-normal">{events.length} records</span>
              </h2>
              <div className="space-y-3">
                {events.map((event, i) => (
                  <div
                    key={event.id}
                    className="glass rounded-xl p-4 border border-white/6 animate-fade-in"
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 border"
                        style={{
                          background: event.blockchain_tx_hash ? "rgba(34,197,94,0.1)" : "rgba(99,102,241,0.08)",
                          borderColor: event.blockchain_tx_hash ? "rgba(34,197,94,0.25)" : "rgba(99,102,241,0.15)",
                        }}
                      >
                        {getEventIcon(event.event_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-sm">{event.event_type}</span>
                          {event.blockchain_tx_hash && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-500/12 text-green-400 border border-green-500/20 flex-shrink-0">
                              ⛓️ On-Chain
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2 flex-wrap">
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={10} />
                              {event.location}
                              {event.latitude !== null && event.longitude !== null && (
                                <a
                                  href={`https://www.google.com/maps?q=${event.latitude},${event.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline ml-1"
                                >
                                  (map)
                                </a>
                              )}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {format(new Date(event.recorded_at), "MMM d, yyyy · h:mm a")}
                          </span>
                        </div>
                        {event.notes && (
                          <p className="text-xs text-muted-foreground bg-muted/20 rounded-lg px-3 py-2 mb-2 leading-relaxed">
                            {event.notes}
                          </p>
                        )}
                        {event.photo_url && (
                          <div className="mb-2">
                            <img
                              src={event.photo_url}
                              alt={`Photo — ${event.event_type}`}
                              className="rounded-lg max-h-52 w-full object-cover border border-white/8"
                              loading="lazy"
                            />
                          </div>
                        )}
                        {event.blockchain_tx_hash && (
                          <a
                            href={`${POLYGONSCAN_BASE}${event.blockchain_tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[10px] text-green-400 hover:text-green-300 transition-colors font-mono"
                          >
                            <ExternalLink size={10} />
                            {event.blockchain_tx_hash.slice(0, 14)}…{event.blockchain_tx_hash.slice(-8)}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {events.length === 0 && (
            <div className="glass rounded-2xl p-8 mb-4 border border-white/8 text-center">
              <div className="text-4xl mb-3">📦</div>
              <p className="font-semibold mb-1">No Events Yet</p>
              <p className="text-sm text-muted-foreground">
                This batch has been registered but field events haven't been recorded yet.
              </p>
            </div>
          )}

          {/* Blockchain anchors */}
          {onChainEvents.length > 0 && (
            <div className="glass rounded-2xl p-5 mb-4 border border-green-500/15 bg-green-500/2">
              <h2 className="text-sm font-semibold mb-1 flex items-center gap-2">
                <span className="text-green-400">⛓️</span>
                Blockchain Anchors
                <span className="ml-auto text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-green-500/12 text-green-400 border border-green-500/20">
                  {onChainEvents.length} immutable records
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                These events are permanently anchored on the Polygon blockchain. They cannot be altered, deleted, or forged by anyone.
              </p>
              <div className="space-y-2">
                {onChainEvents.map((event) => (
                  <a
                    key={event.id}
                    href={`${POLYGONSCAN_BASE}${event.blockchain_tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-green-500/15 bg-green-500/5 hover:bg-green-500/10 transition-colors group"
                  >
                    <span className="text-lg flex-shrink-0">{getEventIcon(event.event_type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold">{event.event_type}</p>
                      <p className="text-[10px] font-mono text-green-400/70 truncate">
                        {event.blockchain_tx_hash}
                      </p>
                    </div>
                    <ExternalLink size={12} className="text-green-400/40 group-hover:text-green-400 flex-shrink-0 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Share section */}
          <div className="glass rounded-2xl p-5 mb-4 border border-white/8">
            <h2 className="text-sm font-semibold mb-1 flex items-center gap-2">
              <Share2 size={14} />
              Share This Verification
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Share with buyers, auditors, retailers, or certification bodies to verify this product's provenance.
            </p>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center px-3 py-2 rounded-lg bg-muted/20 border border-white/8 min-w-0">
                <span className="text-xs font-mono text-muted-foreground truncate">{window.location.href}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleCopy} className="flex-shrink-0 gap-1.5">
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                <span className="text-xs">{copied ? "Copied!" : "Copy"}</span>
              </Button>
              <Button size="sm" onClick={handleShare} className="flex-shrink-0 gap-1.5 glow-primary">
                <Share2 size={14} />
                <span className="text-xs">Share</span>
              </Button>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="text-center pt-4 pb-2">
            <p className="text-xs text-muted-foreground mb-4">
              Powered by{" "}
              <Link to="/teevexa-trace" className="text-primary hover:underline font-medium">
                Teevexa Trace
              </Link>
              {" "}— Blockchain-secured supply chain provenance
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
              <Button asChild variant="outline" size="sm">
                <Link to="/verify">Verify Another Batch</Link>
              </Button>
              <Button asChild size="sm" className="glow-primary">
                <Link to="/teevexa-trace">Get Teevexa Trace for Your Business</Link>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
