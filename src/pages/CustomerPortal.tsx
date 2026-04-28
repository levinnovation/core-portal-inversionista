import { PortalShell } from "@/components/PortalShell";
import { LayoutDashboard, Home, CreditCard, FileText, Camera } from "lucide-react";

const CustomerPortal = () => {
  return (
    <PortalShell
      title="Mi Apartamento"
      subtitle="Clientes"
      nav={[
        { to: "/clientes", label: "Resumen", icon: <LayoutDashboard className="h-4 w-4" /> },
        { to: "/clientes/unidad", label: "Mi unidad", icon: <Home className="h-4 w-4" /> },
        { to: "/clientes/pagos", label: "Plan de pagos", icon: <CreditCard className="h-4 w-4" /> },
        { to: "/clientes/avance", label: "Avance de obra", icon: <Camera className="h-4 w-4" /> },
        { to: "/clientes/documentos", label: "Documentos", icon: <FileText className="h-4 w-4" /> },
      ]}
    >
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Próximo pago", value: "—" },
          { label: "Avance de obra", value: "—" },
          { label: "Pagos al día", value: "—" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-lg p-6 shadow-card">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{kpi.label}</div>
            <div className="font-display text-3xl">{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg p-10 shadow-card text-center">
        <h2 className="font-display text-2xl mb-2">Tu unidad aparecerá aquí</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Próximamente: timeline de pagos, galería del avance mensual y documentos de tu unidad.
        </p>
      </div>
    </PortalShell>
  );
};

export default CustomerPortal;
