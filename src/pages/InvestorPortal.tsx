import { Routes, Route, Navigate } from "react-router-dom";
import { PortalShell } from "@/components/PortalShell";
import { LayoutDashboard, Building2, Wallet, FileText, MessageSquare } from "lucide-react";
import InvestorDashboard from "./investor/InvestorDashboard";
import InvestorProjects from "./investor/InvestorProjects";
import InvestorProjectDetail from "./investor/InvestorProjectDetail";
import InvestorDistributions from "./investor/InvestorDistributions";
import InvestorDocuments from "./investor/InvestorDocuments";
import InvestorAgent from "./investor/InvestorAgent";

const InvestorPortal = () => {
  return (
    <PortalShell
      title="Portal de Inversionistas"
      subtitle="Inversionistas"
      nav={[
        { to: "/inversionistas", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
        { to: "/inversionistas/proyectos", label: "Proyectos", icon: <Building2 className="h-4 w-4" /> },
        { to: "/inversionistas/distribuciones", label: "Distribuciones", icon: <Wallet className="h-4 w-4" /> },
        { to: "/inversionistas/documentos", label: "Documentos", icon: <FileText className="h-4 w-4" /> },
        { to: "/inversionistas/agente", label: "Agente Financiero", icon: <MessageSquare className="h-4 w-4" /> },
      ]}
    >
      <Routes>
        <Route index element={<InvestorDashboard />} />
        <Route path="proyectos" element={<InvestorProjects />} />
        <Route path="distribuciones" element={<InvestorDistributions />} />
        <Route path="documentos" element={<InvestorDocuments />} />
        <Route path="agente" element={<InvestorAgent />} />
        <Route path="*" element={<Navigate to="/inversionistas" replace />} />
      </Routes>
    </PortalShell>
  );
};

export default InvestorPortal;
