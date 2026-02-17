import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Briefcase, MapPin, Clock, Upload } from "lucide-react";
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
  id: string; title: string; slug: string; department: string; location: string;
  employment_type: string; description: string; responsibilities: string | null;
  requirements: string | null; benefits: string | null;
}

const CareerDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", linkedin: "", portfolio: "", cover_letter: "" });
  const [resume, setResume] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!slug) return;
    supabase.from("jobs").select("*").eq("slug", slug).eq("status", "open").single()
      .then(({ data }) => { setJob(data); setLoading(false); });
  }, [slug]);

  const set = (k: string, v: string) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = appSchema.safeParse(form);
    if (!result.success) {
      const fe: Record<string, string> = {};
      result.error.issues.forEach((i) => { fe[i.path[0] as string] = i.message; });
      setErrors(fe); return;
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
      job_id: job.id, full_name: result.data.full_name, email: result.data.email,
      phone: result.data.phone || null, linkedin: result.data.linkedin || null,
      portfolio: result.data.portfolio || null, cover_letter: result.data.cover_letter || null,
      resume_url,
    }]);
    setSubmitting(false);
    if (error) {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
    } else {
      setSubmitted(true);
      toast({ title: "Application submitted!" });
    }
  };

  if (loading) return <div className="py-24 text-center animate-pulse-glow text-primary">Loading...</div>;
  if (!job) return <div className="py-24 text-center"><p className="text-muted-foreground">Position not found.</p><Button asChild className="mt-4"><Link to="/careers">View All Positions</Link></Button></div>;

  const renderSection = (title: string, content: string | null) => {
    if (!content) return null;
    return (
      <div>
        <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
        <div className="text-sm text-muted-foreground whitespace-pre-line">{content}</div>
      </div>
    );
  };

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/careers"><ArrowLeft size={14} className="mr-1" /> All Positions</Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
            <Badge variant="outline"><Briefcase size={12} className="mr-1" /> {job.department}</Badge>
            <Badge variant="outline"><MapPin size={12} className="mr-1" /> {job.location}</Badge>
            <Badge variant="outline"><Clock size={12} className="mr-1" /> {job.employment_type}</Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="font-display font-semibold text-lg mb-2">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{job.description}</p>
            </div>
            {renderSection("Responsibilities", job.responsibilities)}
            {renderSection("Requirements", job.requirements)}
            {renderSection("Benefits", job.benefits)}
          </div>

          <Card className="glass h-fit sticky top-8">
            <CardHeader><CardTitle>Apply Now</CardTitle></CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-6">
                  <p className="text-primary font-medium mb-2">Application Submitted!</p>
                  <p className="text-sm text-muted-foreground">We'll review your application and get back to you.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div><Label>Full Name *</Label><Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />{errors.full_name && <p className="text-xs text-destructive mt-1">{errors.full_name}</p>}</div>
                  <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />{errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}</div>
                  <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
                  <div><Label>LinkedIn</Label><Input value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." /></div>
                  <div><Label>Portfolio</Label><Input value={form.portfolio} onChange={(e) => set("portfolio", e.target.value)} placeholder="https://..." /></div>
                  <div>
                    <Label>Resume (PDF)</Label>
                    <div className="mt-1">
                      <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById("resume-upload")?.click()}>
                        <Upload size={14} className="mr-1" /> {resume ? resume.name : "Choose File"}
                      </Button>
                      <input id="resume-upload" type="file" accept=".pdf" hidden onChange={(e) => setResume(e.target.files?.[0] || null)} />
                    </div>
                  </div>
                  <div><Label>Cover Letter</Label><Textarea value={form.cover_letter} onChange={(e) => set("cover_letter", e.target.value)} rows={4} /></div>
                  <Button type="submit" className="w-full glow-primary" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CareerDetail;
