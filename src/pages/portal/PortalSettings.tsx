import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useBlocker } from "react-router-dom";
import NotificationPreferences from "@/components/NotificationPreferences";

function passwordStrength(pw: string): { label: string; color: string; width: string } {
  if (pw.length === 0) return { label: "", color: "", width: "0%" };
  if (pw.length < 6) return { label: "Too short", color: "bg-destructive", width: "25%" };
  if (pw.length < 8) return { label: "Weak", color: "bg-orange-500", width: "40%" };
  const hasUpper = /[A-Z]/.test(pw);
  const hasNum = /[0-9]/.test(pw);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pw);
  const score = [hasUpper, hasNum, hasSpecial].filter(Boolean).length;
  if (score === 0) return { label: "Fair", color: "bg-yellow-500", width: "55%" };
  if (score === 1) return { label: "Good", color: "bg-primary", width: "75%" };
  return { label: "Strong", color: "bg-green-500", width: "100%" };
}

const PortalSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [profile, setProfile] = useState({ display_name: "", company: "", phone: "" });
  const [savedProfile, setSavedProfile] = useState({ display_name: "", company: "", phone: "" });
  const [passwordForm, setPasswordForm] = useState({ newPass: "", confirm: "" });
  const [changingPassword, setChangingPassword] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name, company, phone").eq("user_id", user.id).single()
      .then(({ data }) => {
        if (data) {
          const p = { display_name: data.display_name || "", company: data.company || "", phone: data.phone || "" };
          setProfile(p);
          setSavedProfile(p);
        }
      });
  }, [user]);

  // Track dirty state
  useEffect(() => {
    setIsDirty(
      profile.display_name !== savedProfile.display_name ||
      profile.company !== savedProfile.company ||
      profile.phone !== savedProfile.phone
    );
  }, [profile, savedProfile]);

  // Warn before navigating away with unsaved changes
  useBlocker(() => {
    if (!isDirty) return false;
    return !window.confirm("You have unsaved profile changes. Leave without saving?");
  });

  const saveProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update({
      display_name: profile.display_name.trim() || null,
      company: profile.company.trim() || null,
      phone: profile.phone.trim() || null,
    }).eq("user_id", user.id);
    setLoading(false);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      setSavedProfile({ ...profile });
      setIsDirty(false);
      toast({ title: "Profile updated" });
    }
  };

  const changePassword = async () => {
    if (passwordForm.newPass.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" }); return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" }); return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: passwordForm.newPass });
    setChangingPassword(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated successfully" });
      setPasswordForm({ newPass: "", confirm: "" });
    }
  };

  const strength = passwordStrength(passwordForm.newPass);

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="font-display font-bold text-2xl">Settings</h1>

      {/* Profile */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Profile
            {isDirty && <span className="text-xs text-amber-400 font-normal">Unsaved changes</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user?.email && (
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">Email address</Label>
              <p className="text-sm font-medium">{user.email}</p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name</Label>
            <Input id="display_name" value={profile.display_name} onChange={(e) => setProfile((p) => ({ ...p, display_name: e.target.value }))} placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" value={profile.company} onChange={(e) => setProfile((p) => ({ ...p, company: e.target.value }))} placeholder="Your company" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} placeholder="+254 ..." />
          </div>
          <Button onClick={saveProfile} disabled={loading || !isDirty} className="glow-primary">
            {loading ? "Saving…" : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Password */}
      <Card className="glass">
        <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Choose a new password for your account. You'll remain logged in on this device.</p>
          <div className="space-y-2">
            <Label htmlFor="newPass">New Password</Label>
            <Input id="newPass" type="password" value={passwordForm.newPass} onChange={(e) => setPasswordForm((f) => ({ ...f, newPass: e.target.value }))} placeholder="••••••••" />
            {passwordForm.newPass && (
              <div className="space-y-1">
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
                </div>
                <p className="text-xs text-muted-foreground">{strength.label}</p>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm New Password</Label>
            <Input id="confirm" type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm((f) => ({ ...f, confirm: e.target.value }))} placeholder="••••••••" />
            {passwordForm.confirm && passwordForm.newPass !== passwordForm.confirm && (
              <p className="text-xs text-destructive">Passwords don't match</p>
            )}
          </div>
          <Button onClick={changePassword} disabled={changingPassword || !passwordForm.newPass || passwordForm.newPass !== passwordForm.confirm} variant="outline">
            {changingPassword ? "Updating…" : "Update Password"}
          </Button>
        </CardContent>
      </Card>

      <NotificationPreferences />
    </div>
  );
};

export default PortalSettings;
