import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserPlus, ArrowLeft } from "lucide-react";

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().trim().min(2, "Name is required").max(100),
});

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
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
      if (error) {
        toast({ title: "Signup failed", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Check your email", description: "We sent you a confirmation link." });
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });
      setLoading(false);
      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
        return;
      }
      navigate("/client-portal");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 gradient-hero network-bg">
      <div className="w-full max-w-md">
        <div className="glass rounded-2xl p-8 animate-fade-in">
          <div className="text-center mb-6">
            <h1 className="font-display font-bold text-2xl mb-1">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "login" ? "Sign in to your client portal" : "Join the client portal"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="John Doe" />
                {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
              </div>
            )}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <Button type="submit" className="w-full glow-primary" disabled={loading}>
              {loading ? "Please wait..." : mode === "login" ? (
                <><LogIn size={16} /> Sign In</>
              ) : (
                <><UserPlus size={16} /> Create Account</>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <p>Don't have an account?{" "}
                <button onClick={() => setMode("signup")} className="text-primary hover:underline">Sign up</button>
              </p>
            ) : (
              <p>Already have an account?{" "}
                <button onClick={() => setMode("login")} className="text-primary hover:underline">Sign in</button>
              </p>
            )}
          </div>

          <div className="mt-6 text-center">
            <Button variant="ghost" size="sm" asChild>
              <a href="/"><ArrowLeft size={14} /> Back to Home</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Auth;
