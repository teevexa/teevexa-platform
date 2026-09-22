import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { z } from "zod";
import {
  ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, FileText, Loader2, Mail, Rocket, Sparkles, Upload, X,
} from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { invokeFn } from "@/lib/functions";
import { track } from "@/lib/analytics";
import {
  CAPABILITIES, INTEGRATIONS, KINDS, STARTING_POINTS, TIMINGS,
  heuristicBrief, sanitizeBrief,
  type Brief, type ProjectKind, type StartingPoint, type Timing,
} from "../../supabase/functions/_shared/estimate";

// ── Types & persistence ──────────────────────────────────────────────────────
type Step = "idea" | "questions" | "result";
type MailState = "idle" | "sending" | "sent" | "failed";

interface Idea { email: string; name: string; description: string; link: string }
interface Answers { kind: ProjectKind; startingPoint: StartingPoint; capabilities: string[]; integrations: string[]; timing: Timing }
interface Extras { phone: string; company: string; country: string; notes: string }
interface Draft { id: string; token: string }

interface Saved {
  v: 1; savedAt: number; step: Step; idea: Idea; answers: Answers; extras: Extras;
  draft: Draft | null; aiPrefilled: boolean; attachments: string[];
}

const STORAGE_KEY = "teevexa_start_project_v1";
const MAX_AGE_MS = 7 * 24 * 3600_000;

const emptyIdea: Idea = { email: "", name: "", description: "", link: "" };
const defaultAnswers: Answers = { kind: "webapp", startingPoint: "scratch", capabilities: [], integrations: [], timing: "normal" };
const emptyExtras: Extras = { phone: "", company: "", country: "", notes: "" };

const ideaSchema = z.object({
  email: z.string().trim().email("Enter a valid email so we can send your quote").max(254),
  description: z.string().trim().min(10, "Tell us a little more — a sentence or two is enough").max(4000),
  name: z.string().trim().max(100).optional(),
  link: z.string().trim().max(500).optional(),
});

function loadSaved(): Saved | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Saved;
    if (s?.v !== 1 || Date.now() - s.savedAt > MAX_AGE_MS) return null;
    return s;
  } catch {
    return null;
  }
}

function persist(s: Saved | null) {
  try {
    if (s) localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable (private mode) — progress just isn't kept locally */
  }
}

const toAnswers = (b: Brief): Answers => ({
  kind: b.kind, startingPoint: b.startingPoint, capabilities: b.capabilities, integrations: b.integrations, timing: b.timing,
});

const STEP_LABELS: Record<Step, string> = { idea: "Your idea", questions: "5 quick questions", result: "Request received" };
const STEP_ORDER: Step[] = ["idea", "questions", "result"];

