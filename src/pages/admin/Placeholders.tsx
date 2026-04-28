import { AdminPage } from "@/components/admin/AdminLayout";
import { RefreshCw } from "lucide-react";

const Placeholder = ({ title, msg }: { title: string; msg: string }) => (
  <AdminPage title={title}>
    <div className="bg-card border border-border rounded-lg p-16 text-center shadow-card">
      <RefreshCw className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
      <h3 className="font-display text-2xl mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mx-auto">{msg}</p>
    </div>
  </AdminPage>
);

export const QuickbasePage = () => <Placeholder title="Conector QuickBase" msg="La sincronización bidireccional con QuickBase se activará en una fase posterior, una vez compartas las credenciales y el mapeo de campos." />;
export const AgentsPage = () => <Placeholder title="Agentes AI" msg="Aquí supervisarás las interacciones del agente financiero, su precisión y consumo. Se activa después del portal de inversionistas." />;
