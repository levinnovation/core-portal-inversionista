import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { CustomerData, fmtDate, fmtUSD, loadCustomerData, paymentStatusLabel } from "@/lib/customer";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertTriangle, CalendarClock } from "lucide-react";

const CustomerPayments = () => {
  const { user } = useAuth();
  const [data, setData] = useState<CustomerData | null>(null);

  useEffect(() => { if (user) loadCustomerData(user.id).then(setData); }, [user]);

  if (!data) return <div className="text-muted-foreground">Cargando…</div>;
  if (!data.customer || data.sales.length === 0) {
    return <div className="bg-card border border-border rounded-lg p-10 text-center text-muted-foreground">Sin plan de pagos disponible.</div>;
  }

  const sale = data.sales[0];
  const payments = data.payments
    .filter((p: any) => p.sale_id === sale.id)
    .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  const total = Number(sale.price_agreed);
  const paid = payments.filter((p: any) => p.status === "paid").reduce((s: number, p: any) => s + Number(p.amount), 0);
  const pending = payments.filter((p: any) => p.status !== "paid").reduce((s: number, p: any) => s + Number(p.amount), 0);
  const overdue = payments.filter((p: any) => paymentStatusLabel(p).label === "Vencido").length;
  const next = payments.find((p: any) => p.status !== "paid");
  const pct = total > 0 ? (paid / total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-lg p-6 shadow-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Precio total</div>
          <div className="font-display text-2xl">{fmtUSD(total)}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 shadow-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Pagado</div>
          <div className="font-display text-2xl text-emerald-600">{fmtUSD(paid)}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 shadow-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Pendiente</div>
          <div className="font-display text-2xl">{fmtUSD(pending)}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 shadow-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Vencidos</div>
          <div className={`font-display text-2xl ${overdue > 0 ? "text-destructive" : ""}`}>{overdue}</div>
        </div>
      </div>

      {/* Próximo pago destacado */}
      {next && (
        <div className="bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-accent mb-1">Próximo pago</div>
              <div className="font-display text-3xl">{fmtUSD(Number(next.amount))}</div>
              <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5" /> Vence el {fmtDate(next.due_date)}
              </div>
            </div>
            <CalendarClock className="h-12 w-12 text-accent/30" />
          </div>
        </div>
      )}

      {/* Progreso */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Progreso de pagos</span>
          <span className="font-mono text-accent">{pct.toFixed(1)}%</span>
        </div>
        <Progress value={pct} className="h-3" />
      </div>

      {/* Timeline */}
      <div className="bg-card border border-border rounded-lg shadow-card">
        <div className="p-6 border-b border-border">
          <h3 className="font-display text-xl">Cronograma completo</h3>
        </div>
        {payments.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">No hay cuotas registradas todavía.</div>
        ) : (
          <div className="divide-y divide-border">
            {payments.map((p: any) => {
              const st = paymentStatusLabel(p);
              const Icon = p.status === "paid" ? CheckCircle2 : st.label === "Vencido" ? AlertTriangle : Clock;
              return (
                <div key={p.id} className="flex items-center justify-between px-6 py-4 hover:bg-subtle transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${st.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">{fmtDate(p.due_date)}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.payment_method ?? "Cuota programada"}
                        {p.paid_date && ` · Pagado el ${fmtDate(p.paid_date)}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs px-2 py-1 rounded ${st.color}`}>{st.label}</span>
                    <div className="font-mono font-medium text-right w-28">{fmtUSD(Number(p.amount))}</div>
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

export default CustomerPayments;
