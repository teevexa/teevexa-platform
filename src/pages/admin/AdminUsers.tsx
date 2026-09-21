import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { logAudit } from "@/lib/audit";
import { Users } from "lucide-react";

interface Profile {
  id: string; user_id: string; display_name: string | null;
  company: string | null; phone: string | null; created_at: string;
}
interface UserRole { user_id: string; role: string; }

const roleOptions = ["client", "developer", "project_manager", "admin", "super_admin", "trace_client", "field_agent"];
// Highest privilege first; used to pick the single "primary" role a user is shown/edited with.
const ROLE_RANK = ["super_admin", "admin", "project_manager", "developer", "trace_client", "field_agent", "client"];
const primaryOf = (rs: string[] | undefined) => ROLE_RANK.find((r) => rs?.includes(r)) ?? "client";

const AdminUsers = () => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Record<string, string[]>>({});
  const { user: me, role: myRole } = useAuth();
  const iAmSuper = myRole === "super_admin";
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<{ userId: string; newRole: string; oldRole: string; displayName: string | null } | null>(null);

  const load = async () => {
    const [pRes, rRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    setProfiles(pRes.data || []);
    const roleMap: Record<string, string[]> = {};
    (rRes.data || []).forEach((r: UserRole) => { (roleMap[r.user_id] ||= []).push(r.role); });
    setRoles(roleMap);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const requestRoleChange = (userId: string, newRole: string, displayName: string | null) => {
    const oldRole = primaryOf(roles[userId]);
    if (oldRole === newRole) return;
    if (userId === me?.id) {
      toast({ title: "You can't change your own role", description: "Ask another super admin.", variant: "destructive" });
      return;
    }
    setPending({ userId, newRole, oldRole, displayName });
  };

  const confirmRoleChange = async () => {
    if (!pending) return;
    const { userId, newRole, oldRole, displayName } = pending;
    setPending(null);

    // Users can hold several roles: add the new one first, then remove the others, so nobody is ever left role-less.
    type DbRole = "admin" | "client" | "developer" | "project_manager" | "super_admin" | "trace_client" | "field_agent";
    const { error: addErr } = await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role: newRole as DbRole }, { onConflict: "user_id,role", ignoreDuplicates: true });
    const { error: delErr } = addErr
      ? { error: null }
      : await supabase.from("user_roles").delete().eq("user_id", userId).neq("role", newRole as DbRole);
    const error = addErr || delErr;

    if (error) {
      toast({ title: "Couldn't change the role", description: error.message, variant: "destructive" });
      return;
    }

    await logAudit({
      action: "update",
      entity_type: "user_role",
      entity_id: userId,
      details: { user_name: displayName, old_role: oldRole, new_role: newRole },
    });

    setRoles((prev) => ({ ...prev, [userId]: [newRole] }));
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
                  <TableCell><div className="flex flex-wrap gap-1">{(roles[p.user_id]?.length ? roles[p.user_id] : ["client"]).map((r) => <Badge key={r} className={roleColor[r] || roleColor.client}>{r.replace(/_/g, " ")}</Badge>)}</div></TableCell>
                  <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Select value={primaryOf(roles[p.user_id])} disabled={p.user_id === me?.id || (!iAmSuper && (roles[p.user_id] ?? []).some((r) => r === "admin" || r === "super_admin"))} onValueChange={(v) => requestRoleChange(p.user_id, v, p.display_name)}>
                      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {roleOptions.filter((r) => iAmSuper || (r !== "admin" && r !== "super_admin")).map((r) => (
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

      <AlertDialog open={!!pending} onOpenChange={() => setPending(null)}>
        <AlertDialogContent className="glass">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
            <AlertDialogDescription>
              Change <strong>{pending?.displayName || "this user"}</strong>'s role from{" "}
              <strong>{pending?.oldRole?.replace(/_/g, " ")}</strong> to{" "}
              <strong className={pending?.newRole === "super_admin" ? "text-destructive" : ""}>
                {pending?.newRole?.replace(/_/g, " ")}
              </strong>?
              {pending?.newRole === "super_admin" && (
                <span className="block mt-2 text-destructive font-medium">
                  Warning: super_admin has unrestricted access to all data and settings.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRoleChange}
              className={pending?.newRole === "super_admin" ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
