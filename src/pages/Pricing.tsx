import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Globe, HelpCircle, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import SectionHeading from "@/components/SectionHeading";
import PlayStoreButton from "@/components/PlayStoreButton";
import { FIELD_PLAY_URL, TRACE_PLAY_URL } from "@/lib/links";

const freeIncludes = [
  "Teevexa Trace and Teevexa Field, both on Google Play",
  "Batch tracking, QR verification pages and the real-time dashboard",
  "Offline-first field logging with GPS and photo evidence",
  "Certificates and compliance reports",
  "Public batch verification for your buyers",
];

const enterpriseIncludes = [
  "API access and integrations with your ERP or retail systems",
  "White-label or on-premise deployment",
  "Onboarding and training for your field teams",
  "Custom compliance reporting",
  "Priority support",
];

const faqs = [
  {
    q: "Is Teevexa Trace really free?",
    a: "Yes. Teevexa Trace and Teevexa Field are free to use while we launch. There is no credit card and no trial clock.",
  },
  {
    q: "Will it always be free?",
    a: "We plan to introduce paid plans later, once the products are established. When that happens, existing users will get clear advance notice, and your data will never be deleted or held back.",
  },
  {
    q: "How does blockchain anchoring work?",
    a: "When a field agent logs a supply chain event, we anchor a cryptographic hash of that record to the Polygon blockchain, creating a publicly verifiable timestamp that shows on the product's consumer-facing verification page. Anchoring is being rolled out progressively.",
  },
  {
    q: "Do I need Teevexa Field as well as Teevexa Trace?",
    a: "Field agents use Teevexa Field to log events, even offline. Producers, exporters and buyers use Teevexa Trace to see the results and verify batches. Both are free.",
  },
  {
    q: "I need an API, white-labelling or on-premise deployment.",
    a: "Get in touch. We work with larger organisations on custom setups and will scope it with you.",
  },
];

export default function Pricing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <SEO route="/pricing" />

      <section className="relative py-24  gradient-hero network-bg overflow-hidden">
        <div className="container mx-auto text-center relative z-10 animate-fade-in">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-4">Pricing</span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold leading-tight">
            Free while we <span className="gradient-text">launch</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Teevexa Trace and Teevexa Field cost nothing to use today. Download the apps and start tracing your supply chain.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <PlayStoreButton href={TRACE_PLAY_URL} app="Teevexa Trace" />
            <PlayStoreButton href={FIELD_PLAY_URL} app="Teevexa Field" variant="outline" />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Trace: for producers, exporters and buyers · Field: for field agents</p>
        </div>
      </section>

      <section className="py-20  section-card">
        <div className="container mx-auto grid md:grid-cols-2 gap-6">
          <div className="glass rounded-2xl border border-primary/40 p-8 shadow-lg shadow-primary/10 relative">
            <span className="absolute -top-3 left-6 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">Available now</span>
            <h2 className="font-display font-bold text-2xl">Free during launch</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-6">Everything you need to start tracing.</p>
            <ul className="space-y-3">
              {freeIncludes.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm"><Check size={15} className="text-primary mt-0.5 shrink-0" />{f}</li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-2xl border border-border p-8">
            <h2 className="font-display font-bold text-2xl">Enterprise & integrations</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-6">For larger organisations with custom needs.</p>
            <ul className="space-y-3 mb-8">
              {enterpriseIncludes.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm"><Check size={15} className="text-primary mt-0.5 shrink-0" />{f}</li>
              ))}
            </ul>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/contact">Talk to us <ArrowRight size={14} className="ml-1.5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16  section-teal">
        <div className="container mx-auto">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: Shield, title: "Your data stays yours", desc: "Your records are never sold, and never deleted if plans change." },
              { icon: Globe, title: "Built for the field", desc: "Offline-first, so agents can log events even without a connection." },
              { icon: Zap, title: "Start in minutes", desc: "Download the app, create an account and log your first batch." },
            ].map((s) => (
              <div key={s.title} className="glass rounded-2xl p-6 flex flex-col items-center gap-3">
                <s.icon size={28} className="text-primary" />
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto">
          <SectionHeading label="FAQ" title="Frequently Asked Questions" />
          <div className="mt-10 space-y-3">
            {faqs.map((faq, i) => (
              <div key={faq.q} className="glass rounded-xl border border-border overflow-hidden">
                <button
                  type="button"
                  aria-expanded={openFaq === i}
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium hover:text-primary transition-colors gap-4"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{faq.q}</span>
                  <HelpCircle size={16} className={`shrink-0 transition-transform ${openFaq === i ? "rotate-180 text-primary" : "text-muted-foreground"}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-3">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
