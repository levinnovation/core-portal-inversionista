import { useEffect, useState } from "react";
import { AdminPage } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface Log {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: any;
  ip_address: string | null;
  created_at: string;
}

const AuditLogs = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => {
        setLogs((data ?? []) as Log[]);
        setLoading(false);
      });
  }, []);

  return (
    <AdminPage title="Bitácora de auditoría">
      <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
        <div className="p-4 border-b border-border text-sm text-muted-foreground">
          Últimos 200 eventos administrativos.
        </div>
        {loading ? (
          <div className="p-10 text-center text-muted-foreground">Cargando…</div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">Sin eventos registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border bg-subtle">
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Acción</th>
                  <th className="px-4 py-3 font-medium">Entidad</th>
                  <th className="px-4 py-3 font-medium">Actor</th>
                  <th className="px-4 py-3 font-medium">Detalles</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-b border-border/40 last:border-0">
                    <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground text-xs">
                      {new Date(l.created_at).toLocaleString("es-CO")}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant="secondary" className="font-mono text-xs">{l.action}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-xs">
                      {l.entity_type ? `${l.entity_type}${l.entity_id ? ` · ${l.entity_id.slice(0, 8)}` : ""}` : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-xs font-mono text-muted-foreground">
                      {l.actor_id ? l.actor_id.slice(0, 8) : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground max-w-md truncate">
                      {l.metadata ? JSON.stringify(l.metadata) : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminPage>
  );
};

export default AuditLogs;
