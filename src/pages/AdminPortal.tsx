import { Routes, Route } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminOverview from "./admin/AdminOverview";
import ProjectsList from "./admin/ProjectsList";
import ProjectDetail from "./admin/ProjectDetail";
import InvestorsList from "./admin/InvestorsList";
import CustomersList from "./admin/CustomersList";
import ExcelUpload from "./admin/ExcelUpload";
import { QuickbasePage } from "./admin/Placeholders";
import Reports from "./admin/Reports";
import LeadsList from "./admin/LeadsList";
import AdminAgent from "./admin/AdminAgent";
import AuditLogs from "./admin/AuditLogs";

const AdminPortal = () => (
  <Routes>
    <Route element={<AdminLayout />}>
      <Route index element={<AdminOverview />} />
      <Route path="proyectos" element={<ProjectsList />} />
      <Route path="proyectos/:id" element={<ProjectDetail />} />
      <Route path="inversionistas" element={<InvestorsList />} />
      <Route path="clientes" element={<CustomersList />} />
      <Route path="prospectos" element={<LeadsList />} />
      <Route path="excel" element={<ExcelUpload />} />
      <Route path="quickbase" element={<QuickbasePage />} />
      <Route path="agentes" element={<AdminAgent />} />
      <Route path="reportes" element={<Reports />} />
      <Route path="auditoria" element={<AuditLogs />} />
    </Route>
  </Routes>
);

export default AdminPortal;
