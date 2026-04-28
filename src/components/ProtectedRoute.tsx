import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, AppRole } from "@/hooks/useAuth";

export const ProtectedRoute = ({ children, allow }: { children: ReactNode; allow?: AppRole[] }) => {
  const { user, loading, roles, primaryRole } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-subtle">
      <div className="text-muted-foreground">Cargando…</div>
    </div>;
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (allow && !allow.some(r => roles.includes(r))) {
    if (primaryRole === "admin") return <Navigate to="/admin" replace />;
    if (primaryRole === "investor") return <Navigate to="/inversionistas" replace />;
    if (primaryRole === "customer") return <Navigate to="/clientes" replace />;
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
};
