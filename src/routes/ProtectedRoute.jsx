import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getRole, isAuthenticated } from "../utils/auth";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();
  const role = getRole();

  if (!isAuthenticated()) {
    const loginPath = allowedRoles.includes("ADMIN") ? "/admin/login" : "/login";
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    if (role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
    if (role === "DEALER") return <Navigate to="/dealer/dashboard" replace />;
    if (role === "SALESPERSON") return <Navigate to="/salesperson/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
