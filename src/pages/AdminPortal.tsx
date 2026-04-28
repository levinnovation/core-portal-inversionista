import { PortalShell } from "@/components/PortalShell";
import { LayoutDashboard, Building2, Users, ShoppingBag, Upload, RefreshCw, Bot, BarChart3 } from "lucide-react";

const AdminPortal = () => {
  return (
    <PortalShell
      title="Panel de Administración"
      subtitle="Equipo Core"
      nav={[
        { to: "/admin", label: "Resumen", icon: <LayoutDashboard className="h-4 w-4" /> },
        { to: "/admin/proyectos", label: "Proyectos", icon: <Building2 className="h-4 w-4" /> },
        { to: "/admin/inversionistas", label: "Inversionistas", icon: <Users className="h-4 w-4" /> },
        { to: "/admin/clientes", label: "Clientes", icon: <ShoppingBag className="h-4 w-4" /> },
        { to: "/admin/excel", label: "Carga Excel", icon: <Upload className="h-4 w-4" /> },
        { to: "/admin/quickbase", label: "QuickBase", icon: <RefreshCw className="h-4 w-4" /> },
        { to: "/admin/agentes", label: "Agentes AI", icon: <Bot className="h-4 w-4" /> },
        { to: "/admin/reportes", label: "Reportes", icon: <BarChart3 className="h-4 w-4" /> },
      ]}
    >
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Proyectos activos", value: "0" },
          { label: "Inversionistas", value: "0" },
          { label: "Clientes", value: "0" },
          { label: "Capital comprometido", value: "—" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-lg p-6 shadow-card">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{kpi.label}</div>
            <div className="font-display text-3xl">{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg p-10 shadow-card">
        <h2 className="font-display text-2xl mb-2">Foundation lista ✓</h2>
        <p className="text-muted-foreground max-w-2xl mb-6">
          La base de datos, autenticación y los tres portales están operativos. En la siguiente fase activaremos
          el CRUD completo de proyectos, gestión de inversionistas/clientes, uploader Excel y conector QuickBase.
        </p>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="border border-border rounded-md p-4">
            <div className="font-medium mb-1">✓ Base de datos</div>
            <div className="text-muted-foreground">11 tablas con políticas de acceso por rol</div>
          </div>
          <div className="border border-border rounded-md p-4">
            <div className="font-medium mb-1">✓ Autenticación</div>
            <div className="text-muted-foreground">Login, signup, roles (admin / investor / customer)</div>
          </div>
          <div className="border border-border rounded-md p-4">
            <div className="font-medium mb-1">✓ Tres portales navegables</div>
            <div className="text-muted-foreground">Inversionistas, Clientes, Admin</div>
          </div>
          <div className="border border-border rounded-md p-4">
            <div className="font-medium mb-1">→ Próxima fase</div>
            <div className="text-muted-foreground">Admin Panel funcional + Excel + QuickBase</div>
          </div>
        </div>
      </div>
    </PortalShell>
  );
};

export default AdminPortal;
