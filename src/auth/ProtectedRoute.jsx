import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";
import { Loader } from "../components/Loader";

export default function ProtectedRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) return <Loader text="Cargando sesión..." />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}
