import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, X, Zap, ArrowRight, Shield, Globe, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import SectionHeading from "@/components/SectionHeading";

const tiers = [
  {
    id: "beta",
    label: "Beta",
    badge: "Current",
    badgeColor: "bg-primary/20 text-primary border border-primary/30",
    price: "Free",
    period: "",
    description: "Full platform access during the beta period. No credit card required.",
    cta: "Currently Active",
    ctaVariant: "outline" as const,
    ctaDisabled: true,
    ctaHref: null,
    highlight: false,
    features: [
      { label: "Unlimited batches", included: true },
      { label: "Unlimited field agents", included: true },
      { label: "QR verification pages", included: true },
      { label: "Real-time dashboard", included: true },
      { label: "Blockchain anchoring", included: true },
      { label: "Analytics & reports", included: true },
      { label: "Certificate downloads", included: true },
      { label: "API access", included: false },
      { label: "White-label", included: false },
      { label: "SLA & dedicated support", included: false },
    ],
  },
  {
    id: "starter",
    label: "Starter",
    badge: null,
    badgeColor: "",
    price: "$29",
    period: "/month",
    description: "For small producers and exporters just getting started with traceability.",
    cta: "Notify Me",
    ctaVariant: "outline" as const,
    ctaDisabled: false,
    ctaHref: "/contact",
    highlight: false,
    features: [
      { label: "500 batches / month", included: true },
      { label: "5 field agents", included: true },
      { label: "QR verification pages", included: true },
      { label: "Real-time dashboard", included: true },
      { label: "Blockchain anchoring", included: true },
      { label: "Analytics & reports", included: false },
      { label: "Certificate downloads", included: true },
      { label: "API access", included: false },
      { label: "White-label", included: false },
      { label: "SLA & dedicated support", included: false },
    ],
  },
  {
    id: "growth",
    label: "Growth",
    badge: "Most Popular",
    badgeColor: "bg-accent/20 text-accent border border-accent/30",
    price: "$99",
    period: "/month",
    description: "For scaling businesses that need full analytics and a larger field team.",
    cta: "Notify Me",
    ctaVariant: "default" as const,
    ctaDisabled: false,
    ctaHref: "/contact",
    highlight: true,
    features: [
      { label: "5,000 batches / month", included: true },
      { label: "25 field agents", included: true },
      { label: "QR verification pages", included: true },
      { label: "Real-time dashboard", included: true },
      { label: "Blockchain anchoring", included: true },
      { label: "Analytics & reports", included: true },
      { label: "Certificate downloads", included: true },
      { label: "API access (read-only)", included: true },
      { label: "White-label", included: false },
      { label: "SLA & dedicated support", included: false },
    ],
  },
  {
    id: "enterprise",
    label: "Enterprise",
    badge: null,
    badgeColor: "",
    price: "Custom",
    period: "",
    description: "Unlimited scale, white-label branding, SLA, and dedicated onboarding.",
    cta: "Contact Sales",
    ctaVariant: "outline" as const,
    ctaDisabled: false,
    ctaHref: "/contact",
    highlight: false,
    features: [
      { label: "Unlimited batches", included: true },
      { label: "Unlimited field agents", included: true },
      { label: "QR verification pages", included: true },
      { label: "Real-time dashboard", included: true },
      { label: "Blockchain anchoring", included: true },
      { label: "Analytics & reports", included: true },
      { label: "Certificate downloads", included: true },
      { label: "Full API access", included: true },
      { label: "White-label", included: true },
      { label: "SLA & dedicated support", included: true },
    ],
  },
];

const faqs = [
  {
    q: "When does billing go live?",
    a: "We are currently in public beta — all features are free. We will announce a billing launch date well in advance and give every beta user time to choose a plan before any charges apply.",
  },
  {
    q: "What happens when my beta access expires?",
    a: "Your data stays safe. You will receive reminder emails before expiry. If you haven't upgraded, your account moves to a read-only state — no data is deleted.",
  },
  {
    q: "How does blockchain anchoring work?",
    a: "When a field agent logs a supply chain event, we anchor a cryptographic hash of that record to the Polygon blockchain. This creates a tamper-proof, publicly verifiable timestamp that appears on the product's consumer verification page.",
  },
  {
    q: "Can I upgrade or downgrade at any time?",
    a: "Yes. You can change your plan at any time. Upgrades are immediate; downgrades take effect at the start of the next billing period.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We support M-Pesa, card (Visa/Mastercard), and bank transfer via Flutterwave for African markets, and international card payments for global clients.",
  },
  {
    q: "Do you offer a free trial for paid plans?",
    a: "Every new account starts on the free Beta plan with unlimited access. Paid plans will launch after the beta period ends.",
  },
];

