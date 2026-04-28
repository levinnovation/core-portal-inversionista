import { AIAssistant } from "@/components/AIAssistant";
import { AdminPage } from "@/components/admin/AdminLayout";

const AdminAgent = () => (
  <AdminPage title="Asistente Admin">
    <AIAssistant
      title="Asistente operativo Core"
      subtitle="Consulta cualquier dato de la operación y documentos cargados."
      suggestions={[
        "Resumen de ventas del último trimestre",
        "¿Qué inversionistas tienen distribuciones pendientes?",
        "Avance promedio de obra por proyecto",
        "Busca en los contratos cláusulas de penalización",
      ]}
    />
  </AdminPage>
);

export default AdminAgent;
