import { useState } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, FolderKanban, FolderOpen, MessageSquare, Receipt, Settings, LogOut, Menu, X, Activity, CalendarDays, FileCheck, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationCenter from "@/components/NotificationCenter";

const navItems = [
  { path: "/client-portal", label: "Dashboard", icon: LayoutDashboard },
  { path: "/client-portal/projects", label: "My Projects", icon: FolderKanban },
  { path: "/client-portal/timeline", label: "Timeline", icon: CalendarDays },
  { path: "/client-portal/activity", label: "Activity", icon: Activity },
  { path: "/client-portal/deliverables", label: "Deliverables", icon: FileCheck },
  { path: "/client-portal/files", label: "Files", icon: FolderOpen },
  { path: "/client-portal/messages", label: "Messages", icon: MessageSquare },
  { path: "/client-portal/invoices", label: "Invoices", icon: Receipt },
  { path: "/client-portal/support", label: "Support", icon: LifeBuoy },
  { path: "/client-portal/settings", label: "Settings", icon: Settings },
];

const PortalLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!loading && !user) {
    navigate("/auth");
    return null;
  }

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-glow text-primary text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-background">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 glass rounded-lg p-2"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-sidebar-background border-r border-sidebar-border transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full p-4">
          <Link to="/" className="font-display font-bold text-xl gradient-text mb-8 mt-2 block">
            TEEVEXA
          </Link>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-sidebar-accent text-sidebar-primary font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-sidebar-border pt-4 space-y-2">
            <p className="text-xs text-muted-foreground truncate px-3">{user.email}</p>
            <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start gap-2">
              <LogOut size={16} /> Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="flex-1 overflow-auto">
        <div className="flex justify-end px-6 pt-4 lg:px-8">
          <NotificationCenter />
        </div>
        <div className="p-6 lg:p-8 pt-2 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PortalLayout;
