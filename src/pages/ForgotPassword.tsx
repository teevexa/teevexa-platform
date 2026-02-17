import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 gradient-hero network-bg">
      <div className="w-full max-w-md">
        <div className="glass rounded-2xl p-8 animate-fade-in">
          <div className="text-center mb-6">
            <Mail className="mx-auto text-primary mb-3" size={32} />
            <h1 className="font-display font-bold text-2xl mb-1">Reset Password</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and we'll send a reset link.
            </p>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                If an account exists with that email, you'll receive a reset link shortly.
              </p>
              <Button variant="outline" asChild>
                <Link to="/auth"><ArrowLeft size={14} className="mr-2" /> Back to Login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <Button type="submit" className="w-full glow-primary" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
              <div className="text-center">
                <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary">
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
