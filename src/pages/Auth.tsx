import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, FolderKanban, MessageSquare, FileCheck, Receipt, ArrowLeft } from "lucide-react";
import logo from "@/assets/teevexa-logo.jpeg";

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().trim().min(2, "Name is required").max(100),
});

const portalFeatures = [
  { icon: FolderKanban, text: "Track every project milestone in real time" },
  { icon: MessageSquare, text: "Message your team directly from the portal" },
  { icon: FileCheck, text: "Review and approve deliverables instantly" },
  { icon: Receipt, text: "View invoices and billing history anytime" },
];

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const defaultMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const redirectTo = searchParams.get("redirect") || null;

  const [mode, setMode] = useState<"login" | "signup">(defaultMode as "login" | "signup");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && redirectTo) navigate(redirectTo);
    });
  }, [navigate, redirectTo]);

  // Reset form on mode switch
  const switchMode = (m: "login" | "signup") => {
    setMode(m);
    setErrors({});
    setForm({ fullName: "", email: form.email, password: "" });
    setShowPassword(false);
  };

  const set = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleRedirect = async (userId: string) => {
    if (redirectTo) { navigate(redirectTo); return; }
    const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", userId).single();
    const role = roleData?.role;
    navigate(role && role !== "client" ? "/admin" : "/client-portal");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const schema = mode === "signup" ? signupSchema : loginSchema;
    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((i) => { fieldErrors[i.path[0] as string] = i.message; });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: { full_name: form.fullName.trim() },
          emailRedirectTo: window.location.origin,
        },
      });
      setLoading(false);
      if (error) { toast({ title: "Sign up failed", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Check your email", description: "We sent you a confirmation link to activate your account." });
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });
      setLoading(false);
      if (error) {
        toast({ title: "Sign in failed", description: "Incorrect email or password. Please try again.", variant: "destructive" });
        setErrors({ password: "Incorrect email or password" });
        return;
      }
      if (data.user) await handleRedirect(data.user.id);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col justify-between p-12 bg-gradient-to-br from-[hsl(222_47%_8%)] via-[hsl(215_50%_10%)] to-[hsl(186_60%_8%)] relative overflow-hidden">
        {/* Background glow orbs */}
        <div className="absolute top-1/4 right-0 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 left-0 w-60 h-60 rounded-full bg-accent/8 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <img src={logo} alt="Teevexa" className="h-10 w-10 rounded-lg object-cover" />
            <span className="text-xl font-display font-bold text-white tracking-tight">TEEVEXA</span>
          </Link>
        </div>

        {/* Headline */}
        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-3">Project Workspace</p>
            <h2 className="text-3xl xl:text-4xl font-display font-bold text-white leading-tight mb-4">
              Your projects,<br />
              <span className="bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">
                your way.
              </span>
            </h2>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              A dedicated workspace where you can track progress, collaborate with our team, and stay in control of your build.
            </p>
          </div>

          <ul className="space-y-4">
            {portalFeatures.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-primary" />
                </div>
                <span className="text-sm text-white/70">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer note */}
        <p className="relative z-10 text-xs text-white/30">
          © 2026 TEEVEXA LTD · Nairobi, Kenya
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-background min-h-screen lg:min-h-0">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <img src={logo} alt="Teevexa" className="h-9 w-9 rounded-md object-cover" />
            <span className="text-xl font-display font-bold gradient-text">TEEVEXA</span>
          </Link>
        </div>

        <div className="w-full max-w-sm">
          {/* Mode tabs */}
          <div className="flex rounded-xl border border-border bg-muted/50 p-1 mb-8">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "login"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "signup"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="font-display font-bold text-2xl">
              {mode === "login" ? "Welcome back" : "Get started"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "login"
                ? "Sign in to access your project workspace."
                : "Create your account to access your workspace."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  placeholder="Jane Mwangi"
                  autoComplete="name"
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                />
                {errors.fullName && (
                  <p id="fullName-error" className="text-xs text-destructive">{errors.fullName}</p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === "login" && (
                  <a href="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="pr-10"
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            <Button type="submit" className="w-full glow-primary mt-2" disabled={loading} size="lg">
              {loading
                ? (mode === "login" ? "Signing in…" : "Creating account…")
                : (mode === "login" ? "Sign In" : "Create Account")}
            </Button>
          </form>

          {/* Divider + Back to website */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={14} />
              Back to teevexa.com
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
