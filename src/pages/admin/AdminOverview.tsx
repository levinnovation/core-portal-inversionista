import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage } from "@/components/admin/AdminLayout";

interface Counts {
  projects: number;
  investors: number;
  customers: number;
  capital: number;
}

const AdminOverview = () => {
  const [c, setC] = useState<Counts>({ projects: 0, investors: 0, customers: 0, capital: 0 });

  useEffect(() => {
    (async () => {
      const [p, inv, cu, sums] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("investors").select("id", { count: "exact", head: true }),
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("investments").select("amount_invested"),
      ]);
      const capital = (sums.data ?? []).reduce((acc, r: any) => acc + Number(r.amount_invested || 0), 0);
      setC({
        projects: p.count ?? 0,
        investors: inv.count ?? 0,
        customers: cu.count ?? 0,
        capital,
      });
    })();
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  const kpis = [
    { label: "Proyectos activos", value: c.projects.toString() },
    { label: "Inversionistas", value: c.investors.toString() },
    { label: "Clientes", value: c.customers.toString() },
    { label: "Capital comprometido", value: c.capital ? fmt(c.capital) : "—" },
  ];

  return (
    <AdminPage title="Panel de Administración">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-lg p-5 shadow-card min-w-0">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 truncate">{kpi.label}</div>
            <div className="font-display text-2xl xl:text-3xl text-foreground truncate" title={kpi.value}>{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg p-10 shadow-card">
        <h2 className="font-display text-2xl mb-2">Bienvenido al panel</h2>
        <p className="text-muted-foreground max-w-2xl mb-6">
          Desde aquí gestionas todo el ecosistema Core: proyectos, inversionistas, clientes,
          ventas, pagos, distribuciones y la carga masiva de datos.
        </p>
      </div>
    </AdminPage>
  );
};

export default AdminOverview;
