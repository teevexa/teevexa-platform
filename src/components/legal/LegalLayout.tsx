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
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-16% 0% -70% 0%", threshold: 0 }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 96;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen pt-20 pb-24">
      {/* Hero */}
      <div className="border-b border-border/30 bg-gradient-to-b from-background via-background to-card/20">
        <div className="container mx-auto px-4 lg:px-8 py-12 max-w-7xl">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 flex-wrap">
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
            <button
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors border border-border/50 hover:border-primary/40 rounded-lg px-3 py-2 bg-card/40"
            >
              <Printer size={13} />
              Print / Save PDF
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl mt-10">
        <div className="lg:grid lg:grid-cols-[220px_1fr] xl:grid-cols-[240px_1fr] lg:gap-10 xl:gap-14 items-start">
          {/* Sticky TOC sidebar */}
          <aside className="hidden lg:block">
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
          <main className="bg-card/30 border border-border/40 rounded-2xl shadow-sm overflow-hidden">
            <div className="divide-y divide-border/25">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Back to top */}
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
    <section id={id} className="scroll-mt-28 px-6 py-8 lg:px-10 lg:py-9 group">
      <div className="flex items-start gap-4 mb-4">
        {number && (
          <span className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
            {number}
          </span>
        )}
        <h2 className="text-lg font-display font-bold text-foreground leading-snug">{title}</h2>
      </div>
      <div className={`space-y-3 text-sm text-foreground/80 leading-relaxed ${number ? "pl-11" : ""}`}>
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
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function LegalContactBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 rounded-xl border border-border/50 bg-background/50 px-5 py-4 space-y-1.5 text-sm">
      {children}
    </div>
  );
}

export function Em({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-foreground/90">{children}</strong>;
}
