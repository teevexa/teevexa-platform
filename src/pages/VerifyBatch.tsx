import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Search, Shield } from "lucide-react";

export default function VerifyBatch() {
  const [batchId, setBatchId] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleVerify = () => {
    const trimmed = batchId.trim();
    if (!trimmed) {
      setError("Please enter a batch ID to continue.");
      return;
    }
    navigate(`/trace/${encodeURIComponent(trimmed)}`);
  };

  return (
    <>
      <SEO
        title="Verify a Product | Teevexa Trace"
        description="Enter a product batch ID to verify its supply chain journey, GPS-tracked events, and blockchain-anchored provenance records."
        canonical="/verify"
      />

      <div className="min-h-screen gradient-hero network-bg flex items-center justify-center pb-16 px-4">
        <div className="w-full max-w-lg text-center">

          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 animate-float">
            <QrCode size={36} className="text-primary" />
          </div>

          <h1 className="text-3xl font-bold gradient-text mb-2">Verify a Product</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed max-w-sm mx-auto">
            Enter the batch ID printed on the product label or embedded in the QR code to view its complete supply chain story.
          </p>

          {/* Search card */}
          <div className="glass rounded-2xl p-6 border border-white/8 mb-5 text-left">
            <label className="block text-sm font-semibold mb-1.5">Batch ID</label>
            <p className="text-xs text-muted-foreground mb-3">
              Found on the product label, packaging, or QR code (e.g. <span className="font-mono">BATCH-2024-COFFEE-001</span>)
            </p>
            <div className="flex gap-2">
              <Input
                value={batchId}
                onChange={(e) => { setBatchId(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                placeholder="Enter batch ID…"
                className="font-mono"
                autoFocus
              />
              <Button onClick={handleVerify} className="glow-primary flex-shrink-0 gap-1.5">
                <Search size={15} />
                Verify
              </Button>
            </div>
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          </div>

          {/* Trust pillars */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: "⛓️", label: "Blockchain Anchored", desc: "Tamper-proof records on Polygon" },
              { icon: "📍", label: "GPS Verified", desc: "Location-tracked at every step" },
              { icon: "🔍", label: "Audit Ready", desc: "Full chain of custody" },
            ].map((item) => (
              <div key={item.label} className="glass rounded-xl p-3.5 border border-white/6 text-center">
                <div className="text-2xl mb-1.5">{item.icon}</div>
                <p className="text-[11px] font-semibold leading-tight">{item.label}</p>
                <p className="text-[9px] text-muted-foreground leading-tight mt-1">{item.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            <Shield size={10} className="inline mr-1 mb-0.5" />
            All verification data is publicly accessible. No account required.{" "}
            <Link to="/teevexa-trace" className="text-primary hover:underline">
              Learn about Teevexa Trace →
            </Link>
          </p>

        </div>
      </div>
    </>
  );
}
