import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const PortalSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({ display_name: "", company: "", phone: "" });
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [changingPassword, setChangingPassword] = useState(false);
  const [notifications, setNotifications] = useState({ email: true, milestones: true, invoices: true });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("display_name, company, phone").eq("user_id", user.id).single();
      if (data) setProfile({
        display_name: data.display_name || "",
        company: data.company || "",
        phone: data.phone || "",
      });
    };
    load();
  }, []);

  const saveProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("profiles").update({
      display_name: profile.display_name.trim() || null,
      company: profile.company.trim() || null,
      phone: profile.phone.trim() || null,
    }).eq("user_id", user.id);
    setLoading(false);
    toast(error ? { title: "Update failed", variant: "destructive" as const } : { title: "Profile updated" });
  };

  const changePassword = async () => {
    if (passwordForm.newPass.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: passwordForm.newPass });
    setChangingPassword(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated" });
      setPasswordForm({ current: "", newPass: "", confirm: "" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display font-bold text-2xl">Settings</h1>

      {/* Profile */}
      <Card className="glass">
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input value={profile.display_name} onChange={(e) => setProfile((p) => ({ ...p, display_name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Company</Label>
            <Input value={profile.company} onChange={(e) => setProfile((p) => ({ ...p, company: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
          </div>
          <Button onClick={saveProfile} disabled={loading} className="glow-primary">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Password */}
      <Card className="glass">
        <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" value={passwordForm.newPass} onChange={(e) => setPasswordForm((f) => ({ ...f, newPass: e.target.value }))} placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <Input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm((f) => ({ ...f, confirm: e.target.value }))} placeholder="••••••••" />
          </div>
          <Button onClick={changePassword} disabled={changingPassword} variant="outline">
            {changingPassword ? "Updating..." : "Update Password"}
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="glass">
        <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Email Notifications</p><p className="text-xs text-muted-foreground">Receive updates via email</p></div>
            <Switch checked={notifications.email} onCheckedChange={(v) => setNotifications((n) => ({ ...n, email: v }))} />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Milestone Updates</p><p className="text-xs text-muted-foreground">Get notified when milestones change</p></div>
            <Switch checked={notifications.milestones} onCheckedChange={(v) => setNotifications((n) => ({ ...n, milestones: v }))} />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Invoice Alerts</p><p className="text-xs text-muted-foreground">Reminders for upcoming and overdue invoices</p></div>
            <Switch checked={notifications.invoices} onCheckedChange={(v) => setNotifications((n) => ({ ...n, invoices: v }))} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortalSettings;
