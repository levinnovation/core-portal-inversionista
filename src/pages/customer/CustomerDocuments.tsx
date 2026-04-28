import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Download } from "lucide-react";
import { fmtDate, loadCustomerData } from "@/lib/customer";

const DOC_TYPES = [
  { type: "contract", label: "Contrato de compraventa" },
  { type: "floor_plan", label: "Planos de la unidad" },
  { type: "regulation", label: "Reglamento de propiedad horizontal" },
  { type: "delivery_act", label: "Acta de entrega" },
];

const CustomerDocuments = () => {
  const { user } = useAuth();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const data = await loadCustomerData(user.id);
      const entityIds = [
        ...data.sales.map((s: any) => s.id),
        ...data.units.map((u: any) => u.id),
        ...data.projects.map((p: any) => p.id),
      ];
      if (entityIds.length === 0) {
        setLoading(false);
        return;
      }
      const { data: docs } = await supabase
        .from("documents")
        .select("*")
        .in("entity_id", entityIds)
        .order("created_at", { ascending: false });
      setDocs(docs ?? []);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="text-muted-foreground">Cargando documentos…</div>;

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        <h3 className="font-display text-xl mb-2">Documentos de tu compra</h3>
        <p className="text-sm text-muted-foreground">Contratos, planos y documentos legales asociados a tu unidad.</p>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-card">
        {docs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay documentos disponibles aún.</p>
            <p className="text-xs mt-1">El equipo Core los subirá próximamente.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {docs.map((d) => {
              const label = DOC_TYPES.find((t) => t.type === d.doc_type)?.label ?? d.doc_type;
              return (
                <div key={d.id} className="flex items-center justify-between px-6 py-4 hover:bg-subtle transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-accent/10 text-accent flex items-center justify-center">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">{d.name ?? label}</div>
                      <div className="text-xs text-muted-foreground">{label} · {fmtDate(d.created_at)}</div>
                    </div>
                  </div>
                  <a
                    href={d.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
                  >
                    <Download className="h-4 w-4" /> Descargar
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDocuments;