// ── Page ─────────────────────────────────────────────────────────────────────
const StartProject = () => {
  const { toast } = useToast();
  const [params] = useSearchParams();
  const saved = useMemo(loadSaved, []);
  const prototypeParam = params.get("type") === "prototype";

  const [step, setStep] = useState<Step>(saved?.step ?? "idea");
  const [idea, setIdea] = useState<Idea>(saved?.idea ?? emptyIdea);
  const [answers, setAnswers] = useState<Answers>(saved?.answers ?? defaultAnswers);
  const [extras, setExtras] = useState<Extras>(saved?.extras ?? emptyExtras);
  const [draft, setDraft] = useState<Draft | null>(saved?.draft ?? null);
  const [aiPrefilled, setAiPrefilled] = useState(saved?.aiPrefilled ?? false);
  const [attachments, setAttachments] = useState<string[]>(saved?.attachments ?? []);
  const [hasPrototype, setHasPrototype] = useState(prototypeParam);
  const [restored] = useState(!!saved && (saved.step !== "idea" || !!saved.idea.description));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [mail, setMail] = useState<MailState>("idle");
  const [extrasSaved, setExtrasSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Save progress locally on every change.
  useEffect(() => {
    persist({ v: 1, savedAt: Date.now(), step, idea, answers, extras, draft, aiPrefilled, attachments });
  }, [step, idea, answers, extras, draft, aiPrefilled, attachments]);

  // Move focus to the step heading for screen-reader and keyboard users.
  useEffect(() => { headingRef.current?.focus(); }, [step]);

  // Mirror answers to the draft lead (debounced) so abandoned sessions still carry useful data.
  useEffect(() => {
    if (step !== "questions" || !draft) return;
    const t = setTimeout(() => {
      invokeFn("intake-project", { action: "save", id: draft.id, token: draft.token, patch: { answers } });
    }, 1500);
    return () => clearTimeout(t);
  }, [answers, step, draft]);

  const setI = (k: keyof Idea, v: string) => { setIdea((p) => ({ ...p, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };
  const toggle = (key: "capabilities" | "integrations", id: string) =>
    setAnswers((a) => ({ ...a, [key]: a[key].includes(id) ? a[key].filter((x) => x !== id) : [...a[key], id] }));

  const startOver = () => {
    persist(null);
    setStep("idea"); setIdea(emptyIdea); setAnswers(defaultAnswers); setExtras(emptyExtras);
    setDraft(null); setAiPrefilled(false); setAttachments([]); setMail("idle"); setErrors({}); setHasPrototype(false);
  };

  // ── Step 1 -> 2: capture the lead, get an AI-structured brief ──────────────
  const submitIdea = async () => {
    const parsed = ideaSchema.safeParse(idea);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { fe[i.path[0] as string] = i.message; });
      setErrors(fe);
      return;
    }
    setBusy(true);
    const { data, error, status } = await invokeFn<{ id: string; token: string; brief: Brief }>("intake-project", {
      action: "start", email: idea.email, name: idea.name, description: idea.description, link: idea.link,
    });
    setBusy(false);

    // Real validation / rate-limit errors are shown; infrastructure failures fall back to on-device analysis
    // so the visitor never hits a dead end (the lead is created when they finish).
    if (error && status !== null && status < 500) {
      toast({ title: "Please check your details", description: error, variant: "destructive" });
      return;
    }
    let brief: Brief;
    if (data) {
      brief = sanitizeBrief(data.brief, idea.description);
      setDraft({ id: data.id, token: data.token });
      setAiPrefilled(true);
    } else {
      brief = sanitizeBrief(heuristicBrief(idea.description), idea.description);
      setDraft(null);
      setAiPrefilled(false);
    }
    if (hasPrototype) brief = { ...brief, startingPoint: "prototype", kind: brief.kind === "other" ? "webapp" : brief.kind };
    setAnswers(toAnswers(brief));
    track("Quote: idea submitted", { prototype: hasPrototype });
    setStep("questions");
  };

  // ── Step 2 -> confirmation: submit the request; the confirmation email is sent in the background ─
  const submitQuestions = async () => {
    track("Quote: requested", { kind: answers.kind, prototype: answers.startingPoint === "prototype" });
    setStep("result");
    setMail("sending");
    const { data, error } = await invokeFn<{ id: string; token?: string; emailed: boolean }>("intake-project", {
      action: "finish",
      id: draft?.id, token: draft?.token,
      email: idea.email, name: idea.name, description: idea.description, link: idea.link,
      answers,
      contact: { name: idea.name },
    });
    if (error || !data) {
      setMail("failed");
      return;
    }
    if (!draft && data.token) setDraft({ id: data.id, token: data.token });
    setMail(data.emailed ? "sent" : "failed");
  };

  // ── Optional extras on the result page ─────────────────────────────────────
  const uploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!draft || list.length === 0) return;
    const room = 5 - attachments.length;
    const ok = list.filter((f) => f.size <= 10 * 1024 * 1024).slice(0, room);
    if (ok.length < list.length) toast({ title: "Some files were skipped", description: "Max 5 files, 10MB each.", variant: "destructive" });
    setUploading(true);
    const uploaded: string[] = [];
    for (const f of ok) {
      const safe = f.name.replace(/[^\w.-]+/g, "_").slice(-80);
      const path = `inquiries/${draft.id}/${Date.now()}-${safe}`;
      const { error } = await supabase.storage.from("project-attachments").upload(path, f, { contentType: f.type || undefined });
      if (error) toast({ title: `Couldn't upload ${f.name}`, description: "Check the file type (PDF, Word, PNG, JPG, ZIP) and size.", variant: "destructive" });
      else uploaded.push(path);
    }
    const next = [...attachments, ...uploaded];
    setAttachments(next);
    if (uploaded.length) {
      await invokeFn("intake-project", { action: "save", id: draft.id, token: draft.token, patch: { attachments: next } });
    }
    setUploading(false);
  };

  const removeFile = async (path: string) => {
    const next = attachments.filter((x) => x !== path);
    setAttachments(next);
    if (draft) {
      await invokeFn("intake-project", { action: "save", id: draft.id, token: draft.token, patch: { attachments: next } });
      supabase.storage.from("project-attachments").remove([path]).catch(() => {});
    }
  };

  const saveExtras = async () => {
    if (!draft) return;
    setBusy(true);
    const { error } = await invokeFn("intake-project", {
      action: "save", id: draft.id, token: draft.token,
      patch: { name: idea.name, phone: extras.phone, company: extras.company, country: extras.country, notes: extras.notes },
    });
    setBusy(false);
    if (error) { toast({ title: "Couldn't save", description: error, variant: "destructive" }); return; }
    setExtrasSaved(true);
    toast({ title: "Details added", description: "Thanks — this helps us tailor your proposal." });
  };

  const bookUrl = `/book-consultation?${new URLSearchParams({
    ...(idea.name ? { name: idea.name } : {}), email: idea.email, notes: (idea.description || "").slice(0, 400),
  }).toString()}`;

  const stepIndex = STEP_ORDER.indexOf(step);
  const Field = useCallback(
    ({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) => (
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        {children}
        {error && <p id={`${id}-error`} role="alert" className="text-sm text-destructive">{error}</p>}
      </div>
    ),
    [],
  );

  return (
    <>
      <SEO route="/start-project" />

      <section className="relative py-24  gradient-hero network-bg overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-primary/8 blur-3xl animate-pulse-glow" />
        </div>
        <div className="container mx-auto text-center relative z-10 animate-fade-in">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary block mb-4">Get a quote</span>
          <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-4">
            Tell us your idea. <span className="gradient-text">Get your quote in 24 hours.</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Describe it in your own words and answer five quick questions. We'll email you a tailored quote within 24 hours — no account, no commitment.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto [&>*]:mx-auto [&>*]:max-w-3xl">
          {/* Progress */}
          <ol className="flex items-center justify-between mb-8" aria-label="Progress">
            {STEP_ORDER.map((s, i) => (
              <li key={s} className="flex-1 flex items-center gap-2" aria-current={i === stepIndex ? "step" : undefined}>
                <span className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < stepIndex ? "bg-primary text-primary-foreground" : i === stepIndex ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : "bg-muted text-muted-foreground"
                }`}>{i < stepIndex ? "✓" : i + 1}</span>
                <span className={`text-xs font-medium ${i <= stepIndex ? "text-primary" : "text-muted-foreground"} hidden sm:inline`}>{STEP_LABELS[s]}</span>
                {i < STEP_ORDER.length - 1 && <span className={`h-px flex-1 ${i < stepIndex ? "bg-primary" : "bg-border"}`} />}
              </li>
            ))}
          </ol>

          {restored && step !== "idea" && (
            <div className="glass rounded-xl p-3 mb-4 text-sm text-muted-foreground flex items-center justify-between gap-3">
              <span>Welcome back — we saved your progress.</span>
              <button type="button" onClick={startOver} className="text-primary hover:underline font-medium shrink-0">Start over</button>
            </div>
          )}

          {/* ── Step 1: idea ── */}
          {step === "idea" && (
            <form className="glass rounded-2xl p-6 sm:p-8 space-y-5 animate-fade-in" noValidate onSubmit={(e) => { e.preventDefault(); submitIdea(); }}>
              <h2 ref={headingRef} tabIndex={-1} className="font-display font-semibold text-xl outline-none">What do you want to build?</h2>

              <Field id="description" label="Describe your project" error={errors.description}>
                <Textarea
                  id="description" rows={6} value={idea.description} maxLength={4000}
                  onChange={(e) => setI("description", e.target.value)}
                  aria-invalid={!!errors.description} aria-describedby={errors.description ? "description-error" : undefined}
                  placeholder="e.g. A booking platform for our clinics where patients pay online (Stripe, PayPal or local methods) and get WhatsApp reminders. I built a first version in Lovable but it isn't ready for real users."
                />
              </Field>

              <Field id="link" label="Have a link? (optional)">
                <Input id="link" value={idea.link} onChange={(e) => setI("link", e.target.value)} inputMode="url" autoComplete="off"
                  placeholder="Prototype, Figma, competitor or reference site" />
              </Field>

              <label className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${hasPrototype ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                <Checkbox checked={hasPrototype} onCheckedChange={(v) => setHasPrototype(v === true)} className="mt-0.5" />
                <span className="text-sm">
                  <span className="font-medium flex items-center gap-1.5"><Rocket size={14} className="text-primary" /> I already have an AI-built prototype</span>
                  <span className="text-muted-foreground block text-xs mt-0.5">Lovable, Bolt, v0, Replit, Cursor, ChatGPT… we'll quote the move to production.</span>
                </span>
              </label>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field id="email" label="Email — we'll send your quote here *" error={errors.email}>
                  <Input id="email" type="email" value={idea.email} onChange={(e) => setI("email", e.target.value)} autoComplete="email"
                    aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} placeholder="you@company.com" />
                </Field>
                <Field id="name" label="Your name (optional)">
                  <Input id="name" value={idea.name} onChange={(e) => setI("name", e.target.value)} autoComplete="name" placeholder="Jane Mwangi" />
                </Field>
              </div>

              <Button type="submit" size="lg" className="w-full glow-primary" disabled={busy}>
                {busy ? <><Loader2 className="mr-2 animate-spin" size={16} /> Reading your idea…</> : <>Continue <ArrowRight className="ml-2" size={16} /></>}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                No account needed. We use your email only to send your quote and reply about your project. <Link to="/legal/privacy-policy" className="text-primary hover:underline">Privacy</Link>
              </p>
            </form>
          )}

          {/* ── Step 2: five questions ── */}
          {step === "questions" && (
            <div className="space-y-4 animate-fade-in">
              <div className="glass rounded-2xl p-6 sm:p-8 space-y-8">
                <div>
                  <h2 ref={headingRef} tabIndex={-1} className="font-display font-semibold text-xl outline-none mb-1">Five quick questions</h2>
                  <p className="text-sm text-muted-foreground flex items-start gap-1.5">
                    {aiPrefilled && <Sparkles size={14} className="text-primary mt-0.5 shrink-0" />}
                    {aiPrefilled ? "We pre-filled these from your description — adjust anything that's off." : "Answer these so we can quote accurately."}
                  </p>
                </div>

                <fieldset className="space-y-3">
                  <legend className="font-medium text-sm mb-2">1. What are you building?</legend>
                  <RadioGroup value={answers.kind} onValueChange={(v) => setAnswers((a) => ({ ...a, kind: v as ProjectKind, startingPoint: v === "prototype" ? "prototype" : a.startingPoint }))} className="grid sm:grid-cols-2 gap-2">
                    {KINDS.map((k) => (
                      <label key={k.id} className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${answers.kind === k.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                        <RadioGroupItem value={k.id} className="mt-0.5" />
                        <span><span className="text-sm font-medium block">{k.label}</span><span className="text-xs text-muted-foreground">{k.hint}</span></span>
                      </label>
                    ))}
                  </RadioGroup>
                </fieldset>

                <fieldset className="space-y-3">
                  <legend className="font-medium text-sm mb-2">2. Where are you starting from?</legend>
                  <RadioGroup value={answers.kind === "prototype" ? "prototype" : answers.startingPoint} onValueChange={(v) => setAnswers((a) => ({ ...a, startingPoint: v as StartingPoint, kind: a.kind === "prototype" && v !== "prototype" ? "webapp" : a.kind }))} className="space-y-2">
                    {STARTING_POINTS.map((s) => (
                      <label key={s.id} className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${(answers.kind === "prototype" ? "prototype" : answers.startingPoint) === s.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                        <RadioGroupItem value={s.id} className="mt-0.5" />
                        <span><span className="text-sm font-medium block">{s.label}</span><span className="text-xs text-muted-foreground">{s.hint}</span></span>
                      </label>
                    ))}
                  </RadioGroup>
                </fieldset>

                <fieldset className="space-y-3">
                  <legend className="font-medium text-sm mb-2">3. What must it do? <span className="text-muted-foreground font-normal">(pick any)</span></legend>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {CAPABILITIES.map((c) => (
                      <label key={c.id} className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${answers.capabilities.includes(c.id) ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                        <Checkbox checked={answers.capabilities.includes(c.id)} onCheckedChange={() => toggle("capabilities", c.id)} />
                        <span className="text-sm">{c.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="space-y-3">
                  <legend className="font-medium text-sm mb-2">4. Which integrations do you need? <span className="text-muted-foreground font-normal">(pick any)</span></legend>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {INTEGRATIONS.map((c) => (
                      <label key={c.id} className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${answers.integrations.includes(c.id) ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                        <Checkbox checked={answers.integrations.includes(c.id)} onCheckedChange={() => toggle("integrations", c.id)} />
                        <span className="text-sm">{c.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="space-y-3">
                  <legend className="font-medium text-sm mb-2">5. When do you need it?</legend>
                  <RadioGroup value={answers.timing} onValueChange={(v) => setAnswers((a) => ({ ...a, timing: v as Timing }))} className="grid sm:grid-cols-3 gap-2">
                    {TIMINGS.map((t) => (
                      <label key={t.id} className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${answers.timing === t.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                        <RadioGroupItem value={t.id} className="mt-0.5" />
                        <span><span className="text-sm font-medium block">{t.label}</span><span className="text-xs text-muted-foreground">{t.hint}</span></span>
                      </label>
                    ))}
                  </RadioGroup>
                </fieldset>
              </div>

              <div className="rounded-2xl p-4 sm:p-5 border border-primary/30 bg-background sticky bottom-3 shadow-xl z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">You'll get your quote by email <strong className="text-foreground">within 24 hours</strong>.</p>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setStep("idea")}><ArrowLeft size={16} className="mr-1" /> Back</Button>
                    <Button className="glow-primary flex-1 sm:flex-none" onClick={submitQuestions}>Request my quote <ArrowRight size={16} className="ml-1" /></Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Result ── */}
          {step === "result" && (
            <div className="space-y-4 animate-fade-in">
              <div className="glass rounded-2xl p-6 sm:p-8 border-primary/30 text-center">
                <CheckCircle2 className="mx-auto text-primary mb-4" size={48} />
                <h2 ref={headingRef} tabIndex={-1} className="font-display font-bold text-2xl outline-none mb-2">Thank you — we've got your request</h2>
                <p className="text-muted-foreground">Your tailored quote will arrive by email at <strong className="text-foreground">{idea.email}</strong> <strong className="text-foreground">within 24 hours</strong>.</p>
              </div>

              <div className="glass rounded-2xl p-6">
                <h3 className="font-display font-semibold mb-3">What you told us</h3>
                <dl className="grid sm:grid-cols-[9rem_1fr] gap-x-4 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">Project</dt><dd>{KINDS.find((k) => k.id === answers.kind)?.label}</dd>
                  <dt className="text-muted-foreground">Starting point</dt><dd>{STARTING_POINTS.find((x) => x.id === (answers.kind === "prototype" ? "prototype" : answers.startingPoint))?.label}</dd>
                  <dt className="text-muted-foreground">Capabilities</dt><dd>{answers.capabilities.map((id) => CAPABILITIES.find((c) => c.id === id)?.label).filter(Boolean).join(", ") || "—"}</dd>
                  <dt className="text-muted-foreground">Integrations</dt><dd>{answers.integrations.map((id) => INTEGRATIONS.find((c) => c.id === id)?.label).filter(Boolean).join(", ") || "—"}</dd>
                  <dt className="text-muted-foreground">Timing</dt><dd>{TIMINGS.find((t) => t.id === answers.timing)?.label}</dd>
                </dl>
                <button type="button" onClick={() => setStep("questions")} className="mt-4 text-sm text-primary hover:underline">Change my answers</button>
              </div>

              <div className={mail === "idle" ? "sr-only" : "glass rounded-2xl p-5"} role="status" aria-live="polite">
                {mail === "sending" && <p className="text-sm flex items-center gap-2"><Loader2 size={16} className="animate-spin text-primary" /> Sending your confirmation to <strong>{idea.email}</strong>…</p>}
                {mail === "sent" && <p className="text-sm flex items-start gap-2"><Mail size={16} className="text-primary mt-0.5 shrink-0" /> <span>A confirmation is on its way to <strong>{idea.email}</strong>. Watch for your quote within 24 hours (check spam if you don't see it).</span></p>}
                {mail === "failed" && <p className="text-sm text-muted-foreground flex items-start gap-2"><Mail size={16} className="mt-0.5 shrink-0" /> <span>Your request is saved, but we couldn't send the confirmation email just now. Don't worry — your quote will still reach you within 24 hours.</span></p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <Button asChild size="lg" className="glow-primary"><Link to={bookUrl}><CalendarDays size={16} className="mr-2" /> Prefer to talk? Book a call</Link></Button>
                {answers.kind === "prototype" || answers.startingPoint === "prototype"
                  ? <Button asChild size="lg" variant="outline"><Link to="/prototype-to-production">How the sprint works <ArrowRight size={16} className="ml-2" /></Link></Button>
                  : <Button asChild size="lg" variant="outline"><Link to="/portfolio">See our work <ArrowRight size={16} className="ml-2" /></Link></Button>}
              </div>

              {/* Optional details */}
              {draft && (
                <div className="glass rounded-2xl p-6 space-y-4">
                  <div>
                    <h3 className="font-display font-semibold">Want a sharper quote? <span className="text-muted-foreground font-normal text-sm">(optional)</span></h3>
                    <p className="text-xs text-muted-foreground">Add a few details or files — it helps us quote more accurately.</p>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <Field id="phone" label="Phone / WhatsApp"><Input id="phone" value={extras.phone} onChange={(e) => setExtras((x) => ({ ...x, phone: e.target.value }))} autoComplete="tel" /></Field>
                    <Field id="company" label="Company"><Input id="company" value={extras.company} onChange={(e) => setExtras((x) => ({ ...x, company: e.target.value }))} autoComplete="organization" /></Field>
                    <Field id="country" label="Country"><Input id="country" value={extras.country} onChange={(e) => setExtras((x) => ({ ...x, country: e.target.value }))} autoComplete="country-name" /></Field>
                  </div>
                  <Field id="notes" label="Anything else?"><Textarea id="notes" rows={3} value={extras.notes} onChange={(e) => setExtras((x) => ({ ...x, notes: e.target.value }))} placeholder="Deadlines, users, existing tools, reference sites…" /></Field>

                  <div>
                    <input ref={fileRef} type="file" multiple accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip" onChange={uploadFiles} className="hidden" aria-label="Upload files" />
                    <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading || attachments.length >= 5}>
                      {uploading ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Upload size={14} className="mr-2" />} Add files
                    </Button>
                    <span className="text-xs text-muted-foreground ml-3">PDF, Word, PNG, JPG, ZIP · max 5 files, 10MB each</span>
                    {attachments.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {attachments.map((p) => (
                          <li key={p} className="flex items-center gap-2 text-sm glass rounded-lg px-3 py-1.5">
                            <FileText size={14} className="text-primary shrink-0" /><span className="truncate flex-1">{p.replace(/^inquiries\/[^/]+\/\d+-/, "")}</span>
                            <button type="button" aria-label="Remove file" className="text-muted-foreground hover:text-destructive" onClick={() => removeFile(p)}><X size={14} /></button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <Button onClick={saveExtras} disabled={busy}>{busy ? "Saving…" : extrasSaved ? "Saved ✓ — update" : "Save details"}</Button>
                </div>
              )}

              <p className="text-center text-xs text-muted-foreground">
                <button type="button" onClick={startOver} className="text-primary hover:underline">Start a new request</button>
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default StartProject;
