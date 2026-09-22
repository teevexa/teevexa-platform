// FAQ copy shared by the pages and by their FAQPage structured data (so they can never disagree).

export interface Faq { q: string; a: string }

export const prototypeFaqs: Faq[] = [
  { q: "Which AI tools do you work with?", a: "Lovable, Bolt, v0, Replit, Cursor, Windsurf, Base44, ChatGPT/Claude-generated code and most React, Next.js, Vite or Flutter codebases. If you can share the code or a link, we can review it." },
  { q: "What if the prototype can't be salvaged?", a: "We tell you straight after the audit. If a rebuild of some or all of it is the better path, we'll re-quote before doing any work — you never pay for a rebuild without agreeing to it." },
  { q: "Could the price change later?", a: "Your quote sets out scope, price and timeline. If the scope changes we agree it with you first — no surprises. Third-party fees (hosting, payment providers, SMS, AI usage) are billed by those providers directly." },
  { q: "Who owns the code?", a: "You do. You get the full repository, deployment access and handover documentation." },
  { q: "How fast can you start?", a: "Typically within a week of accepting the quote. Faster scheduling is available on request." },
  { q: "What if I need more than the sprint covers?", a: "Larger scopes (many custom features, native mobile apps or enterprise systems) are quoted as custom builds. We'll tell you in your quote which path fits." },
];

export const contactFaqGroups: { group: string; items: Faq[] }[] = [
  {
    group: "Working with us",
    items: [
      {
        q: "How quickly do you respond to enquiries?",
        a: "We reply to all messages within one business day. Our core team operates on EAT (UTC+3), but we accommodate EST, CET, and PST consultations — just mention your preferred time zone when you reach out.",
      },
      {
        q: "Do you work with startups or only enterprises?",
        a: "Both. We've built MVPs for early-stage startups and scaled platforms for large enterprises. Our approach adapts to your stage — lean and fast for startups, structured and compliant for enterprises.",
      },
      {
        q: "What does a typical engagement look like?",
        a: "Most projects follow a Discovery → Design → Build → Launch cycle. We kick off with a scoping call, align on requirements and milestones, then move into iterative sprints. You'll have a dedicated project manager and access to your own client portal throughout.",
      },
    ],
  },
  {
    group: "Scope & Pricing",
    items: [
      {
        q: "How do I get a project quote?",
        a: "Use our Start a Project page: describe your idea in your own words and answer five quick questions. We review it and email you a tailored quote within 24 hours — no account needed.",
      },
      {
        q: "What is your minimum project size?",
        a: "Every project is scoped individually, so we don't publish a minimum. Send us the details and you'll receive a clear quote by email within 24 hours. Smaller retainers and advisory arrangements are also available — just ask.",
      },
      {
        q: "Do you offer ongoing maintenance after launch?",
        a: "Yes. We offer flexible retainer packages covering bug fixes, feature iterations, security patches, hosting management, and performance monitoring — so your product keeps improving after go-live.",
      },
    ],
  },
  {
    group: "Geography & Logistics",
    items: [
      {
        q: "What countries do you serve?",
        a: "We're headquartered in Nairobi, Kenya, and work remotely across Africa and with international clients in Europe and North America. No geography is off-limits — we operate entirely remote-first.",
      },
      {
        q: "Can I visit your office or meet in person?",
        a: "Absolutely. Our team is based in Nairobi and we welcome in-person meetings for local clients. For international clients, we use video calls and async tools — most clients never need to travel.",
      },
    ],
  },
];
