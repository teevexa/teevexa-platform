import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Users, FolderKanban, ListTodo, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"];

interface MemberStats {
  userId: string; name: string; role: string;
  assignedProjects: number; totalTasks: number; completedTasks: number;
  inProgressTasks: number; totalHours: number;
}

const roleLabel = (r: string) => r.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

const AdminRoleActivity = () => {
  const navigate = useNavigate();
  const [filterRole, setFilterRole] = useState("all");

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["admin-role-activity"],
    queryFn: async () => {
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

      const staffRoles = roles.filter((r) => r.role !== "client");
      const uniqueUsers = Array.from(new Set(staffRoles.map((r) => r.user_id)));

      const stats: MemberStats[] = uniqueUsers.map((uid) => {
        const profile = profiles.find((p) => p.user_id === uid);
        const userRole = staffRoles.find((r) => r.user_id === uid);
        const userAssignments = assignments.filter((a) => a.user_id === uid);
        const userTasks = tasks.filter((t) => t.assigned_to === uid);
        const userTime = timeEntries.filter((t) => t.user_id === uid);

        return {
          userId: uid,
          name: profile?.display_name || "Unknown",
          role: userRole?.role || "unknown",
          assignedProjects: new Set(userAssignments.map((a) => a.project_id)).size,
          totalTasks: userTasks.length,
          completedTasks: userTasks.filter((t) => t.status === "done").length,
          inProgressTasks: userTasks.filter((t) => t.status === "in-progress" || t.status === "in_progress").length,
          totalHours: userTime.reduce((s, t) => s + Number(t.hours), 0),
        };
      });

      return stats.sort((a, b) => b.totalTasks - a.totalTasks);
    },
    staleTime: 60_000,
  });

  const filtered = filterRole === "all" ? members : members.filter((m) => m.role === filterRole);

  const totalTasks = filtered.reduce((s, m) => s + m.totalTasks, 0);
  const totalCompleted = filtered.reduce((s, m) => s + m.completedTasks, 0);
  const totalHours = filtered.reduce((s, m) => s + m.totalHours, 0);

  const chartData = filtered.map((m) => ({
    name: m.name.length > 12 ? m.name.slice(0, 12) + "…" : m.name,
    tasks: m.totalTasks,
    completed: m.completedTasks,
    hours: m.totalHours,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold">Role Activity Dashboard</h1>
        <p className="text-muted-foreground text-sm">See what each team member is working on across projects</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass"><CardContent className="pt-6 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10"><Users className="text-primary" size={24} /></div>
          <div><p className="text-2xl font-bold">{filtered.length}</p><p className="text-sm text-muted-foreground">Team Members</p></div>
        </CardContent></Card>
        <Card className="glass"><CardContent className="pt-6 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10"><ListTodo className="text-primary" size={24} /></div>
          <div><p className="text-2xl font-bold">{totalTasks}</p><p className="text-sm text-muted-foreground">Total Tasks</p></div>
        </CardContent></Card>
        <Card className="glass"><CardContent className="pt-6 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10"><FolderKanban className="text-primary" size={24} /></div>
          <div><p className="text-2xl font-bold">{totalCompleted}</p><p className="text-sm text-muted-foreground">Completed</p></div>
        </CardContent></Card>
        <Card className="glass"><CardContent className="pt-6 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10"><Clock className="text-primary" size={24} /></div>
          <div><p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p><p className="text-sm text-muted-foreground">Total Hours</p></div>
        </CardContent></Card>
      </div>

      {/* Workload Chart */}
      <Card className="glass">
        <CardHeader><CardTitle className="text-base">Team Workload Overview</CardTitle></CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="tasks" name="Total Tasks" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                <Bar dataKey="hours" name="Hours Logged" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
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

      {/* Table — rows are clickable to drill into that member's tasks */}
      <Card className="glass">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-10 rounded bg-muted animate-pulse" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Member</TableHead><TableHead>Role</TableHead><TableHead>Projects</TableHead>
                  <TableHead>Tasks</TableHead><TableHead>Progress</TableHead><TableHead>Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No team members found</TableCell></TableRow>
                ) : filtered.map((m) => {
                  const pct = m.totalTasks > 0 ? Math.round((m.completedTasks / m.totalTasks) * 100) : 0;
                  return (
                    <TableRow
                      key={m.userId}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/admin/tasks?assigned=${m.userId}`)}
                      title={`View ${m.name}'s tasks`}
                    >
                      <TableCell className="font-medium">
                        <div>
                          <p>{m.name}</p>
                          <p className="text-xs text-primary">View tasks →</p>
                        </div>
                      </TableCell>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRoleActivity;
