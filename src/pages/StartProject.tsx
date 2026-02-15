import { useState } from "react";
import { z } from "zod";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Globe,
  Smartphone,
  ShoppingCart,
  Building2,
  Sparkles,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const STEPS = ["Identity", "Project Type", "Features", "Budget & Timeline", "Details"];

const step1Schema = z.object({
  fullName: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(20).optional(),
  company: z.string().trim().max(100).optional(),
  country: z.string().trim().max(60).optional(),
});

const projectTypes = [
  { value: "website", label: "Website", icon: Globe, desc: "Corporate, landing, or web app" },
  { value: "mobile", label: "Mobile App", icon: Smartphone, desc: "iOS & Android applications" },
  { value: "ecommerce", label: "E-Commerce", icon: ShoppingCart, desc: "Online store & marketplace" },
  { value: "enterprise", label: "Enterprise", icon: Building2, desc: "Large-scale business systems" },
  { value: "custom", label: "Custom / Other", icon: Sparkles, desc: "Blockchain, AI, IoT, etc." },
];

const featuresByType: Record<string, string[]> = {
  website: ["Responsive Design", "CMS Integration", "SEO Optimization", "Blog", "Contact Forms", "Analytics Dashboard", "Multi-language", "Animations & Motion"],
  mobile: ["Push Notifications", "Offline Mode", "Camera / Media", "GPS / Maps", "Payment Integration", "Social Login", "Chat / Messaging", "Biometric Auth"],
  ecommerce: ["Product Catalog", "Shopping Cart", "Payment Gateway", "Inventory Management", "Order Tracking", "Customer Reviews", "Discount / Coupons", "Multi-currency"],
  enterprise: ["User Role Management", "Audit Logging", "API Integrations", "Reporting & BI", "Workflow Automation", "Data Migration", "SSO / LDAP", "Compliance Tools"],
  custom: ["Blockchain / Smart Contracts", "AI / Machine Learning", "IoT Integration", "Real-time Data", "Custom API", "Data Visualization", "Automation", "Other"],
};

const budgets = ["Under $5,000", "$5,000 – $15,000", "$15,000 – $50,000", "$50,000 – $100,000", "$100,000+", "Not sure yet"];
const timelines = ["Less than 1 month", "1 – 3 months", "3 – 6 months", "6 – 12 months", "Flexible"];
const urgencies = ["Low – exploratory", "Medium – planned project", "High – need it ASAP"];

