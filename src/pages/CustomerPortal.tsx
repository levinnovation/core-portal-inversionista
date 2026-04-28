import { Routes, Route, Navigate } from "react-router-dom";
import { PortalShell } from "@/components/PortalShell";
import { LayoutDashboard, Home, CreditCard, FileText, Camera } from "lucide-react";
import CustomerOverview from "./customer/CustomerOverview";
import CustomerUnit from "./customer/CustomerUnit";
import CustomerPayments from "./customer/CustomerPayments";
import CustomerProgress from "./customer/CustomerProgress";
import CustomerDocuments from "./customer/CustomerDocuments";

const CustomerPortal = () => {
  return (
    <PortalShell
      title="Portal de Clientes"
      subtitle="Clientes"
      nav={[
        { to: "/clientes", label: "Resumen", icon: <LayoutDashboard className="h-4 w-4" /> },
        { to: "/clientes/unidad", label: "Mi unidad", icon: <Home className="h-4 w-4" /> },
        { to: "/clientes/pagos", label: "Plan de pagos", icon: <CreditCard className="h-4 w-4" /> },
        { to: "/clientes/avance", label: "Avance de obra", icon: <Camera className="h-4 w-4" /> },
        { to: "/clientes/documentos", label: "Documentos", icon: <FileText className="h-4 w-4" /> },
      ]}
    >
      <Routes>
        <Route index element={<CustomerOverview />} />
        <Route path="unidad" element={<CustomerUnit />} />
        <Route path="pagos" element={<CustomerPayments />} />
        <Route path="avance" element={<CustomerProgress />} />
        <Route path="documentos" element={<CustomerDocuments />} />
        <Route path="*" element={<Navigate to="/clientes" replace />} />
      </Routes>
    </PortalShell>
  );
};

export default CustomerPortal;
