import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const PortalSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({ display_name: "", company: "", phone: "" });

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

  const save = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("profiles").update({
      display_name: profile.display_name.trim() || null,
      company: profile.company.trim() || null,
      phone: profile.phone.trim() || null,
    }).eq("user_id", user.id);
    setLoading(false);
    if (error) {
      toast({ title: "Update failed", variant: "destructive" });
    } else {
      toast({ title: "Profile updated" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display font-bold text-2xl">Settings</h1>

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
          <Button onClick={save} disabled={loading} className="glow-primary">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortalSettings;