const StartProject = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    country: "",
    projectType: "",
    features: [] as string[],
    budget: "",
    timeline: "",
    urgency: "",
    additionalDetails: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, value: string | string[]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const toggleFeature = (feat: string) => {
    setForm((f) => ({
      ...f,
      features: f.features.includes(feat)
        ? f.features.filter((x) => x !== feat)
        : [...f.features, feat],
    }));
  };

  const validateStep = (): boolean => {
    if (step === 0) {
      const result = step1Schema.safeParse({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone || undefined,
        company: form.company || undefined,
        country: form.country || undefined,
      });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.issues.forEach((i) => {
          fieldErrors[i.path[0] as string] = i.message;
        });
        setErrors(fieldErrors);
        return false;
      }
    }
    if (step === 1 && !form.projectType) {
      setErrors({ projectType: "Select a project type" });
      return false;
    }
    if (step === 2 && form.features.length === 0) {
      setErrors({ features: "Select at least one feature" });
      return false;
    }
    if (step === 3) {
      if (!form.budget) { setErrors({ budget: "Select a budget range" }); return false; }
      if (!form.timeline) { setErrors({ timeline: "Select a timeline" }); return false; }
    }
    setErrors({});
    return true;
  };

  const next = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    setSubmitting(true);
    const { error } = await supabase.from("project_inquiries").insert({
      full_name: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone?.trim() || null,
      company: form.company?.trim() || null,
      country: form.country?.trim() || null,
      project_type: form.projectType,
      features: form.features,
      budget: form.budget,
      timeline: form.timeline,
      urgency: form.urgency || null,
      additional_details: form.additionalDetails?.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" });
      return;
    }
    setDone(true);
    toast({ title: "Inquiry submitted!", description: "We'll be in touch within 24 hours." });
  };

  if (done) {
    return (
      <section className="py-32 px-4 gradient-hero network-bg min-h-[70vh] flex items-center">
        <div className="container mx-auto max-w-lg text-center animate-fade-in">
          <CheckCircle className="mx-auto text-primary mb-6" size={64} />
          <h2 className="font-display font-bold text-3xl mb-4">Thank You!</h2>
          <p className="text-muted-foreground mb-8">Your project inquiry has been submitted. Our team will review your requirements and get back to you within 24 hours.</p>
          <Button asChild><a href="/">Back to Home</a></Button>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-24 px-4 gradient-hero network-bg">
        <div className="container mx-auto text-center animate-fade-in">
          <SectionHeading label="Get Started" title="Start a Project" description="Tell us about your project and we'll craft a tailored solution." />
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              {STEPS.map((s, i) => (
                <span key={s} className={i <= step ? "text-primary font-medium" : ""}>{s}</span>
              ))}
            </div>
            <Progress value={((step + 1) / STEPS.length) * 100} className="h-2" />
          </div>

          <div className="glass rounded-2xl p-8 animate-fade-in" key={step}>
            {/* Step 0: Identity */}
            {step === 0 && (
              <div className="space-y-4">
                <h3 className="font-display font-semibold text-lg mb-4">Tell us about yourself</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="John Doe" />
                    {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="john@example.com" />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+234 ..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Acme Inc." />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="Nigeria" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Project Type */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-display font-semibold text-lg mb-4">What are you building?</h3>
                {errors.projectType && <p className="text-sm text-destructive">{errors.projectType}</p>}
                <RadioGroup value={form.projectType} onValueChange={(v) => { set("projectType", v); set("features", []); }}>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {projectTypes.map((pt) => (
                      <label
                        key={pt.value}
                        className={`flex items-center gap-3 glass rounded-xl p-4 cursor-pointer transition-all hover:border-primary/50 ${form.projectType === pt.value ? "border-primary glow-primary" : ""}`}
                      >
                        <RadioGroupItem value={pt.value} />
                        <pt.icon size={20} className="text-primary" />
                        <div>
                          <div className="font-medium text-sm">{pt.label}</div>
                          <div className="text-xs text-muted-foreground">{pt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Step 2: Features */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-display font-semibold text-lg mb-2">Select the features you need</h3>
                <p className="text-sm text-muted-foreground mb-4">For your {projectTypes.find((p) => p.value === form.projectType)?.label} project</p>
                {errors.features && <p className="text-sm text-destructive">{errors.features}</p>}
                <div className="grid sm:grid-cols-2 gap-3">
                  {(featuresByType[form.projectType] || []).map((feat) => (
                    <label
                      key={feat}
                      className={`flex items-center gap-3 glass rounded-xl p-3 cursor-pointer transition-all hover:border-primary/50 ${form.features.includes(feat) ? "border-primary" : ""}`}
                    >
                      <Checkbox
                        checked={form.features.includes(feat)}
                        onCheckedChange={() => toggleFeature(feat)}
                      />
                      <span className="text-sm">{feat}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Budget & Timeline */}
            {step === 3 && (
              <div className="space-y-5">
                <h3 className="font-display font-semibold text-lg mb-4">Budget & Timeline</h3>
                <div className="space-y-2">
                  <Label>Budget Range *</Label>
                  <Select value={form.budget} onValueChange={(v) => set("budget", v)}>
                    <SelectTrigger><SelectValue placeholder="Select budget range" /></SelectTrigger>
                    <SelectContent>
                      {budgets.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.budget && <p className="text-sm text-destructive">{errors.budget}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Timeline *</Label>
                  <Select value={form.timeline} onValueChange={(v) => set("timeline", v)}>
                    <SelectTrigger><SelectValue placeholder="Select timeline" /></SelectTrigger>
                    <SelectContent>
                      {timelines.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.timeline && <p className="text-sm text-destructive">{errors.timeline}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Urgency</Label>
                  <RadioGroup value={form.urgency} onValueChange={(v) => set("urgency", v)}>
                    {urgencies.map((u) => (
                      <label key={u} className="flex items-center gap-2 cursor-pointer">
                        <RadioGroupItem value={u} />
                        <span className="text-sm">{u}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Step 4: Details */}
            {step === 4 && (
              <div className="space-y-5">
                <h3 className="font-display font-semibold text-lg mb-4">Additional Details</h3>
                <div className="space-y-2">
                  <Label>Anything else we should know?</Label>
                  <Textarea
                    rows={5}
                    value={form.additionalDetails}
                    onChange={(e) => set("additionalDetails", e.target.value)}
                    placeholder="Describe your vision, reference sites, existing branding, technical requirements…"
                  />
                </div>
                <div className="glass rounded-xl p-6 border-dashed border-2 border-border text-center text-muted-foreground">
                  <Upload className="mx-auto mb-2" size={24} />
                  <p className="text-sm">File upload coming soon</p>
                  <p className="text-xs">You'll be able to share briefs, mockups, and documents here.</p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={back} disabled={step === 0}>
                <ArrowLeft size={16} /> Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={next}>
                  Next <ArrowRight size={16} />
                </Button>
              ) : (
                <Button onClick={submit} disabled={submitting} className="glow-primary">
                  {submitting ? "Submitting..." : "Submit Inquiry"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default StartProject;
