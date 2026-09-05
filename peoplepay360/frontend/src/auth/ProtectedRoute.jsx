import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { canAccessHR, canAccessPayroll, getHomeRoute, isEmployee } from "./permissions.js";

const accessRules = {
  employee: isEmployee,
  hr: canAccessHR,
  payroll: canAccessPayroll,
};

// This guard is for the local demo UX only. Backend APIs must enforce real authorization.
export default function ProtectedRoute({ access, children }) {
  const { currentUser } = useAuth();
  const location = useLocation();
  if (!currentUser) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (access && !accessRules[access](currentUser.role)) return <Navigate to={getHomeRoute(currentUser.role)} replace />;
  return children;
}
