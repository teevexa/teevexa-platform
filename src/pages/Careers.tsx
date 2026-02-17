import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, MapPin, Clock, ArrowRight, Users, Heart, Zap } from "lucide-react";

interface Job {
  id: string; title: string; slug: string; department: string;
  location: string; employment_type: string; description: string;
}

const cultureItems = [
  { icon: Users, title: "Collaborative Culture", desc: "Work alongside talented engineers and designers who share your passion." },
  { icon: Heart, title: "Work-Life Balance", desc: "Flexible hours, remote options, and generous time off." },
  { icon: Zap, title: "Growth Opportunities", desc: "Learning budgets, mentorship, and career advancement paths." },
];

const Careers = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    supabase.from("jobs").select("*").eq("status", "open").order("created_at", { ascending: false })
      .then(({ data }) => { setJobs(data || []); setLoading(false); });
  }, []);

  const departments = [...new Set(jobs.map((j) => j.department))];
  const types = [...new Set(jobs.map((j) => j.employment_type))];
  const filtered = jobs.filter((j) =>
    (deptFilter === "all" || j.department === deptFilter) &&
    (typeFilter === "all" || j.employment_type === typeFilter)
  );

  return (
    <>
      {/* Hero */}
      <section className="py-24 px-4 gradient-hero network-bg text-center">
        <div className="container mx-auto max-w-3xl animate-fade-in">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-4 block">Careers</span>
          <h1 className="text-4xl md:text-5xl font-display font-bold">
            Build the Future With <span className="gradient-text">Teevexa</span>
          </h1>
          <p className="mt-4 text-muted-foreground text-lg">Join a mission-driven team creating digital infrastructure for Africa.</p>
          <Button size="lg" className="mt-8 glow-primary" onClick={() => document.getElementById("positions")?.scrollIntoView({ behavior: "smooth" })}>
            View Open Positions <ArrowRight size={18} className="ml-2" />
          </Button>
        </div>
      </section>

      {/* Culture */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <SectionHeading label="Culture" title="Why Work at Teevexa" />
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {cultureItems.map((c) => (
              <div key={c.title} className="glass rounded-2xl p-6 text-center group hover:border-primary/40 transition-all">
                <c.icon className="mx-auto text-primary mb-4" size={32} />
                <h3 className="font-display font-semibold text-lg mb-2">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Positions */}
      <section id="positions" className="py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <SectionHeading label="Open Positions" title="Current Openings" />

          <div className="mt-8 flex flex-wrap gap-3">
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-48 glass"><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48 glass"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-8 grid gap-4">
            {loading ? <p className="text-muted-foreground">Loading positions...</p> :
             filtered.length === 0 ? <p className="text-muted-foreground">No open positions at the moment. Check back soon!</p> :
             filtered.map((job) => (
              <Card key={job.id} className="glass group hover:border-primary/40 transition-all">
                <CardContent className="py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display font-semibold text-lg">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Briefcase size={14} /> {job.department}</span>
                      <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {job.employment_type}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{job.description}</p>
                  </div>
                  <Button variant="outline" asChild className="shrink-0">
                    <Link to={`/careers/${job.slug}`}>Apply <ArrowRight size={14} className="ml-1" /></Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Careers;
