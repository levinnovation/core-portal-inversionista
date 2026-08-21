import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useImpersonation } from "@/hooks/useImpersonation";
import { supabase } from "@/integrations/supabase/client";
import { loadPortfolio, fmtUSD, fmtDate } from "@/lib/investor";
import { Progress } from "@/components/ui/progress";
import { MapPin, Calendar, TrendingUp, TrendingDown, Target, Percent, Activity } from "lucide-react";
import { projectPerformance, fmtPct } from "@/lib/finance";

const typeLabels: Record<string, string> = {
  preferred_return: "Retorno preferente",
  catch_up: "Catch-up",
  carried_interest: "Carried interest",
  return_of_capital: "Retorno de capital",
};

const InvestorProjects = () => {
  const { user } = useAuth();
  const { target } = useImpersonation();
  const [projects, setProjects] = useState<any[]>([]);
  const [phases, setPhases] = useState<Record<string, any[]>>({});
  const [investments, setInvestments] = useState<any[]>([]);
  const [distributions, setDistributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const portfolio = await loadPortfolio(user.id, { impersonateInvestorId: target?.kind === "investor" ? target.recordId : null });
      setProjects(portfolio.projects);
      setInvestments(portfolio.investments);
      setDistributions(portfolio.distributions);
      if (portfolio.projects.length > 0) {
        const { data } = await supabase
          .from("project_phases")
          .select("*")
          .in("project_id", portfolio.projects.map((p) => p.id))
          .order("order_index");
        const grouped: Record<string, any[]> = {};
        (data ?? []).forEach((ph: any) => {
          (grouped[ph.project_id] ??= []).push(ph);
        });
        setPhases(grouped);
      }
      setLoading(false);
    })();
  }, [user, target]);

  if (loading) return <div className="text-muted-foreground">Cargando proyectos…</div>;
  if (projects.length === 0) {
    return <div className="bg-card border border-border rounded-lg p-10 text-center text-muted-foreground">Sin proyectos vinculados.</div>;
  }

  return (
    <div className="space-y-6">
      {projects.map((p) => {
        const myInvestments = investments.filter((i) => i.project_id === p.id);
        const invIds = new Set(myInvestments.map((i) => i.id));
        const myDistributions = distributions.filter((d) => invIds.has(d.investment_id));
        const perf = projectPerformance(myInvestments, myDistributions);
        const projectPhases = phases[p.id] ?? [];
        const overall = projectPhases.length
          ? projectPhases.reduce((s, ph) => s + Number(ph.completion_percentage), 0) / projectPhases.length
          : 0;

        const metrics = [
          { label: "ROI acumulado", value: fmtPct(perf.roi), icon: <TrendingUp className="h-4 w-4" />, hint: "Distribuido ÷ capital − 1" },
          { label: "Cash-on-Cash (12m)", value: fmtPct(perf.cashOnCash), icon: <Percent className="h-4 w-4" />, hint: "Distribuciones últimos 12 meses ÷ capital" },
          { label: "TIR anualizada", value: perf.irr !== null ? fmtPct(perf.irr) : "—", icon: <Activity className="h-4 w-4" />, hint: "XIRR con capital no devuelto a costo" },
          { label: "Distribuido", value: fmtUSD(perf.distributed), icon: <Target className="h-4 w-4" />, hint: `${perf.timeline.length} distribuciones` },
        ];

        const delta = perf.deltaAnnual;
        const above = (delta ?? 0) >= 0;

        return (
          <div key={p.id} className="bg-card border border-border rounded-lg p-6 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-2xl mb-1 truncate">{p.name}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {p.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{p.location}</span>}
                  {p.estimated_delivery && (
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Entrega: {new Date(p.estimated_delivery).toLocaleDateString("es-CO")}</span>
                  )}
                  <span className="capitalize px-2 py-0.5 rounded bg-accent/10 text-accent text-xs">{p.status}</span>
                </div>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Mi capital</div>
                <div className="font-display text-2xl truncate" title={fmtUSD(perf.invested)}>{fmtUSD(perf.invested)}</div>
                {perf.firstDate && (
                  <div className="text-xs text-muted-foreground">
                    Desde {fmtDate(perf.firstDate.toISOString())} · {Math.round(perf.monthsHeld)} meses
                  </div>
                )}
              </div>
            </div>

            {p.description && <p className="text-sm text-muted-foreground mb-6">{p.description}</p>}

            {/* Métricas de rendimiento de mi inversión */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {metrics.map((m) => (
                <div key={m.label} className="rounded-lg border border-border bg-secondary/30 p-4 min-w-0">
                  <div className="flex items-center gap-1.5 text-accent mb-2">{m.icon}</div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground truncate">{m.label}</div>
                  <div className="font-display text-xl truncate" title={m.value}>{m.value}</div>
                  <div className="text-[11px] text-muted-foreground mt-1 truncate" title={m.hint}>{m.hint}</div>
                </div>
              ))}
            </div>

            {/* Promesa vs proyección */}
            {(perf.promisedAnnual != null || perf.projectedAnnual != null) && (
              <div className="rounded-lg border border-border p-4 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <h4 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">
                    Retorno prometido vs proyectado (anual)
                  </h4>
                  {delta != null && (
                    <span className={`flex items-center gap-1 text-sm font-mono ${above ? "text-accent" : "text-destructive"}`}>
                      {above ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {above ? "+" : ""}{fmtPct(delta)}
                    </span>
                  )}
                </div>
                {(() => {
                  const promised = perf.promisedAnnual ?? 0;
                  const projected = perf.projectedAnnual ?? 0;
                  const max = Math.max(promised, projected, 0.01);
                  const rows = [
                    { label: "Prometido", value: perf.promisedAnnual, color: "bg-muted-foreground/40" },
                    { label: "Proyectado", value: perf.projectedAnnual, color: above ? "bg-accent" : "bg-destructive" },
                  ];
                  return (
                    <div className="space-y-3">
                      {rows.map((r) => (
                        <div key={r.label}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{r.label}</span>
                            <span className="font-mono">{r.value != null ? fmtPct(r.value) : "—"}</span>
                          </div>
                          <div className="h-2 rounded bg-secondary overflow-hidden">
                            <div
                              className={`h-full ${r.color}`}
                              style={{ width: `${Math.min(Math.max(((r.value ?? 0) / max) * 100, 0), 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                      <p className="text-[11px] text-muted-foreground">
                        Proyectado = TIR anualizada calculada con la fecha real de tu aporte, las distribuciones recibidas
                        y el capital aún no devuelto valorado a costo.
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Detalle de mi inversión */}
            <div className="mb-6">
              <h4 className="font-medium text-sm uppercase tracking-wider text-muted-foreground mb-2">Detalle de mi inversión</h4>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                      <th className="py-2">Fecha</th>
                      <th className="py-2">Tipo</th>
                      <th className="py-2 text-right">Monto</th>
                      <th className="py-2 text-right">% Part.</th>
                      <th className="py-2 text-right">Retorno prometido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myInvestments.map((i) => (
                      <tr key={i.id} className="border-b border-border/50">
                        <td className="py-2">{fmtDate(i.investment_date)}</td>
                        <td className="py-2 capitalize">{i.investment_type}</td>
                        <td className="py-2 text-right font-mono">{fmtUSD(Number(i.amount_invested))}</td>
                        <td className="py-2 text-right font-mono">{i.ownership_percentage ? `${Number(i.ownership_percentage).toFixed(2)}%` : "—"}</td>
                        <td className="py-2 text-right font-mono">{i.target_return_pct != null ? fmtPct(Number(i.target_return_pct)) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Distribuciones en el tiempo */}
            {perf.timeline.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-sm uppercase tracking-wider text-muted-foreground mb-2">
                  Distribuciones en el tiempo
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                        <th className="py-2">Fecha</th>
                        <th className="py-2">Concepto</th>
                        <th className="py-2 text-right">Monto</th>
                        <th className="py-2 text-right">Acumulado</th>
                        <th className="py-2 text-right">% del capital</th>
                      </tr>
                    </thead>
                    <tbody>
                      {perf.timeline.map((t, idx) => (
                        <tr key={idx} className="border-b border-border/50">
                          <td className="py-2">{fmtDate(t.date)}</td>
                          <td className="py-2">{typeLabels[t.type] ?? t.type}</td>
                          <td className="py-2 text-right font-mono">{fmtUSD(t.amount)}</td>
                          <td className="py-2 text-right font-mono text-accent">{fmtUSD(t.cumulative)}</td>
                          <td className="py-2 text-right font-mono text-muted-foreground">
                            {perf.invested > 0 ? fmtPct(t.cumulative / perf.invested) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Avance general</span>
                <span className="font-mono text-accent">{overall.toFixed(0)}%</span>
              </div>
              <Progress value={overall} className="h-2" />
            </div>

            {projectPhases.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">Fases</h4>
                {projectPhases.map((ph) => (
                  <div key={ph.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{ph.phase_name}</span>
                      <span className="font-mono text-muted-foreground">{Number(ph.completion_percentage).toFixed(0)}%</span>
                    </div>
                    <Progress value={Number(ph.completion_percentage)} className="h-1.5" />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default InvestorProjects;
