import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function RoleRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role?.toLowerCase())) {
    console.warn(`[RoleRoute] Access denied. User role '${user.role}' not in allowed list [${allowedRoles}]. Redirecting to /dashboard/${user.role?.toLowerCase()}`);
    // Redirect to their appropriate dashboard if they try to access unauthorized area
    return <Navigate to={`/dashboard/${user.role?.toLowerCase()}`} replace />;
  }

  return <Outlet />;
}
