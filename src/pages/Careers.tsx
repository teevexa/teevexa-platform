import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Briefcase, MapPin, Clock, ArrowRight, Users, Heart, Zap,
  Globe, TrendingUp, GraduationCap, Coffee, Shield, DollarSign,
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  employment_type: string;
  description: string;
}

const benefits = [
  { icon: Globe,         title: "Remote-First",          desc: "Work from anywhere across Africa. We've built async-first processes that keep every team member aligned." },
  { icon: TrendingUp,    title: "Annual Learning Budget", desc: "Every team member gets a personal budget for courses, conferences, books, and certifications." },
  { icon: Heart,         title: "Mental Health Days",     desc: "Generous leave policy plus dedicated mental health days — great work comes from energised people." },
  { icon: GraduationCap, title: "Mentorship Program",    desc: "Senior engineers mentor juniors. Every new hire gets a dedicated guide for their first 90 days." },
  { icon: DollarSign,    title: "Competitive Pay",        desc: "Market-leading salaries benchmarked against global standards, not just local norms." },
  { icon: Coffee,        title: "Team Retreats",          desc: "Twice-yearly in-person retreats across African cities to bond, plan, and celebrate wins." },
];

const Careers = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    supabase
      .from("jobs")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setJobs(data || []);
        setLoading(false);
      });
  }, []);

  const departments = [...new Set(jobs.map((j) => j.department))];
  const types = [...new Set(jobs.map((j) => j.employment_type))];
  const filtered = jobs.filter((j) =>
    (deptFilter === "all" || j.department === deptFilter) &&
    (typeFilter === "all" || j.employment_type === typeFilter)
  );

  return (
    <>
      <SEO
        title="Careers at Teevexa | Join Our Engineering Team"
        description="Explore open roles at Teevexa. We're building Africa's digital future and looking for talented engineers, designers, and product people."
        canonical="/careers"
      />
      {/* ── Hero ── */}
      <section className="relative py-32 px-4 gradient-hero network-bg overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-primary/8 blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 left-1/3 w-60 h-60 rounded-full bg-accent/7 blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
        </div>
        <div className="container mx-auto text-center relative z-10 animate-fade-in max-w-4xl">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary block mb-4">Careers at Teevexa</span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
            Build Africa's Digital <span className="gradient-text">Future</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Join a mission-driven team creating world-class digital infrastructure for the continent. Senior talent. Real problems. Real impact.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="glow-primary px-8"
              onClick={() => document.getElementById("positions")?.scrollIntoView({ behavior: "smooth" })}
            >
              View Open Positions <ArrowRight size={18} className="ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="px-8" asChild>
              <Link to="/about">Meet the Team</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="section-teal py-14 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-3xl mx-auto text-center">
            {[
              { value: "15+", label: "Team Members" },
              { value: "4", label: "Countries" },
              { value: "50%+", label: "Women in Tech" },
              { value: "8", label: "Nationalities" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-4xl lg:text-5xl font-display font-bold gradient-text">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <SectionHeading
            label="Why Teevexa"
            title="A Place Where You'll Thrive"
            description="We invest in our people the same way we invest in our products — with intention and craft."
          />
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="glass rounded-2xl p-7 group hover:border-primary/50 hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <b.icon className="text-primary group-hover:scale-110 transition-transform" size={24} />
                </div>
                <h3 className="font-display font-bold text-base mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Values ── */}
      <section className="section-card py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <SectionHeading
            label="Culture"
            title="We're Diverse by Design"
            description="50%+ of our team are women. Multiple nationalities and backgrounds in every room. We build inclusive tech by being inclusive ourselves."
          />
          <div className="mt-12 grid sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: Users,  title: "Collaborative",  desc: "Cross-functional teams where every voice counts." },
              { icon: Zap,    title: "Ambitious",       desc: "We tackle problems that most companies avoid." },
              { icon: Shield, title: "Accountable",     desc: "We own our work, our mistakes, and our solutions." },
            ].map((v) => (
              <div key={v.title} className="rounded-2xl border border-border p-7 hover:border-primary/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <v.icon className="text-primary" size={22} />
                </div>
                <h4 className="font-display font-bold mb-2">{v.title}</h4>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Open Positions ── */}
      <section id="positions" className="py-24 px-4">
        <div className="container mx-auto">
          <SectionHeading label="Open Positions" title="Current Openings" description="We hire for talent, potential, and cultural fit — not just credentials." />

          {jobs.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="w-52 glass">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48 glass">
                  <SelectValue placeholder="Employment Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="mt-8 space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="glass rounded-2xl p-6 animate-pulse h-24" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 glass rounded-2xl">
                <Briefcase className="mx-auto text-muted-foreground mb-4 opacity-30" size={56} />
                <p className="text-lg font-display font-semibold mb-2">No open positions right now</p>
                <p className="text-sm text-muted-foreground mb-6">
                  We're always interested in exceptional talent. Send us your details.
                </p>
                <Button variant="outline" asChild>
                  <Link to="/contact">Send Open Application</Link>
                </Button>
              </div>
            ) : (
              filtered.map((job) => (
                <div
                  key={job.id}
                  className="glass rounded-2xl p-6 group hover:border-primary/50 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <Badge className="bg-primary/10 text-primary border-0 text-xs font-semibold">
                          {job.department}
                        </Badge>
                        <Badge variant="outline" className="text-xs">{job.employment_type}</Badge>
                      </div>
                      <h3 className="font-display font-bold text-lg mt-2 group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-primary" /> {job.location}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={13} className="text-primary" /> {job.employment_type}
                        </span>
                      </div>
                      {job.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                          {job.description}
                        </p>
                      )}
                    </div>
                    <Button asChild className="shrink-0 glow-primary">
                      <Link to={`/careers/${job.slug}`}>
                        Apply Now <ArrowRight size={14} className="ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-navy py-24 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-4xl font-display font-bold mb-4">
            Don't See a <span className="gradient-text">Perfect Fit?</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-10">
            We're always looking for exceptional people. Send an open application — we'll keep your profile on file and reach out when the right role opens.
          </p>
          <Button size="lg" className="glow-primary px-10" asChild>
            <Link to="/contact">Send Open Application <ArrowRight className="ml-2" size={18} /></Link>
          </Button>
        </div>
      </section>
    </>
  );
};

export default Careers;
