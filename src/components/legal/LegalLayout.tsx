import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ArrowUp, Printer } from "lucide-react";

export interface TocSection {
  id: string;
  label: string;
}

interface LegalLayoutProps {
  title: string;
  subtitle?: string;
  lastUpdated: string;
  sections: TocSection[];
  children: React.ReactNode;
}

export function LegalLayout({ title, subtitle, lastUpdated, sections, children }: LegalLayoutProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (sections.length === 0) return;

    const OFFSET = 100;

    const updateActive = () => {
      let current = sections[0].id;
      for (const { id } of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= OFFSET) current = id;
      }
      setActiveId(current);
    };

    window.addEventListener("scroll", updateActive, { passive: true });
    updateActive();
    return () => window.removeEventListener("scroll", updateActive);
  }, [sections]);

  const scrollToSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    /* pt-20 accounts for fixed navbar on screen; print:pt-8 removes it for PDF */
    <div className="min-h-screen pt-20 pb-24 print:pt-8 print:pb-8 print:min-h-0">

      {/* ── Document header ── */}
      <div className="border-b border-border/30 bg-gradient-to-b from-background via-background to-card/20 print:bg-white print:border-slate-200">
        <div className="container mx-auto px-4 lg:px-8 py-12 max-w-7xl print:py-6">

          {/* Breadcrumb — hide in print (redundant in a saved PDF) */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 flex-wrap print:hidden">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={12} className="flex-shrink-0" />
            <span className="text-foreground/60">Legal</span>
            <ChevronRight size={12} className="flex-shrink-0" />
            <span className="text-primary font-medium">{title}</span>
          </nav>

          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2">Legal Document</p>
              <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground leading-tight">{title}</h1>
              {subtitle && <p className="mt-2 text-muted-foreground text-sm max-w-lg">{subtitle}</p>}
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span>Last updated: <span className="font-semibold text-foreground/70">{lastUpdated}</span></span>
                <span className="text-border/80">·</span>
                <span>{sections.length} sections</span>
              </div>
            </div>

            {/* Print button — visible on screen, hidden in the PDF output */}
            <button
              onClick={() => window.print()}
              className="hidden sm:flex print:hidden items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors border border-border/50 hover:border-primary/40 rounded-lg px-3 py-2 bg-card/40"
            >
              <Printer size={13} />
              Print / Save PDF
            </button>
          </div>
        </div>
      </div>

      {/* ── Body: TOC sidebar + content ── */}
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl mt-10 print:mt-6">
        {/*
          Default grid for screens. `print:block` collapses it to a single
          column so the PDF is full-width with no sidebar wasted space.
          No `items-start` — default stretch lets sticky work on screen.
        */}
        <div className="lg:grid lg:grid-cols-[220px_1fr] xl:grid-cols-[240px_1fr] lg:gap-10 xl:gap-14 print:block">

          {/* Sticky TOC sidebar — screen only, hidden in print via @media print aside rule */}
          <aside className="hidden lg:block relative">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-3 px-3">Contents</p>
              <nav className="flex flex-col">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    onClick={scrollToSection(s.id)}
                    className={`text-[13px] py-1.5 px-3 rounded-lg transition-all duration-150 leading-snug ${
                      activeId === s.id
                        ? "text-primary font-semibold bg-primary/8 border-l-2 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border-l-2 border-transparent"
                    }`}
                  >
                    {s.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="bg-card/30 border border-border/40 rounded-2xl shadow-sm overflow-hidden print:border-none print:rounded-none print:shadow-none print:bg-white print:overflow-visible">
            <div className="divide-y divide-border/25 print:divide-slate-200">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Back to top — fixed, hidden by @media print .fixed rule */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-6 right-6 z-40 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:opacity-90 transition-all duration-300 ${
          showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        aria-label="Back to top"
      >
        <ArrowUp size={15} />
      </button>
    </div>
  );
}

interface LegalSectionProps {
  id: string;
  number?: string;
  title: string;
  children: React.ReactNode;
}

export function LegalSection({ id, number, title, children }: LegalSectionProps) {
  return (
    <section id={id} className="scroll-mt-20 px-6 py-8 lg:px-10 lg:py-9 print:px-0 print:py-6 group">
      <div className="flex items-start gap-4 mb-4">
        {number && (
          <span className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center print:bg-slate-100 print:text-slate-700">
            {number}
          </span>
        )}
        <h2 className="text-lg font-display font-bold text-foreground leading-snug">{title}</h2>
      </div>
      <div className={`space-y-3 text-sm text-foreground/80 leading-relaxed ${number ? "pl-11 print:pl-10" : ""}`}>
        {children}
      </div>
    </section>
  );
}

export function LegalSubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground/90">{title}</h3>
      <div className="space-y-2 text-sm text-foreground/75 leading-relaxed">{children}</div>
    </div>
  );
}

export function LegalList({ items }: { items: (string | React.ReactNode)[] }) {
  return (
    <ul className="space-y-1.5 pl-4">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 items-start">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0 print:bg-slate-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function LegalContactBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 rounded-xl border border-border/50 bg-background/50 px-5 py-4 space-y-1.5 text-sm print:bg-slate-50 print:border-slate-200 print:rounded-lg">
      {children}
    </div>
  );
}

export function Em({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-foreground/90">{children}</strong>;
}
