import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { z } from "zod";
import { fetchPrimaryRole, homeForRole } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, FolderKanban, MessageSquare, FileCheck, Receipt, ArrowLeft } from "lucide-react";
import logo from "@/assets/teevexa-logo.jpeg";
import SEO from "@/components/SEO";

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
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
  // Only allow same-site relative paths (blocks "//evil.com" and absolute URLs).
  const rawRedirect = searchParams.get("redirect");
  const redirectTo = rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : null;

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return;
      if (redirectTo) navigate(redirectTo, { replace: true });
      else navigate(homeForRole(await fetchPrimaryRole(session.user.id)), { replace: true });
    });
  }, [navigate, redirectTo]);

  const set = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleRedirect = async (userId: string) => {
    if (redirectTo) { navigate(redirectTo); return; }
    navigate(homeForRole(await fetchPrimaryRole(userId)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((i) => { fieldErrors[i.path[0] as string] = i.message; });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
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
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <SEO title="Sign in" description="Sign in to your Teevexa client workspace." noindex />
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
          {/* Heading */}
          <div className="mb-6">
            <h1 className="font-display font-bold text-2xl">Client sign in</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to access your project workspace.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
                {(
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
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
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-xs text-muted-foreground text-center leading-relaxed">
            Access is by invitation. Received an invite email? Use its link to set your password.
            Need access? <Link to="/contact" className="text-primary hover:underline">Contact us</Link>.
          </p>

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
