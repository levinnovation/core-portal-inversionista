import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InvestorFormDialog } from "@/components/admin/InvestorFormDialog";
import { InvestmentFormDialog } from "@/components/admin/InvestmentFormDialog";

const InvestorsList = () => {
  const [investors, setInvestors] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [investmentFor, setInvestmentFor] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("investors")
      .select("*, investments(amount_invested, project_id)")
      .order("created_at", { ascending: false });
    setInvestors(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const fmt = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <AdminPage
      title="Inversionistas"
      action={
        <Button onClick={() => setOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="h-4 w-4 mr-2" /> Nuevo inversionista
        </Button>
      }
    >
      {investors.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-lg p-16 text-center">
          <h3 className="font-display text-xl mb-2">No hay inversionistas registrados</h3>
          <Button onClick={() => setOpen(true)} className="bg-accent text-accent-foreground mt-4">
            <Plus className="h-4 w-4 mr-2" /> Crear inversionista
          </Button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="text-left text-xs uppercase text-muted-foreground border-b border-border bg-muted/40">
              <tr>
                <th className="px-5 py-3">Nombre</th>
                <th className="py-3">Contacto</th>
                <th className="py-3">KYC</th>
                <th className="py-3">Inversiones</th>
                <th className="py-3">Total invertido</th>
                <th className="py-3 px-5"></th>
              </tr>
            </thead>
            <tbody>
              {investors.map((i) => {
                const total = (i.investments ?? []).reduce((a: number, x: any) => a + Number(x.amount_invested || 0), 0);
                return (
                  <tr key={i.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-5 py-4 font-medium">{i.full_name}</td>
                    <td className="py-4">
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        {i.email && <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{i.email}</div>}
                        {i.phone && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{i.phone}</div>}
                      </div>
                    </td>
                    <td className="py-4"><Badge variant={i.kyc_status === "approved" ? "default" : "secondary"}>{i.kyc_status}</Badge></td>
                    <td className="py-4">{(i.investments ?? []).length}</td>
                    <td className="py-4 font-medium">{total ? fmt(total) : "—"}</td>
                    <td className="py-4 px-5">
                      <Button size="sm" variant="outline" onClick={() => setInvestmentFor(i.id)}>+ Inversión</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}

      <InvestorFormDialog open={open} onOpenChange={setOpen} onSaved={load} />
      <InvestmentFormDialog
        open={!!investmentFor}
        onOpenChange={(v) => !v && setInvestmentFor(null)}
        onSaved={load}
        investorId={investmentFor}
      />
    </AdminPage>
  );
};

export default InvestorsList;
