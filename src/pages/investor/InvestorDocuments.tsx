import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Download } from "lucide-react";
import { fmtDate } from "@/lib/investor";

const InvestorDocuments = () => {
  const { user } = useAuth();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setDocs(data ?? []);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <div className="text-muted-foreground">Cargando documentos…</div>;

  return (
    <div className="bg-card border border-border rounded-lg shadow-card">
      <div className="p-6 border-b border-border">
        <h3 className="font-display text-xl">Documentos</h3>
        <p className="text-sm text-muted-foreground">Contratos, reportes y certificados disponibles.</p>
      </div>
      {docs.length === 0 ? (
        <div className="p-10 text-center text-muted-foreground">No hay documentos disponibles aún.</div>
      ) : (
        <div className="divide-y divide-border">
          {docs.map((d) => (
            <div key={d.id} className="flex items-center justify-between px-6 py-4 hover:bg-subtle transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-accent/10 text-accent flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">{d.name ?? d.doc_type}</div>
                  <div className="text-xs text-muted-foreground">{d.doc_type} · {fmtDate(d.created_at)}</div>
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
          ))}
        </div>
      )}
    </div>
  );
};

export default InvestorDocuments;
