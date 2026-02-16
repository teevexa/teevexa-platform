import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FolderKanban, Receipt, MessageSquare, CalendarDays } from "lucide-react";

const Dashboard = () => {
  const [profile, setProfile] = useState<{ display_name: string | null } | null>(null);
  const [stats, setStats] = useState({ projects: 0, invoices: 0, messages: 0 });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, projectsRes, invoicesRes] = await Promise.all([
        supabase.from("profiles").select("display_name").eq("user_id", user.id).single(),
        supabase.from("client_projects").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("invoices").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);

      setProfile(profileRes.data);
      setStats({
        projects: projectsRes.count || 0,
        invoices: invoicesRes.count || 0,
        messages: 0,
      });
    };
    load();
  }, []);

  const widgets = [
    { label: "Active Projects", value: stats.projects, icon: FolderKanban, color: "text-primary" },
    { label: "Invoices", value: stats.invoices, icon: Receipt, color: "text-accent" },
    { label: "Messages", value: stats.messages, icon: MessageSquare, color: "text-primary" },
    { label: "Upcoming Meetings", value: 0, icon: CalendarDays, color: "text-accent" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl">
          Welcome{profile?.display_name ? `, ${profile.display_name}` : ""}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Here's your project overview</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {widgets.map((w) => (
          <Card key={w.label} className="glass">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{w.label}</CardTitle>
              <w.icon size={18} className={w.color} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-display font-bold">{w.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placeholder milestones */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg">Recent Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.projects === 0 ? (
            <p className="text-sm text-muted-foreground">No active projects yet. Your milestones will appear here.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Project Setup</span>
                <span className="text-primary">Complete</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
