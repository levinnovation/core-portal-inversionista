import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useImpersonation } from "@/hooks/useImpersonation";
import { CustomerData, fmtDate, fmtUSD, loadCustomerData, paymentStatusLabel } from "@/lib/customer";
import { Progress } from "@/components/ui/progress";
import { CalendarClock, CreditCard, Hammer, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const CustomerOverview = () => {
  const { user } = useAuth();
  const { target } = useImpersonation();
  const [data, setData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadCustomerData(user.id, { impersonateCustomerId: target?.kind === "customer" ? target.recordId : null }).then((d) => { setData(d); setLoading(false); });
  }, [user, target]);

  if (loading) return <div className="text-muted-foreground">Cargando…</div>;
  if (!data?.customer || data.sales.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-10 text-center shadow-card">
        <h2 className="font-display text-2xl mb-2">Aún no tienes una unidad asignada</h2>
        <p className="text-muted-foreground">Cuando el equipo Core registre tu compra, verás aquí toda la información.</p>
      </div>
    );
  }

  const sale = data.sales[0];
  const unit = data.units.find((u: any) => u.id === sale.unit_id);
  const project = data.projects.find((p: any) => p.id === unit?.project_id);
  const myPayments = data.payments.filter((p: any) => p.sale_id === sale.id);
  const totalPaid = myPayments.filter((p: any) => p.status === "paid").reduce((s: number, p: any) => s + Number(p.amount), 0);
  const totalDue = Number(sale.price_agreed);
  const pctPaid = totalDue > 0 ? (totalPaid / totalDue) * 100 : 0;

  const upcomingPayments = myPayments
    .filter((p: any) => p.status !== "paid")
    .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  const nextPayment = upcomingPayments[0];

  const projectPhases = data.phases.filter((ph: any) => ph.project_id === project?.id);
  const overall = projectPhases.length
    ? projectPhases.reduce((s: number, ph: any) => s + Number(ph.completion_percentage), 0) / projectPhases.length
    : 0;
  const completedPhases = projectPhases.filter((ph: any) => Number(ph.completion_percentage) >= 100).length;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-lg p-8 shadow-card">
        <div className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70 mb-2">Tu apartamento</div>
        <h2 className="font-display text-4xl mb-2">{project?.name ?? "—"}</h2>
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-primary-foreground/80">
          <span>Unidad <strong className="text-primary-foreground">{unit?.unit_number}</strong></span>
          {unit?.floor !== null && <span>Piso <strong className="text-primary-foreground">{unit?.floor}</strong></span>}
          {unit?.sqft && <span><strong className="text-primary-foreground">{unit.sqft}</strong> m²</span>}
          {project?.estimated_delivery && <span>Entrega: <strong className="text-primary-foreground">{fmtDate(project.estimated_delivery)}</strong></span>}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-card border border-border rounded-lg p-5 shadow-card min-w-0">
          <div className="flex items-center justify-between mb-3 text-accent"><CreditCard className="h-5 w-5" /></div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1 truncate">Próximo pago</div>
          {nextPayment ? (
            <>
              <div className="font-display text-2xl xl:text-3xl truncate" title={fmtUSD(Number(nextPayment.amount))}>{fmtUSD(Number(nextPayment.amount))}</div>
              <div className="text-sm text-muted-foreground mt-1">{fmtDate(nextPayment.due_date)}</div>
            </>
          ) : (
            <div className="font-display text-2xl text-muted-foreground">Al día ✓</div>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-5 shadow-card min-w-0">
          <div className="flex items-center justify-between mb-3 text-accent"><Hammer className="h-5 w-5" /></div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1 truncate">Avance de obra</div>
          <div className="font-display text-2xl xl:text-3xl">{overall.toFixed(0)}%</div>
          <Progress value={overall} className="h-1.5 mt-3" />
        </div>

        <div className="bg-card border border-border rounded-lg p-5 shadow-card min-w-0">
          <div className="flex items-center justify-between mb-3 text-accent"><CheckCircle2 className="h-5 w-5" /></div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1 truncate">Capital pagado</div>
          <div className="font-display text-2xl xl:text-3xl">{pctPaid.toFixed(0)}%</div>
          <div className="text-sm text-muted-foreground mt-1 truncate" title={`${fmtUSD(totalPaid)} de ${fmtUSD(totalDue)}`}>{fmtUSD(totalPaid)} de {fmtUSD(totalDue)}</div>
        </div>
      </div>

      {/* Próximos pagos */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl">Próximos pagos</h3>
          <Link to="/clientes/pagos" className="text-sm text-accent hover:underline">Ver plan completo →</Link>
        </div>
        {upcomingPayments.length === 0 ? (
          <div className="text-muted-foreground text-sm py-6 text-center">No hay pagos pendientes 🎉</div>
        ) : (
          <div className="space-y-2">
            {upcomingPayments.slice(0, 3).map((p: any) => {
              const st = paymentStatusLabel(p);
              return (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-md bg-subtle">
                  <div className="flex items-center gap-3">
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">{fmtDate(p.due_date)}</div>
                      <div className="text-xs text-muted-foreground">{p.payment_method ?? "Pago programado"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${st.color}`}>{st.label}</span>
                    <div className="font-mono font-medium">{fmtUSD(Number(p.amount))}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOverview;
