import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Phone } from "lucide-react";
import { CustomerFormDialog } from "@/components/admin/CustomerFormDialog";
import { SaleFormDialog } from "@/components/admin/SaleFormDialog";

const CustomersList = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [saleFor, setSaleFor] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("customers")
      .select("*, sales(id, price_agreed, unit_id)")
      .order("created_at", { ascending: false });
    setCustomers(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const fmt = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <AdminPage
      title="Clientes"
      action={
        <Button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary-glow">
          <Plus className="h-4 w-4 mr-2" /> Nuevo cliente
        </Button>
      }
    >
      {customers.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-lg p-16 text-center">
          <h3 className="font-display text-xl mb-2">No hay clientes registrados</h3>
          <Button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground mt-4">
            <Plus className="h-4 w-4 mr-2" /> Crear cliente
          </Button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground border-b border-border bg-muted/40">
              <tr>
                <th className="px-5 py-3">Nombre</th>
                <th className="py-3">Contacto</th>
                <th className="py-3">Ventas</th>
                <th className="py-3">Total</th>
                <th className="py-3 px-5"></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => {
                const total = (c.sales ?? []).reduce((a: number, s: any) => a + Number(s.price_agreed || 0), 0);
                return (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-5 py-4 font-medium">{c.full_name}</td>
                    <td className="py-4">
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        {c.email && <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{c.email}</div>}
                        {c.phone && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{c.phone}</div>}
                      </div>
                    </td>
                    <td className="py-4">{(c.sales ?? []).length}</td>
                    <td className="py-4 font-medium">{total ? fmt(total) : "—"}</td>
                    <td className="py-4 px-5">
                      <Button size="sm" variant="outline" onClick={() => setSaleFor(c.id)}>+ Venta</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <CustomerFormDialog open={open} onOpenChange={setOpen} onSaved={load} />
      <SaleFormDialog open={!!saleFor} onOpenChange={(v) => !v && setSaleFor(null)} onSaved={load} customerId={saleFor} />
    </AdminPage>
  );
};

export default CustomersList;
