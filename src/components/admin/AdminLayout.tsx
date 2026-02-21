import { useEffect, useState } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";
import {
  LayoutDashboard, Users, FolderKanban, Milestone, Receipt, MessageSquare,
  FileText, Briefcase, Image, Clock, ScrollText, Settings, LogOut, Menu, X,
  Target, CalendarDays
} from "lucide-react";

const navSections = [
  { label: "Overview", items: [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  ]},
  { label: "Business", items: [
    { path: "/admin/leads", label: "Leads", icon: Target },
    { path: "/admin/consultations", label: "Consultations", icon: CalendarDays },
  ]},
  { label: "Projects", items: [
    { path: "/admin/projects", label: "Projects", icon: FolderKanban },
    { path: "/admin/milestones", label: "Milestones", icon: Milestone },
  ]},
  { label: "People", items: [
    { path: "/admin/users", label: "Users", icon: Users },
    { path: "/admin/invoices", label: "Invoices", icon: Receipt },
  ]},
  { label: "Content", items: [
    { path: "/admin/blog", label: "Blog", icon: FileText },
    { path: "/admin/portfolio", label: "Portfolio", icon: Image },
    { path: "/admin/careers", label: "Careers", icon: Briefcase },
    { path: "/admin/waitlist", label: "Waitlist", icon: Clock },
  ]},
  { label: "System", items: [
    { path: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
    { path: "/admin/settings", label: "Settings", icon: Settings },
  ]},
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const checkAccess = async (userId: string) => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).single();
      const role = data?.role;
      if (!role || role === "client") {
        navigate("/client-portal");
        return;
      }
      // Developers see limited nav
      setUserRole(role);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) { navigate("/auth"); return; }
      checkAccess(session.user.id);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) { navigate("/auth"); return; }
      checkAccess(session.user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const logout = async () => { await supabase.auth.signOut(); navigate("/"); };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse-glow text-primary text-lg">Loading...</div></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-background">
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden fixed top-4 left-4 z-50 glass rounded-lg p-2">
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-sidebar-background border-r border-sidebar-border transition-transform lg:translate-x-0 overflow-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full p-4">
          <Link to="/" className="font-display font-bold text-xl gradient-text mb-6 mt-2 block">TEEVEXA ADMIN</Link>

          <nav className="flex-1 space-y-4">
            {navSections
              .filter((section) => {
                if (userRole === "developer") return ["Overview", "Projects"].includes(section.label);
                if (userRole === "project_manager") return !["System"].includes(section.label) || section.label === "System";
                return true;
              })
              .map((section) => (
              <div key={section.label}>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 mb-1">{section.label}</p>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                      <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active ? "bg-sidebar-accent text-sidebar-primary font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent/50"}`}>
                        <item.icon size={16} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-sidebar-border pt-4 space-y-2">
            <p className="text-xs text-muted-foreground truncate px-3">{user.email}</p>
            <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start gap-2">
              <LogOut size={16} /> Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto"><Outlet /></div>
      </main>
    </div>
  );
};

export default AdminLayout;
