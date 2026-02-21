import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings, User, Lock } from "lucide-react";

const AdminSettings = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState({ display_name: "", company: "", phone: "" });
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("display_name, company, phone").eq("user_id", user.id).single();
      if (data) setProfile({ display_name: data.display_name || "", company: data.company || "", phone: data.phone || "" });
    };
    load();
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("profiles").update({
      display_name: profile.display_name.trim() || null,
      company: profile.company.trim() || null,
      phone: profile.phone.trim() || null,
    }).eq("user_id", user.id);
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Profile updated" });
  };

  const changePassword = async () => {
    if (passwords.new !== passwords.confirm) { toast({ title: "Passwords don't match", variant: "destructive" }); return; }
    if (passwords.new.length < 6) { toast({ title: "Password must be at least 6 characters", variant: "destructive" }); return; }
    const { error } = await supabase.auth.updateUser({ password: passwords.new });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Password changed" });
    setPasswords({ current: "", new: "", confirm: "" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display font-bold text-2xl flex items-center gap-2"><Settings size={24} /> Settings</h1>

      <Card className="glass">
        <CardHeader><CardTitle className="flex items-center gap-2"><User size={18} /> Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Display Name</Label><Input value={profile.display_name} onChange={(e) => setProfile((p) => ({ ...p, display_name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Company</Label><Input value={profile.company} onChange={(e) => setProfile((p) => ({ ...p, company: e.target.value }))} /></div>
          </div>
          <div className="space-y-2"><Label>Phone</Label><Input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} /></div>
          <Button onClick={saveProfile} disabled={saving}>{saving ? "Saving..." : "Save Profile"}</Button>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader><CardTitle className="flex items-center gap-2"><Lock size={18} /> Change Password</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>New Password</Label><Input type="password" value={passwords.new} onChange={(e) => setPasswords((p) => ({ ...p, new: e.target.value }))} /></div>
          <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} /></div>
          <Button variant="outline" onClick={changePassword}>Change Password</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
