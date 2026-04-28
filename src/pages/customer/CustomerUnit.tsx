import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { CustomerData, fmtDate, fmtUSD, loadCustomerData } from "@/lib/customer";
import { Building2, MapPin, Bed, Bath, Maximize2, Calendar, Landmark } from "lucide-react";

const Field = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number | null | undefined }) => (
  <div className="flex items-center gap-3 p-4 rounded-md bg-subtle">
    <div className="text-accent">{icon}</div>
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-medium">{value ?? "—"}</div>
    </div>
  </div>
);

const CustomerUnit = () => {
  const { user } = useAuth();
  const [data, setData] = useState<CustomerData | null>(null);

  useEffect(() => { if (user) loadCustomerData(user.id).then(setData); }, [user]);

  if (!data) return <div className="text-muted-foreground">Cargando…</div>;
  if (!data.customer || data.sales.length === 0) {
    return <div className="bg-card border border-border rounded-lg p-10 text-center text-muted-foreground">Aún no tienes una unidad asignada.</div>;
  }

  const sale = data.sales[0];
  const unit = data.units.find((u: any) => u.id === sale.unit_id);
  const project = data.projects.find((p: any) => p.id === unit?.project_id);

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">{project?.name}</div>
            <h2 className="font-display text-3xl">Unidad {unit?.unit_number}</h2>
            {project?.location && <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{project.location}</p>}
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Precio acordado</div>
            <div className="font-display text-3xl">{fmtUSD(Number(sale.price_agreed))}</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Field icon={<Building2 className="h-5 w-5" />} label="Proyecto" value={project?.name} />
          <Field icon={<Maximize2 className="h-5 w-5" />} label="Área" value={unit?.sqft ? `${unit.sqft} m²` : null} />
          <Field icon={<Building2 className="h-5 w-5" />} label="Piso" value={unit?.floor} />
          <Field icon={<Bed className="h-5 w-5" />} label="Habitaciones" value={unit?.bedrooms} />
          <Field icon={<Bath className="h-5 w-5" />} label="Baños" value={unit?.bathrooms} />
          <Field icon={<Calendar className="h-5 w-5" />} label="Fecha estimada de entrega" value={fmtDate(project?.estimated_delivery)} />
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        <h3 className="font-display text-xl mb-4 flex items-center gap-2"><Landmark className="h-5 w-5 text-accent" /> Financiamiento</h3>
        {sale.financing_bank ? (
          <div className="grid sm:grid-cols-3 gap-3">
            <Field icon={<Landmark className="h-5 w-5" />} label="Banco" value={sale.financing_bank} />
            <Field icon={<Landmark className="h-5 w-5" />} label="Monto financiado" value={sale.financing_amount ? fmtUSD(Number(sale.financing_amount)) : null} />
            <Field icon={<Landmark className="h-5 w-5" />} label="Capital propio" value={fmtUSD(Number(sale.price_agreed) - Number(sale.financing_amount ?? 0))} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No hay información de financiamiento registrada. Contacta al equipo Core para registrar tu crédito hipotecario.</p>
        )}
      </div>

      <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        <h3 className="font-display text-xl mb-2">Datos de la venta</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div><span className="text-muted-foreground">Fecha de venta:</span> <strong>{fmtDate(sale.sale_date)}</strong></div>
          <div><span className="text-muted-foreground">Estado:</span> <strong className="capitalize">{sale.status}</strong></div>
        </div>
      </div>
    </div>
  );
};

export default CustomerUnit;
