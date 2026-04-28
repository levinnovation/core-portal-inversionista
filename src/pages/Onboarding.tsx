import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw } from "lucide-react";

const Onboarding = () => {
  const { user, signOut, primaryRole, loading } = useAuth();
  const nav = useNavigate();

  // Auto-redirect once a role becomes available (handles the race where
  // roles load just after the page mounts).
  useEffect(() => {
    if (loading || !primaryRole) return;
    if (primaryRole === "admin") nav("/admin", { replace: true });
    else if (primaryRole === "investor") nav("/inversionistas", { replace: true });
    else if (primaryRole === "customer") nav("/clientes", { replace: true });
  }, [primaryRole, loading, nav]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-subtle p-8">
      <div className="bg-card border border-border rounded-lg p-10 max-w-lg shadow-card text-center">
        <div className="w-14 h-14 rounded-full bg-accent-soft mx-auto mb-5 flex items-center justify-center">
          <Mail className="h-6 w-6 text-accent" />
        </div>
        <h1 className="font-display text-3xl mb-3">Cuenta pendiente de asignación</h1>
        <p className="text-muted-foreground mb-2">
          Hola {user?.email}, tu cuenta fue creada exitosamente.
        </p>
        <p className="text-muted-foreground mb-8">
          El equipo Core debe asignarte un rol (Inversionista, Cliente o Administrador) para acceder a tu portal.
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => window.location.reload()} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refrescar
          </Button>
          <Button onClick={signOut} variant="outline">Cerrar sesión</Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
