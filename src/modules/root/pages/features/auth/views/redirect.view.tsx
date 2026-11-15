import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../../../../../shared/store";

function isAdminRole(role: unknown) {
  return role === "ADMIN" || role === "MODERADOR";
}

export function RedirectView() {
  const session = useAuthStore((state) => state.session);
  if (!session) return <Navigate to="/session" replace />;
  return <Navigate to={isAdminRole(session.role) ? "/home" : "/"} replace />;
}
