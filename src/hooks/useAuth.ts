import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type AppRole =
  | "super_admin"
  | "admin"
  | "project_manager"
  | "developer"
  | "trace_client"
  | "field_agent"
  | "client";

// Highest privilege first. A user holding several roles gets the first match.
const ROLE_PRIORITY: AppRole[] = [
  "super_admin",
  "admin",
  "project_manager",
  "developer",
  "trace_client",
  "field_agent",
  "client",
];

export const TEAM_ROLES: AppRole[] = ["super_admin", "admin", "project_manager", "developer"];

export const isTeamRole = (role: AppRole | null | undefined): boolean => !!role && TEAM_ROLES.includes(role);

/** Where a signed-in user should land by default. */
export const homeForRole = (role: AppRole | null | undefined): string =>
  isTeamRole(role) ? "/admin" : "/client-portal";

/** Fetches every role the user holds and returns the highest-privilege one (defaults to "client"). */
export async function fetchPrimaryRole(userId: string): Promise<AppRole> {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error || !data || data.length === 0) return "client";
  const held = new Set(data.map((r) => r.role as string));
  return ROLE_PRIORITY.find((r) => held.has(r)) ?? "client";
}

interface AuthState {
  user: User | null;
  role: AppRole | null;
  loading: boolean;
  isAdmin: boolean;
}

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let request = 0; // ignore out-of-order role responses
    let currentId: string | null = null;

    const apply = (currentUser: User | null) => {
      const id = ++request;
      if (!currentUser) {
        currentId = null;
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }
      // Keep `loading` true until the role is known so guards never see a signed-in user with role === null.
      if (currentId !== currentUser.id) {
        currentId = currentUser.id;
        setRole(null);
        setLoading(true);
      }
      setUser(currentUser);
      // Deferred with setTimeout: calling Supabase inside onAuthStateChange can deadlock.
      setTimeout(() => {
        fetchPrimaryRole(currentUser.id).then((r) => {
          if (!mounted || id !== request) return;
          setRole(r);
          setLoading(false);
        });
      }, 0);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      // Token refreshes don't change who the user is; avoid flashing a loading state.
      if (event === "TOKEN_REFRESHED") return;
      apply(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      apply(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, role, loading, isAdmin: isTeamRole(role) };
};
