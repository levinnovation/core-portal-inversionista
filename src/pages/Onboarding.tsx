import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw, Loader2, AlertTriangle } from "lucide-react";

const routeFor = (role: AppRole) =>
  role === "admin" ? "/admin" : role === "investor" ? "/inversionistas" : "/clientes";

const Onboarding = () => {
  const { user, signOut, primaryRole, loading, rolesLoading, rolesError, refreshRoles } = useAuth();
  const nav = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (loading || rolesLoading || !primaryRole) return;
    nav(routeFor(primaryRole), { replace: true });
  }, [primaryRole, loading, rolesLoading, nav]);

  const handleRefresh = async () => {
    setRefreshing(true);
    const next = await refreshRoles();
    setRefreshing(false);
    const role: AppRole | null =
      next.includes("admin") ? "admin" :
      next.includes("investor") ? "investor" :
      next.includes("customer") ? "customer" : null;
    if (role) nav(routeFor(role), { replace: true });
  };

  const isLoading = loading || rolesLoading || refreshing;

  return (
    <div className="min-h-screen flex items-center justify-center bg-subtle p-8">
      <div className="bg-card border border-border rounded-lg p-10 max-w-lg shadow-card text-center">
        <div className="w-14 h-14 rounded-full bg-accent/15 mx-auto mb-5 flex items-center justify-center">
          {isLoading ? (
            <Loader2 className="h-6 w-6 text-accent animate-spin" />
          ) : rolesError ? (
            <AlertTriangle className="h-6 w-6 text-accent" />
          ) : (
            <Mail className="h-6 w-6 text-accent" />
          )}
        </div>

        {isLoading ? (
          <>
            <h1 className="font-display text-3xl mb-3">Cargando rol…</h1>
            <p className="text-muted-foreground mb-2">
              Estamos verificando tu acceso, esto toma un momento.
            </p>
          </>
        ) : rolesError ? (
          <>
            <h1 className="font-display text-3xl mb-3">No pudimos cargar tu rol</h1>
            <p className="text-muted-foreground mb-2">
              {rolesError}
            </p>
            <p className="text-muted-foreground mb-6">
              Esto suele ser un error temporal del backend. Intenta de nuevo en unos segundos.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display text-3xl mb-3">Cuenta pendiente de asignación</h1>
            <p className="text-muted-foreground mb-2">
              Hola {user?.email}, tu cuenta fue creada exitosamente.
            </p>
            <p className="text-muted-foreground mb-8">
              El equipo Core debe asignarte un rol (Inversionista, Cliente o Administrador) para acceder a tu portal.
            </p>
          </>
        )}

        <div className="flex gap-2 justify-center">
          <Button onClick={handleRefresh} disabled={isLoading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refrescar
          </Button>
          <Button onClick={signOut} variant="outline">Cerrar sesión</Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
