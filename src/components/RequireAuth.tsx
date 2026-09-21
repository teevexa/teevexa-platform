import { Navigate, useLocation } from "react-router-dom";
import { useAuth, isTeamRole, homeForRole } from "@/hooks/useAuth";

const FullPageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-pulse-glow text-primary text-lg">Loading...</div>
  </div>
);

interface Props {
  /** "team" = staff roles only; "any" = any signed-in user. */
  require: "team" | "any";
  children: React.ReactNode;
}

/**
 * Route guard. Uses <Navigate> (never navigate() during render) and waits for the role to be known
 * before deciding, so a signed-in user is never bounced by a transient `role === null`.
 */
const RequireAuth = ({ require, children }: Props) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader />;

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?redirect=${redirect}`} replace />;
  }
  if (require === "team" && !isTeamRole(role)) {
    return <Navigate to={homeForRole(role)} replace />;
  }
  return <>{children}</>;
};

export default RequireAuth;
export { FullPageLoader };
