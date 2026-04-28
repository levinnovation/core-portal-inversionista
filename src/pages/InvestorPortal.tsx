import { PortalShell } from "@/components/PortalShell";
import { LayoutDashboard, Building2, Wallet, FileText, MessageSquare } from "lucide-react";

const InvestorPortal = () => {
  return (
    <PortalShell
      title="Mi Portafolio"
      subtitle="Inversionistas"
      nav={[
        { to: "/inversionistas", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
        { to: "/inversionistas/proyectos", label: "Proyectos", icon: <Building2 className="h-4 w-4" /> },
        { to: "/inversionistas/distribuciones", label: "Distribuciones", icon: <Wallet className="h-4 w-4" /> },
        { to: "/inversionistas/documentos", label: "Documentos", icon: <FileText className="h-4 w-4" /> },
        { to: "/inversionistas/agente", label: "Agente Financiero", icon: <MessageSquare className="h-4 w-4" /> },
      ]}
    >
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Inversión total", value: "—", hint: "Datos próximamente" },
          { label: "Valor del portafolio", value: "—", hint: "—" },
          { label: "Distribuciones recibidas", value: "—", hint: "—" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-lg p-6 shadow-card">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{kpi.label}</div>
            <div className="font-display text-3xl text-foreground">{kpi.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{kpi.hint}</div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg p-10 shadow-card text-center">
        <h2 className="font-display text-2xl mb-2">Tu portafolio aparecerá aquí</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          En las próximas fases activaremos métricas de IRR, Cash-on-Cash, distribuciones,
          waterfall visual y avance de obra por proyecto.
        </p>
      </div>
    </PortalShell>
  );
};

export default InvestorPortal;