export default function Pricing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <SEO
        title="Pricing — Teevexa Trace"
        description="Simple, transparent pricing for Teevexa Trace supply chain provenance platform. Free during beta. Starter, Growth, and Enterprise plans launching soon."
        canonical="/pricing"
      />

      {/* Hero */}
      <section className="relative py-24 px-4 gradient-hero network-bg overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full bg-primary/8 blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-accent/7 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        </div>
        <div className="container mx-auto max-w-3xl text-center relative z-10 animate-fade-in">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            Transparent Pricing
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold leading-tight">
            Scale Your <span className="gradient-text">Traceability</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            All features are free during our beta period. Paid plans launch soon — register now and lock in early pricing.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm text-primary font-medium">
            <Zap size={14} className="text-primary" />
            Beta is live — no credit card required
          </div>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="py-20 px-4 section-card">
        <div className="container mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
                  tier.highlight
                    ? "glass border-primary/40 shadow-lg shadow-primary/10 scale-[1.02]"
                    : "glass border-border hover:border-primary/30"
                }`}
              >
                {tier.badge && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${tier.badgeColor}`}>
                    {tier.badge}
                  </span>
                )}

                <div className="mb-6">
                  <h3 className="font-display font-bold text-xl mb-1">{tier.label}</h3>
                  <div className="flex items-end gap-0.5 mb-3">
                    <span className={`text-3xl font-display font-bold ${tier.highlight ? "gradient-text" : "text-foreground"}`}>
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span className="text-muted-foreground text-sm mb-1">{tier.period}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tier.description}</p>
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {tier.features.map((f) => (
                    <li key={f.label} className="flex items-center gap-2.5 text-sm">
                      {f.included ? (
                        <Check size={14} className="text-primary shrink-0" />
                      ) : (
                        <X size={14} className="text-muted-foreground/40 shrink-0" />
                      )}
                      <span className={f.included ? "text-foreground" : "text-muted-foreground/50"}>
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>

                {tier.ctaHref ? (
                  <Button
                    variant={tier.ctaVariant}
                    className={`w-full ${tier.highlight ? "glow-primary" : ""}`}
                    asChild
                  >
                    <Link to={tier.ctaHref}>
                      {tier.cta} <ArrowRight size={14} className="ml-1.5" />
                    </Link>
                  </Button>
                ) : (
                  <Button variant={tier.ctaVariant} className="w-full" disabled={tier.ctaDisabled}>
                    {tier.cta}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-16 px-4 section-teal">
        <div className="container mx-auto max-w-4xl">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: Shield, title: "No Hidden Fees", desc: "The price you see is what you pay. No setup fees, no overage surprises." },
              { icon: Globe, title: "African-First Payments", desc: "M-Pesa, card, and bank transfer. Built for Kenyan and East African businesses." },
              { icon: Zap, title: "Instant Activation", desc: "Your account is active the moment you sign up. Start tracking immediately." },
            ].map((s) => (
              <div key={s.title} className="glass rounded-2xl p-6 flex flex-col items-center gap-3">
                <s.icon size={28} className="text-primary" />
                <h4 className="font-semibold">{s.title}</h4>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <SectionHeading label="FAQ" title="Frequently Asked Questions" />
          <div className="mt-10 space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="glass rounded-xl border border-border overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium hover:text-primary transition-colors gap-4"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{faq.q}</span>
                  <HelpCircle
                    size={16}
                    className={`shrink-0 transition-transform ${openFaq === i ? "rotate-180 text-primary" : "text-muted-foreground"}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 section-card">
        <div className="container mx-auto max-w-2xl text-center">
          <SectionHeading
            title="Ready to Get Started?"
            description="Join the beta today and get full access to Teevexa Trace at no cost. No credit card required."
          />
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="glow-primary text-base px-8" asChild>
              <Link to="/teevexa-trace">
                Join Beta Free <ArrowRight className="ml-2" size={18} />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-base px-8" asChild>
              <Link to="/contact">Talk to Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
