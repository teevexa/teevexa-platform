import { useState } from "react";
import { Copy, Check, Code, Zap, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import SectionHeading from "@/components/SectionHeading";

function CodeBlock({ code, lang = "json" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="relative rounded-xl border border-border/60 overflow-hidden bg-[#0d1117] font-mono text-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-white/4 border-b border-border/40">
        <span className="text-xs text-muted-foreground">{lang}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-green-300 leading-relaxed whitespace-pre-wrap">{code}</pre>
    </div>
  );
}

const endpoint = "https://xxxx.supabase.co/functions/v1/batch-verify";

const curlExample = `curl -X GET \\
  "${endpoint}?batchId=TEEVEXA-ABC123" \\
  -H "X-Teevexa-API-Key: tkvx_your_api_key_here"`;

const responseExample = `{
  "batch_id": "TEEVEXA-ABC123",
  "product_name": "Mombasa Arabica Coffee",
  "origin": "Nyeri, Kenya",
  "trust_score": 87,
  "total_events": 6,
  "on_chain_events": 5,
  "verified": true,
  "public_url": "https://teevexa.com/trace/TEEVEXA-ABC123",
  "events": [
    {
      "event_type": "harvest",
      "location": "Nyeri Farm, Kenya",
      "recorded_at": "2026-04-01T08:00:00Z",
      "gps_tagged": true,
      "has_photo": true,
      "blockchain_tx_hash": "0xabc123...",
      "polygonscan_url": "https://polygonscan.com/tx/0xabc123..."
    }
  ]
}`;

const jsExample = `// Node.js / browser fetch
const res = await fetch(
  "https://teevexa.com/functions/v1/batch-verify?batchId=TEEVEXA-ABC123",
  {
    headers: {
      "X-Teevexa-API-Key": process.env.TEEVEXA_API_KEY,
    },
  }
);
const data = await res.json();
console.log(data.trust_score); // 87
console.log(data.verified);    // true`;

const errorCodes = [
  { code: "200", desc: "OK — batch found, data returned" },
  { code: "400", desc: "Bad Request — missing batchId parameter" },
  { code: "401", desc: "Unauthorized — invalid or revoked API key" },
  { code: "404", desc: "Not Found — batch ID does not exist" },
  { code: "429", desc: "Too Many Requests — rate limit exceeded" },
  { code: "500", desc: "Internal Server Error" },
];

export default function ApiDocs() {
  return (
    <>
      <SEO
        title="API Documentation — Teevexa Trace"
        description="Teevexa Trace REST API for batch provenance verification. Integrate supply chain transparency into your retail, logistics, or compliance workflows."
        canonical="/api-docs"
      />

      {/* Hero */}
      <section className="relative py-20 px-4 gradient-hero network-bg overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-primary/8 blur-3xl animate-pulse-glow" />
        </div>
        <div className="container mx-auto max-w-3xl text-center relative z-10 animate-fade-in">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            Developer API
          </span>
          <h1 className="text-4xl sm:text-5xl font-display font-bold leading-tight">
            Teevexa Trace <span className="gradient-text">REST API</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            Verify batch provenance, trust scores, and blockchain anchors programmatically. Integrate supply chain transparency into any workflow.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <span className="glass rounded-full px-3 py-1.5 text-xs font-medium text-primary border border-primary/30">
              REST / JSON
            </span>
            <span className="glass rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground border border-border">
              API Key Auth
            </span>
            <span className="glass rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground border border-border">
              60 req/min
            </span>
          </div>
        </div>
      </section>

      {/* Quick features */}
      <section className="py-16 px-4 section-teal">
        <div className="container mx-auto max-w-4xl">
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Blockchain Verified", desc: "Each event response includes the Polygon tx hash and a direct Polygonscan link." },
              { icon: Zap, title: "Real-Time Data", desc: "Responses reflect live supply chain data — no cache delay." },
              { icon: Globe, title: "CORS Enabled", desc: "Call directly from browser frontends, mobile apps, or server-side." },
            ].map((f) => (
              <div key={f.title} className="glass rounded-2xl p-5 flex flex-col gap-3">
                <f.icon size={22} className="text-primary" />
                <h4 className="font-semibold text-sm">{f.title}</h4>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Authentication */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <SectionHeading align="left" label="Authentication" title="API Key Setup" />
          <div className="mt-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              API keys are available on the <strong className="text-foreground">Growth</strong> and{" "}
              <strong className="text-foreground">Enterprise</strong> plans. Generate and manage keys from your{" "}
              <a href="/teevexa-trace" className="text-primary hover:underline">Teevexa Trace Dashboard</a>.
            </p>
            <p>
              Pass the key in the <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs font-mono">X-Teevexa-API-Key</code> request header.
              Keys begin with <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs font-mono">tkvx_</code>.
            </p>
          </div>
        </div>
      </section>

      {/* Endpoint */}
      <section className="py-6 px-4 section-card">
        <div className="container mx-auto max-w-3xl">
          <SectionHeading align="left" label="Endpoint" title="GET /batch-verify" />
          <div className="mt-6 space-y-2">
            <div className="flex items-center gap-3 glass rounded-xl px-4 py-3 border border-border">
              <Code size={14} className="text-primary shrink-0" />
              <span className="font-mono text-sm text-primary break-all">
                GET /functions/v1/batch-verify?batchId={"{batchId}"}
              </span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <h4 className="text-sm font-semibold">Query Parameters</h4>
            <div className="glass rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-white/4">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Parameter</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Type</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Required</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs text-primary">batchId</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">string</td>
                    <td className="px-4 py-3 text-xs text-green-400">Yes</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">The batch ID printed on the product QR code</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <h4 className="text-sm font-semibold">Request Example (cURL)</h4>
            <CodeBlock code={curlExample} lang="bash" />
          </div>

          <div className="mt-8 space-y-4">
            <h4 className="text-sm font-semibold">Request Example (JavaScript)</h4>
            <CodeBlock code={jsExample} lang="javascript" />
          </div>

          <div className="mt-8 space-y-4">
            <h4 className="text-sm font-semibold">Response Example (200 OK)</h4>
            <CodeBlock code={responseExample} lang="json" />
          </div>
        </div>
      </section>

      {/* Response fields */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <SectionHeading align="left" label="Response" title="Response Fields" />
          <div className="mt-6 glass rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-white/4">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Field</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Type</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {[
                  ["batch_id", "string", "The batch identifier"],
                  ["product_name", "string", "Product name set by the producer"],
                  ["origin", "string | null", "Country or region of origin"],
                  ["trust_score", "number (0–100)", "Calculated trust score based on on-chain ratio, GPS coverage, and event density"],
                  ["total_events", "number", "Total supply chain events recorded"],
                  ["on_chain_events", "number", "Events anchored to the Polygon blockchain"],
                  ["verified", "boolean", "true if at least one event is on-chain"],
                  ["public_url", "string", "Consumer-facing verification page URL"],
                  ["events[].event_type", "string", "harvest | processing | transport | ..."],
                  ["events[].blockchain_tx_hash", "string | null", "Polygon tx hash (null if not yet anchored)"],
                  ["events[].polygonscan_url", "string | null", "Direct Polygonscan link for the anchor tx"],
                ].map(([field, type, desc]) => (
                  <tr key={field}>
                    <td className="px-4 py-3 font-mono text-xs text-primary">{field}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{type}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Error codes */}
      <section className="py-16 px-4 section-card">
        <div className="container mx-auto max-w-3xl">
          <SectionHeading align="left" label="Errors" title="HTTP Status Codes" />
          <div className="mt-6 space-y-2">
            {errorCodes.map((e) => (
              <div key={e.code} className="glass rounded-xl border border-border px-4 py-3 flex items-center gap-4">
                <span className={`font-mono text-sm font-bold w-10 shrink-0 ${
                  e.code === "200" ? "text-green-400"
                  : e.code.startsWith("4") ? "text-amber-400"
                  : "text-red-400"
                }`}>{e.code}</span>
                <span className="text-sm text-muted-foreground">{e.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <SectionHeading
            title="Ready to Integrate?"
            description="Get an API key by upgrading to a paid plan or contacting our team for enterprise access."
          />
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="glow-primary text-base px-8" asChild>
              <a href="/pricing">Get API Access</a>
            </Button>
            <Button variant="outline" size="lg" className="text-base px-8" asChild>
              <a href="/contact">Contact Enterprise Sales</a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
