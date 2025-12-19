import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function DashboardRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-gray-50">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect based on role
  const role = user.role?.toLowerCase() || "";
  
  switch (role) {
    case "admin":
      return <Navigate to="/dashboard/admin" replace />;
    case "donor":
      return <Navigate to="/dashboard/donor" replace />;
    case "receiver":
      return <Navigate to="/dashboard/receiver" replace />;
    case "rider":
      return <Navigate to="/dashboard/rider" replace />;
    default:
        // Fallback or Unknown Role
      return <Navigate to="/auth" replace />;
  }
}
