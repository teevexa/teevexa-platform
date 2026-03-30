import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Users, FolderKanban, ListTodo, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

interface MemberStats {
  userId: string;
  name: string;
  role: string;
  assignedProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  totalHours: number;
}

const AdminRoleActivity = () => {
  const [members, setMembers] = useState<MemberStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const [rolesRes, profilesRes, assignmentsRes, tasksRes, timeRes] = await Promise.all([
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("profiles").select("user_id, display_name"),
        supabase.from("project_assignments").select("user_id, project_id"),
        supabase.from("project_tasks").select("assigned_to, status"),
        supabase.from("time_entries").select("user_id, hours"),
      ]);

      const roles = rolesRes.data || [];
      const profiles = profilesRes.data || [];
      const assignments = assignmentsRes.data || [];
      const tasks = tasksRes.data || [];
      const timeEntries = timeRes.data || [];

      // Only show non-client roles
      const staffRoles = roles.filter(r => r.role !== "client");
      const uniqueUsers = Array.from(new Set(staffRoles.map(r => r.user_id)));

      const stats: MemberStats[] = uniqueUsers.map(uid => {
        const profile = profiles.find(p => p.user_id === uid);
        const userRole = staffRoles.find(r => r.user_id === uid);
        const userAssignments = assignments.filter(a => a.user_id === uid);
        const userTasks = tasks.filter(t => t.assigned_to === uid);
        const userTime = timeEntries.filter(t => t.user_id === uid);

        return {
          userId: uid,
          name: profile?.display_name || "Unknown",
          role: userRole?.role || "unknown",
          assignedProjects: new Set(userAssignments.map(a => a.project_id)).size,
          totalTasks: userTasks.length,
          completedTasks: userTasks.filter(t => t.status === "done").length,
          inProgressTasks: userTasks.filter(t => t.status === "in-progress" || t.status === "in_progress").length,
          totalHours: userTime.reduce((s, t) => s + Number(t.hours), 0),
        };
      });

      setMembers(stats.sort((a, b) => b.totalTasks - a.totalTasks));
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = filterRole === "all" ? members : members.filter(m => m.role === filterRole);

  const totalTasks = filtered.reduce((s, m) => s + m.totalTasks, 0);
  const totalCompleted = filtered.reduce((s, m) => s + m.completedTasks, 0);
  const totalHours = filtered.reduce((s, m) => s + m.totalHours, 0);

  const chartData = filtered.map(m => ({
    name: m.name.length > 12 ? m.name.slice(0, 12) + "…" : m.name,
    tasks: m.totalTasks,
    completed: m.completedTasks,
    hours: m.totalHours,
  }));

  const roleLabel = (r: string) => r.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase());

  if (loading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Role Activity Dashboard</h1>
        <p className="text-muted-foreground text-sm">See what each team member is working on across projects</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10"><Users className="text-primary" size={24} /></div>
          <div><p className="text-2xl font-bold">{filtered.length}</p><p className="text-sm text-muted-foreground">Team Members</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10"><ListTodo className="text-primary" size={24} /></div>
          <div><p className="text-2xl font-bold">{totalTasks}</p><p className="text-sm text-muted-foreground">Total Tasks</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10"><FolderKanban className="text-primary" size={24} /></div>
          <div><p className="text-2xl font-bold">{totalCompleted}</p><p className="text-sm text-muted-foreground">Completed</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10"><Clock className="text-primary" size={24} /></div>
          <div><p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p><p className="text-sm text-muted-foreground">Total Hours</p></div>
        </CardContent></Card>
      </div>

      {/* Workload Chart */}
      <Card>
        <CardHeader><CardTitle className="text-base">Team Workload Overview</CardTitle></CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="tasks" name="Total Tasks" fill="hsl(var(--chart-2))" radius={[4,4,0,0]} />
                <Bar dataKey="completed" name="Completed" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                <Bar dataKey="hours" name="Hours Logged" fill="hsl(var(--chart-3))" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-muted-foreground py-8">No team data yet</p>}
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex gap-3">
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="project_manager">Project Manager</SelectItem>
            <SelectItem value="developer">Developer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No team members found</TableCell></TableRow>
              ) : filtered.map(m => {
                const pct = m.totalTasks > 0 ? Math.round((m.completedTasks / m.totalTasks) * 100) : 0;
                return (
                  <TableRow key={m.userId}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell><Badge variant="secondary">{roleLabel(m.role)}</Badge></TableCell>
                    <TableCell>{m.assignedProjects}</TableCell>
                    <TableCell>
                      <span className="text-sm">{m.completedTasks}/{m.totalTasks}</span>
                      {m.inProgressTasks > 0 && <span className="text-xs text-muted-foreground ml-1">({m.inProgressTasks} active)</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <Progress value={pct} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground w-8">{pct}%</span>
                      </div>
                    </TableCell>
                    <TableCell><span className="font-semibold">{m.totalHours.toFixed(1)}h</span></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRoleActivity;
