import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import logo from "@/assets/teevexa-logo.jpeg";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import NotificationCenter from "@/components/NotificationCenter";
import {
  LayoutDashboard, Users, FolderKanban, Milestone, Receipt, MessageSquare,
  FileText, Briefcase, Image, Clock, ScrollText, Settings, LogOut, Menu, X,
  Target, CalendarDays, ListTodo, Columns3, FileCheck, LifeBuoy
} from "lucide-react";

const navSections = [
  { label: "Overview", items: [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  ], roles: ["super_admin", "admin", "project_manager", "developer"] as AppRole[] },
  { label: "Business", items: [
    { path: "/admin/leads", label: "Leads", icon: Target },
    { path: "/admin/consultations", label: "Consultations", icon: CalendarDays },
  ], roles: ["super_admin", "admin", "project_manager"] as AppRole[] },
  { label: "Projects", items: [
    { path: "/admin/projects", label: "Projects", icon: FolderKanban },
    { path: "/admin/tasks", label: "Tasks", icon: ListTodo },
    { path: "/admin/kanban", label: "Kanban Board", icon: Columns3 },
    { path: "/admin/milestones", label: "Milestones", icon: Milestone },
    { path: "/admin/deliverables", label: "Deliverables", icon: FileCheck },
    { path: "/admin/time-tracking", label: "Time Tracking", icon: Clock },
    { path: "/admin/messages", label: "Messages", icon: MessageSquare },
    { path: "/admin/support-tickets", label: "Support Tickets", icon: LifeBuoy },
  ], roles: ["super_admin", "admin", "project_manager", "developer"] as AppRole[] },
  { label: "People", items: [
    { path: "/admin/users", label: "Users", icon: Users },
    { path: "/admin/role-activity", label: "Team Activity", icon: Users },
    { path: "/admin/invoices", label: "Invoices", icon: Receipt },
  ], roles: ["super_admin", "admin", "project_manager"] as AppRole[] },
  { label: "Content", items: [
    { path: "/admin/blog", label: "Blog", icon: FileText },
    { path: "/admin/portfolio", label: "Portfolio", icon: Image },
    { path: "/admin/careers", label: "Careers", icon: Briefcase },
    { path: "/admin/waitlist", label: "Waitlist", icon: Clock },
  ], roles: ["super_admin", "admin"] as AppRole[] },
  { label: "System", items: [
    { path: "/admin/reports", label: "Reports", icon: FileText },
    { path: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
    { path: "/admin/settings", label: "Settings", icon: Settings },
  ], roles: ["super_admin", "admin"] as AppRole[] },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect logic after loading
  if (!loading && !user) {
    navigate("/auth");
    return null;
  }

  if (!loading && role === "client") {
    navigate("/client-portal");
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

  if (!user || !role) return null;

  const filteredSections = navSections.filter((section) =>
    section.roles.includes(role)
  );

  return (
    <div className="min-h-screen flex bg-background">
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden fixed top-4 left-4 z-50 glass rounded-lg p-2">
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-sidebar-background border-r border-sidebar-border transition-transform lg:translate-x-0 overflow-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full p-4">
          <Link to="/" className="flex items-center gap-2 mb-6 mt-2">
            <img src={logo} alt="Teevexa" className="h-8 w-8 rounded-md object-cover" />
            <span className="font-display font-bold text-lg gradient-text">TEEVEXA ADMIN</span>
          </Link>

          <nav className="flex-1 space-y-4">
            {filteredSections.map((section) => (
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
            <p className="text-[10px] text-muted-foreground/60 px-3 capitalize">{role.replace("_", " ")}</p>
            <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start gap-2">
              <LogOut size={16} /> Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 overflow-auto">
        <div className="flex justify-end px-6 pt-4 lg:px-8">
          <NotificationCenter />
        </div>
        <div className="p-6 lg:p-8 pt-2 max-w-7xl mx-auto"><Outlet /></div>
      </main>
    </div>
  );
};

export default AdminLayout;
