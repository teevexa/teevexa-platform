import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, ArrowRight, Briefcase, MapPin, Clock,
  Upload, CheckCircle, Users, Globe, TrendingUp,
} from "lucide-react";
import { z } from "zod";

const appSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  phone: z.string().optional(),
  linkedin: z.string().optional(),
  portfolio: z.string().optional(),
  cover_letter: z.string().optional(),
});

interface Job {
  id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  employment_type: string;
  description: string;
  responsibilities: string | null;
  requirements: string | null;
  benefits: string | null;
}

const CareerDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", linkedin: "", portfolio: "", cover_letter: "",
  });
  const [resume, setResume] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("jobs")
      .select("*")
      .eq("slug", slug)
      .eq("status", "open")
      .single()
      .then(({ data }) => {
        setJob(data);
        setLoading(false);
      });
  }, [slug]);

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = appSchema.safeParse(form);
    if (!result.success) {
      const fe: Record<string, string> = {};
      result.error.issues.forEach((i) => { fe[i.path[0] as string] = i.message; });
      setErrors(fe);
      return;
    }
    if (!job) return;
    setSubmitting(true);

    let resume_url: string | null = null;
    if (resume) {
      const path = `${job.id}/${Date.now()}-${resume.name}`;
      const { error } = await supabase.storage.from("resumes").upload(path, resume);
      if (!error) resume_url = path;
    }

    const { error } = await supabase.from("job_applications").insert([{
      job_id: job.id,
      full_name: result.data.full_name,
      email: result.data.email,
      phone: result.data.phone || null,
      linkedin: result.data.linkedin || null,
      portfolio: result.data.portfolio || null,
      cover_letter: result.data.cover_letter || null,
      resume_url,
    }]);

    setSubmitting(false);
    if (error) {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
    } else {
      setSubmitted(true);
      toast({ title: "Application submitted!", description: "We'll be in touch within 5 business days." });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading position...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
          <Briefcase className="text-muted-foreground" size={32} />
        </div>
        <div>
          <h2 className="font-display font-bold text-xl mb-2">Position not found</h2>
          <p className="text-muted-foreground text-sm">This role may have been filled or removed.</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/careers"><ArrowLeft size={16} className="mr-2" /> View All Positions</Link>
        </Button>
      </div>
    );
  }

  const renderSection = (title: string, content: string | null) => {
    if (!content) return null;
    return (
      <div>
        <h3 className="font-display font-bold text-lg mb-3">{title}</h3>
        <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{content}</div>
      </div>
    );
  };

  return (
    <>
      <SEO
        title={`${job.title} — ${job.department} | Teevexa Careers`}
        description={`${job.title} (${job.employment_type}) in ${job.location}. Join Teevexa and help build Africa's digital future.`}
        canonical={`/careers/${job.slug}`}
      />
      {/* ── Hero ── */}
      <section className="relative pt-32 pb-16 px-4 gradient-hero network-bg overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-primary/8 blur-3xl animate-pulse-glow" />
        </div>
        <div className="container mx-auto max-w-5xl relative z-10 animate-fade-in">
          <Link
            to="/careers"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={15} /> All Positions
          </Link>
          <div className="flex flex-wrap gap-2 mb-5">
            <Badge className="bg-primary/10 text-primary border-0 font-semibold">{job.department}</Badge>
            <Badge variant="outline">{job.employment_type}</Badge>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-5">
            {job.title}
          </h1>
          <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-primary" /> {job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-primary" /> {job.employment_type}
            </span>
            <span className="flex items-center gap-1.5">
              <Briefcase size={14} className="text-primary" /> {job.department}
            </span>
          </div>
        </div>
      </section>

      {/* ── Why Teevexa bar ── */}
      <section className="section-teal py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Globe,      label: "Remote-First",        desc: "Work from anywhere across Africa" },
              { icon: TrendingUp, label: "Learning Budget",     desc: "Annual personal learning allowance" },
              { icon: Users,      label: "Inclusive Culture",   desc: "50%+ women, 8+ nationalities" },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-3 glass rounded-xl p-4">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <b.icon size={17} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{b.label}</p>
                  <p className="text-xs text-muted-foreground">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main content + Application ── */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-[1fr_420px] gap-12">

            {/* Left — job details */}
            <div className="space-y-10">
              <div>
                <h3 className="font-display font-bold text-lg mb-3">About the Role</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{job.description}</p>
              </div>
              {renderSection("Responsibilities", job.responsibilities)}
              {renderSection("Requirements", job.requirements)}
              {renderSection("What We Offer", job.benefits)}
            </div>

            {/* Right — application form */}
            <div className="lg:sticky lg:top-8 h-fit">
              <div className="glass rounded-2xl p-7">
                {submitted ? (
                  <div className="text-center py-8 animate-fade-in">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle className="text-primary" size={28} />
                    </div>
                    <h3 className="font-display font-bold text-lg mb-2">Application Sent!</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                      We review every application carefully and will get back to you within 5 business days.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/careers">
                        <ArrowLeft size={14} className="mr-1" /> View More Roles
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    <h3 className="font-display font-bold text-lg mb-5">Apply for This Role</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label>Full Name *</Label>
                        <Input
                          value={form.full_name}
                          onChange={(e) => set("full_name", e.target.value)}
                          placeholder="Jane Doe"
                        />
                        {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <Label>Email *</Label>
                        <Input
                          type="email"
                          value={form.email}
                          onChange={(e) => set("email", e.target.value)}
                          placeholder="jane@example.com"
                        />
                        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <Label>Phone</Label>
                        <Input
                          value={form.phone}
                          onChange={(e) => set("phone", e.target.value)}
                          placeholder="+254 ..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>LinkedIn</Label>
                        <Input
                          value={form.linkedin}
                          onChange={(e) => set("linkedin", e.target.value)}
                          placeholder="https://linkedin.com/in/..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Portfolio / GitHub</Label>
                        <Input
                          value={form.portfolio}
                          onChange={(e) => set("portfolio", e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Resume (PDF)</Label>
                        <div
                          className="glass rounded-xl border-dashed border-2 border-border p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={() => document.getElementById("resume-upload")?.click()}
                        >
                          <Upload size={18} className="mx-auto text-muted-foreground mb-1" />
                          <p className="text-xs text-muted-foreground">
                            {resume ? (
                              <span className="text-primary font-medium">{resume.name}</span>
                            ) : (
                              "Click to upload PDF"
                            )}
                          </p>
                          <input
                            id="resume-upload"
                            type="file"
                            accept=".pdf"
                            hidden
                            onChange={(e) => setResume(e.target.files?.[0] || null)}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Cover Letter</Label>
                        <Textarea
                          value={form.cover_letter}
                          onChange={(e) => set("cover_letter", e.target.value)}
                          rows={4}
                          placeholder="Why are you a great fit for this role?"
                        />
                      </div>
                      <Button type="submit" size="lg" className="w-full glow-primary" disabled={submitting}>
                        {submitting ? "Submitting..." : <>Submit Application <ArrowRight size={16} className="ml-1" /></>}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        We read every application. No automated rejections.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CareerDetail;
