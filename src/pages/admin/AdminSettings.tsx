import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings, User, Lock } from "lucide-react";
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

const AdminSettings = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState({ display_name: "", company: "", phone: "" });
  const [savedProfile, setSavedProfile] = useState({ display_name: "", company: "", phone: "" });
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const isDirty =
    profile.display_name !== savedProfile.display_name ||
    profile.company !== savedProfile.company ||
    profile.phone !== savedProfile.phone;

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

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: profile.display_name.trim() || null,
      company: profile.company.trim() || null,
      phone: profile.phone.trim() || null,
    }).eq("user_id", user.id);
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setSavedProfile({ ...profile });
    toast({ title: "Profile updated" });
  };

  const changePassword = async () => {
    if (passwords.new.length < 6) { toast({ title: "Password must be at least 6 characters", variant: "destructive" }); return; }
    if (passwords.new !== passwords.confirm) { toast({ title: "Passwords don't match", variant: "destructive" }); return; }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: passwords.new });
    setChangingPassword(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Password updated" });
    setPasswords({ new: "", confirm: "" });
  };

  const strength = passwordStrength(passwords.new);

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="font-display font-bold text-2xl flex items-center gap-2"><Settings size={24} /> Settings</h1>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2"><User size={18} /> Profile</span>
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
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input id="display_name" value={profile.display_name} onChange={(e) => setProfile((p) => ({ ...p, display_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" value={profile.company} onChange={(e) => setProfile((p) => ({ ...p, company: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
          </div>
          <Button onClick={saveProfile} disabled={saving || !isDirty} className="glow-primary">
            {saving ? "Saving…" : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader><CardTitle className="flex items-center gap-2"><Lock size={18} /> Change Password</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Choose a new password. You'll remain logged in on this device.</p>
          <div className="space-y-2">
            <Label htmlFor="newPass">New Password</Label>
            <Input id="newPass" type="password" value={passwords.new} onChange={(e) => setPasswords((p) => ({ ...p, new: e.target.value }))} placeholder="••••••••" />
            {passwords.new && (
              <div className="space-y-1">
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
                </div>
                <p className="text-xs text-muted-foreground">{strength.label}</p>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input id="confirm" type="password" value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} placeholder="••••••••" />
            {passwords.confirm && passwords.new !== passwords.confirm && (
              <p className="text-xs text-destructive">Passwords don't match</p>
            )}
          </div>
          <Button variant="outline" onClick={changePassword} disabled={changingPassword || !passwords.new || passwords.new !== passwords.confirm}>
            {changingPassword ? "Updating…" : "Update Password"}
          </Button>
        </CardContent>
      </Card>

      <NotificationPreferences />
    </div>
  );
};

export default AdminSettings;
