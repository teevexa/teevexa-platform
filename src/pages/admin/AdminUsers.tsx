import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { logAudit } from "@/lib/audit";
import { Users } from "lucide-react";

interface Profile {
  id: string; user_id: string; display_name: string | null;
  company: string | null; phone: string | null; created_at: string;
}
interface UserRole { user_id: string; role: string; }

const roleOptions = ["client", "developer", "project_manager", "admin", "super_admin"];

const AdminUsers = () => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [pRes, rRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    setProfiles(pRes.data || []);
    const roleMap: Record<string, string> = {};
    (rRes.data || []).forEach((r: UserRole) => { roleMap[r.user_id] = r.role; });
    setRoles(roleMap);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const changeRole = async (userId: string, newRole: string, displayName: string | null) => {
    const oldRole = roles[userId] || "client";
    if (oldRole === newRole) return;

    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole as "admin" | "client" | "developer" | "project_manager" | "super_admin" })
      .eq("user_id", userId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    await logAudit({
      action: "update",
      entity_type: "user_role",
      entity_id: userId,
      details: { user_name: displayName, old_role: oldRole, new_role: newRole },
    });

    setRoles((prev) => ({ ...prev, [userId]: newRole }));
    toast({ title: `Role updated to ${newRole}` });
  };

  const roleColor: Record<string, string> = {
    super_admin: "bg-destructive/20 text-destructive",
    admin: "bg-primary/20 text-primary",
    project_manager: "bg-accent/20 text-accent",
    developer: "bg-green-500/20 text-green-400",
    client: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display font-bold text-2xl">Users</h1>

      {loading ? <p className="text-muted-foreground">Loading...</p> : profiles.length === 0 ? (
        <Card className="glass"><CardContent className="py-12 text-center"><Users className="mx-auto text-muted-foreground mb-4" size={48} /><p className="text-muted-foreground">No users found.</p></CardContent></Card>
      ) : (
        <Card className="glass overflow-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Name</TableHead><TableHead>Company</TableHead><TableHead>Role</TableHead><TableHead>Joined</TableHead><TableHead>Change Role</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {profiles.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.display_name || "—"}</TableCell>
                  <TableCell>{p.company || "—"}</TableCell>
                  <TableCell><Badge className={roleColor[roles[p.user_id]] || roleColor.client}>{roles[p.user_id] || "client"}</Badge></TableCell>
                  <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Select value={roles[p.user_id] || "client"} onValueChange={(v) => changeRole(p.user_id, v, p.display_name)}>
                      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((r) => (
                          <SelectItem key={r} value={r}>{r.replace(/_/g, " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default AdminUsers;
