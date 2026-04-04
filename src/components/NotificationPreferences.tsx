import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Bell, MessageSquare, Milestone, Receipt, CheckSquare, Package, Info } from "lucide-react";

interface Preferences {
  email_messages: boolean;
  email_milestones: boolean;
  email_invoices: boolean;
  email_tasks: boolean;
  email_deliverables: boolean;
  email_system: boolean;
}

const defaultPrefs: Preferences = {
  email_messages: true,
  email_milestones: true,
  email_invoices: true,
  email_tasks: true,
  email_deliverables: true,
  email_system: true,
};

const prefItems: { key: keyof Preferences; label: string; description: string; icon: typeof Info }[] = [
  { key: "email_messages", label: "Project Messages", description: "New messages on your projects", icon: MessageSquare },
  { key: "email_milestones", label: "Milestone Updates", description: "When milestones are completed or approaching", icon: Milestone },
  { key: "email_invoices", label: "Invoice Alerts", description: "New invoices, payment reminders, and overdue notices", icon: Receipt },
  { key: "email_tasks", label: "Task Assignments", description: "When tasks are assigned to you or updated", icon: CheckSquare },
  { key: "email_deliverables", label: "Deliverable Reviews", description: "When deliverables need review or are approved/rejected", icon: Package },
  { key: "email_system", label: "System Notifications", description: "General platform updates and announcements", icon: Info },
];

const NotificationPreferences = () => {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<Preferences>(defaultPrefs);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPrefs = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await (supabase.from("notification_preferences") as any)
      .select("email_messages, email_milestones, email_invoices, email_tasks, email_deliverables, email_system")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setPrefs({
        email_messages: data.email_messages ?? true,
        email_milestones: data.email_milestones ?? true,
        email_invoices: data.email_invoices ?? true,
        email_tasks: data.email_tasks ?? true,
        email_deliverables: data.email_deliverables ?? true,
        email_system: data.email_system ?? true,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadPrefs(); }, [loadPrefs]);

  const togglePref = async (key: keyof Preferences, value: boolean) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await (supabase.from("notification_preferences") as any)
      .upsert({ user_id: user.id, ...updated }, { onConflict: "user_id" });

    setSaving(false);
    if (error) {
      setPrefs(prefs); // revert
      toast({ title: "Failed to save preference", variant: "destructive" });
    }
  };

  if (loading) return null;

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell size={18} /> Email Notification Preferences
        </CardTitle>
        <p className="text-sm text-muted-foreground">Choose which notifications you also receive via email. In-app notifications are always enabled.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {prefItems.map(({ key, label, description, icon: Icon }) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon size={16} className="text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </div>
            <Switch
              checked={prefs[key]}
              onCheckedChange={(v) => togglePref(key, v)}
              disabled={saving}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;
