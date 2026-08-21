import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useImpersonation } from "@/hooks/useImpersonation";
import { supabase } from "@/integrations/supabase/client";
import { loadPortfolio, fmtUSD, fmtDate } from "@/lib/investor";
import { projectPerformance, fmtPct, fmtMultiple } from "@/lib/finance";
import { loadProjectReport, prorate, fmtSharePct, type ProjectReport, type ReportItem } from "@/lib/projectReport";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Calendar, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend } from "recharts";

const usd = (n: any) => fmtUSD(Number(n || 0));
const pct = (n: any, d = 1) => (n == null ? "—" : `${Number(n).toFixed(d)}%`);

const Card = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
  <section className="bg-card border border-border rounded-lg p-5 sm:p-6 shadow-card">
    <div className="mb-4">
      <h3 className="font-display text-xl">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </section>
);

const tone = (state: "ok" | "warn" | "bad") =>
  state === "ok" ? "text-accent" : state === "warn" ? "text-amber-500" : "text-destructive";

const Chip = ({ text }: { text: string }) => {
  const t = text.toLowerCase();
  const cls = /línea|completo|normal|ok|mayor|viable|baja|bajo/.test(t)
    ? "bg-accent/10 text-accent"
    : /alerta|atención|medio|en curso|warn/.test(t)
      ? "bg-amber-500/10 text-amber-500"
      : /alto|rojo|vencid|irregular/.test(t)
        ? "bg-destructive/10 text-destructive"
        : "bg-secondary text-muted-foreground";
  return <span className={`px-2 py-0.5 rounded text-xs whitespace-nowrap ${cls}`}>{text}</span>;
};

const Stat = ({ label, value, note, state }: { label: string; value: string; note?: string; state?: "ok" | "warn" | "bad" }) => (
  <div className="rounded-lg border border-border bg-secondary/30 p-4 min-w-0">
    <div className="text-[11px] uppercase tracking-wider text-muted-foreground truncate">{label}</div>
    <div className={`font-display text-xl truncate ${state ? tone(state) : ""}`} title={value}>{value}</div>
    {note && <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{note}</div>}
  </div>
);

const Table = ({ head, children, min = 640 }: { head: string[]; children: React.ReactNode; min?: number }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm" style={{ minWidth: min }}>
      <thead>
        <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
          {head.map((h, i) => (
            <th key={h + i} className={`py-2 ${i > 0 ? "text-right" : ""}`}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

const InvestorProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { target } = useImpersonation();
  const [project, setProject] = useState<any>(null);
  const [report, setReport] = useState<ProjectReport | null>(null);
  const [items, setItems] = useState<Record<string, ReportItem[]>>({});
  const [investments, setInvestments] = useState<any[]>([]);
  const [distributions, setDistributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    (async () => {
      setLoading(true);
      const portfolio = await loadPortfolio(user.id, {
        impersonateInvestorId: target?.kind === "investor" ? target.recordId : null,
      });
      const myInv = portfolio.investments.filter((i: any) => i.project_id === id);
      const invIds = new Set(myInv.map((i: any) => i.id));
      setInvestments(myInv);
      setDistributions(portfolio.distributions.filter((d: any) => invIds.has(d.investment_id)));
      setProject(portfolio.projects.find((p: any) => p.id === id) ?? null);
      const rep = await loadProjectReport(id);
      setReport(rep.report);
      setItems(rep.items);
      setLoading(false);
    })();
  }, [user, id, target]);

  if (loading) return <div className="text-muted-foreground">Cargando informe…</div>;
  if (!project) {
    return (
      <div className="bg-card border border-border rounded-lg p-10 text-center text-muted-foreground">
        No tienes inversiones registradas en este proyecto.
      </div>
    );
  }

  const perf = projectPerformance(investments, distributions);
  const pr = prorate(report, investments);
  const cashFlow = (items.cash_flow ?? []).map((r) => ({
    name: r.label ?? "",
    Ingresos: Number(r.values?.inflow || 0),
    Egresos: Number(r.values?.outflow || 0),
    Neto: Number(r.values?.net || 0),
    "Mi flujo": Number(r.values?.net || 0) * pr.share,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-1">
            <Link to="/inversionistas/proyectos"><ArrowLeft className="h-4 w-4 mr-1.5" /> Proyectos</Link>
          </Button>
          <h2 className="font-display text-3xl truncate">{project.name}</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
            {project.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{project.location}</span>}
            {project.estimated_delivery && (
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Entrega: {new Date(project.estimated_delivery).toLocaleDateString("es-CO")}</span>
            )}
            {report && (
              <span>Informe: {new Date(report.report_date).toLocaleDateString("es-CO", { month: "long", year: "numeric" })}</span>
            )}
          </div>
        </div>
        <div className="text-left sm:text-right shrink-0">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Mi capital</div>
          <div className="font-display text-2xl">{usd(pr.myCapital)}</div>
          {report?.equity_total ? (
            <div className="text-xs text-muted-foreground">{fmtSharePct(pr.share)} de ${Number(report.equity_total).toLocaleString("en-US")} en aportes</div>
          ) : null}
        </div>
      </div>

      {!report && (
        <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
          Aún no hay informe mensual publicado para este proyecto.
        </div>
      )}

      {report && (
        <>
          {/* Semáforo ejecutivo */}
          <Card title="Semáforo ejecutivo" subtitle={report.status_note ?? undefined}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Stat label="Avance de obra" value={pct(report.progress_pct, 2)} note={report.construction_month ? `Mes ${report.construction_month} de la etapa constructiva` : undefined} state="ok" />
              <Stat label="Unidades prevendidas" value={`${report.units_sold ?? "—"}`} note={`${report.units_total ?? "—"} unidades totales`} state="ok" />
              <Stat label="% ventas totales" value={pct(report.sales_pct, 0)} note="Del inventario total" state={Number(report.sales_pct) >= 70 ? "ok" : "warn"} />
              <Stat label="Utilidad" value={usd(report.profit_actual)} note={`Proforma ${usd(report.profit_proforma)}`} state={Number(report.profit_actual) >= Number(report.profit_proforma) ? "ok" : "bad"} />
              <Stat label="% costos ejecutados" value={pct(report.cost_executed_pct, 2)} note="Conforme avance" state="ok" />
              <Stat label="Financiamiento desembolsado" value={usd(report.financing_disbursed)} note={`Total ${usd(report.financing_total)}`} state="ok" />
              <Stat label="TIR proyecto" value={report.irr_actual != null ? fmtPct(Number(report.irr_actual), 0) : "—"} note={`Proforma ${report.irr_proforma != null ? fmtPct(Number(report.irr_proforma), 0) : "—"}`} state={Number(report.irr_actual) >= Number(report.irr_proforma) ? "ok" : "bad"} />
              <Stat label="Morosidad" value={pct(report.delinquency_pct, 2)} note="Normal ≤ 4% · Irregular > 4%" state={Number(report.delinquency_pct) <= 4 ? "ok" : "bad"} />
            </div>
          </Card>

          {/* Indicadores de rentabilidad */}
          <Card title="Indicadores de rentabilidad" subtitle="Proforma vs real al cierre del informe">
            <Table head={["Parámetro", "Proforma", "Real", "Diferencia", "Estado"]} min={560}>
              {[
                { k: "Utilidad", pf: report.profit_proforma, rl: report.profit_actual, f: (v: any) => usd(v) },
                { k: "TIR", pf: report.irr_proforma, rl: report.irr_actual, f: (v: any) => (v == null ? "—" : fmtPct(Number(v), 0)) },
                { k: "COC", pf: report.coc_proforma, rl: report.coc_actual, f: (v: any) => (v == null ? "—" : fmtMultiple(Number(v))) },
              ].map((row) => {
                const diff = row.rl != null && row.pf != null ? Number(row.rl) - Number(row.pf) : null;
                const up = (diff ?? 0) >= 0;
                return (
                  <tr key={row.k} className="border-b border-border/50">
                    <td className="py-2">{row.k}</td>
                    <td className="py-2 text-right font-mono">{row.f(row.pf)}</td>
                    <td className="py-2 text-right font-mono">{row.f(row.rl)}</td>
                    <td className={`py-2 text-right font-mono ${up ? "text-accent" : "text-destructive"}`}>
                      {diff == null ? "—" : `${up ? "+" : ""}${row.f(diff)}`}
                    </td>
                    <td className="py-2 text-right"><Chip text={up ? "Mayor a proforma" : "Menor a proforma"} /></td>
                  </tr>
                );
              })}
            </Table>
          </Card>

          {/* Mi inversión */}
          <Card
            title="Mi inversión en este proyecto"
            subtitle={`Prorrateo por aporte: mi participación = mi capital ÷ aportes totales de socios (${fmtSharePct(pr.share)})`}
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              <Stat label="Mi capital" value={usd(pr.myCapital)} note={perf.firstDate ? `Desde ${fmtDate(perf.firstDate.toISOString())}` : undefined} />
              <Stat label="Mi participación" value={fmtSharePct(pr.share)} note="Sobre aportes de socios" />
              <Stat label="Mi utilidad proyectada" value={pr.myProfitActual != null ? usd(pr.myProfitActual) : "—"} note={pr.myProfitProforma != null ? `Proforma ${usd(pr.myProfitProforma)}` : undefined} state={(pr.myProfitDelta ?? 0) >= 0 ? "ok" : "bad"} />
              <Stat label="Mi capital al COC actual" value={pr.myCocValueActual != null ? usd(pr.myCocValueActual) : "—"} note={report.coc_actual != null ? `${fmtMultiple(Number(report.coc_actual))} sobre el capital` : undefined} />
            </div>
            <Table head={["Métrica", "Prometido / Proforma", "Proyectado (proyecto)", "Realizado (mis flujos)"]} min={620}>
              <tr className="border-b border-border/50">
                <td className="py-2">Retorno anual</td>
                <td className="py-2 text-right font-mono">
                  {investments.some((i) => i.target_return_pct != null)
                    ? fmtPct(
                        investments.reduce((s, i) => s + Number(i.target_return_pct || 0) * Math.abs(Number(i.amount_invested || 0)), 0) /
                          Math.max(pr.myCapital, 1),
                      )
                    : report.irr_proforma != null
                      ? fmtPct(Number(report.irr_proforma), 0)
                      : "—"}
                </td>
                <td className="py-2 text-right font-mono">{report.irr_actual != null ? fmtPct(Number(report.irr_actual), 0) : "—"}</td>
                <td className="py-2 text-right font-mono">{perf.irr !== null ? fmtPct(perf.irr) : "—"}</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2">Multiplicador de capital (COC / EM)</td>
                <td className="py-2 text-right font-mono">{report.coc_proforma != null ? fmtMultiple(Number(report.coc_proforma)) : "—"}</td>
                <td className="py-2 text-right font-mono">{report.coc_actual != null ? fmtMultiple(Number(report.coc_actual)) : "—"}</td>
                <td className="py-2 text-right font-mono">{pr.myCapital > 0 ? fmtMultiple(perf.distributed / pr.myCapital) : "—"}</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2">Utilidad</td>
                <td className="py-2 text-right font-mono">{pr.myProfitProforma != null ? usd(pr.myProfitProforma) : "—"}</td>
                <td className="py-2 text-right font-mono">{pr.myProfitActual != null ? usd(pr.myProfitActual) : "—"}</td>
                <td className="py-2 text-right font-mono">{usd(perf.distributed)} distribuidos</td>
              </tr>
              <tr>
                <td className="py-2">ROI acumulado / Cash-on-Cash 12m</td>
                <td className="py-2 text-right font-mono">—</td>
                <td className="py-2 text-right font-mono">—</td>
                <td className="py-2 text-right font-mono">{fmtPct(perf.roi)} / {fmtPct(perf.cashOnCash)}</td>
              </tr>
            </Table>
          </Card>

          {/* Ventas por torre */}
          {items.sales_by_tower?.length > 0 && (
            <Card title="Ventas y colocación" subtitle="Contratos de pre-venta por torre">
              <Table head={["Torre", "Unidades", "Vendidas", "% vendido", "Ingresos", "Ventas", "Cumplimiento", "Estado"]} min={760}>
                {items.sales_by_tower.map((r) => (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="py-2 font-medium">{r.label}</td>
                    <td className="py-2 text-right font-mono">{r.values.units_total}</td>
                    <td className="py-2 text-right font-mono">{r.values.units_sold}</td>
                    <td className="py-2 text-right font-mono">{pct(r.values.sold_pct, 0)}</td>
                    <td className="py-2 text-right font-mono">{usd(r.values.revenue)}</td>
                    <td className="py-2 text-right font-mono">{usd(r.values.sales)}</td>
                    <td className="py-2 text-right font-mono">{pct(r.values.fulfillment, 0)}</td>
                    <td className="py-2 text-right"><Chip text={String(r.values.state ?? "")} /></td>
                  </tr>
                ))}
              </Table>
            </Card>
          )}

          {/* Detalle comercial real vs proyectado */}
          {items.sales_detail?.length > 0 && (
            <Card title="Desempeño comercial: real vs proyectado">
              <Table head={["Indicador", "Real", "Proyectado", "Variación"]} min={600}>
                {items.sales_detail.map((r) => (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="py-2">{r.label}</td>
                    <td className="py-2 text-right font-mono">{r.values.real}</td>
                    <td className="py-2 text-right font-mono text-muted-foreground">{r.values.projected}</td>
                    <td className={`py-2 text-right font-mono ${r.values.state === "alert" ? "text-destructive" : r.values.state === "warn" ? "text-amber-500" : "text-accent"}`}>
                      {r.values.variance}
                    </td>
                  </tr>
                ))}
              </Table>
            </Card>
          )}

          {/* Cobranza */}
          {items.collections?.length > 0 && (
            <Card title="Ingresos por primas y estado de cobranza" subtitle="Normalidad: morosidad ≤ 4%">
              <Table head={["Concepto", "Monto", "Estado"]} min={480}>
                {items.collections.map((r) => (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="py-2">{r.label}</td>
                    <td className="py-2 text-right font-mono">{usd(r.values.amount)}</td>
                    <td className="py-2 text-right"><Chip text={String(r.values.state ?? "")} /></td>
                  </tr>
                ))}
              </Table>
            </Card>
          )}

          {/* Costos */}
          {items.cost_execution?.length > 0 && (
            <Card title="Ejecución de costos y gastos" subtitle={`Presupuesto total ${usd(report.cost_budget_total)} · costos ${pct(report.cost_executed_pct, 2)} · gastos ${pct(report.expense_executed_pct, 2)}`}>
              <div className="space-y-4">
                {items.cost_execution.map((r) => {
                  const over = Number(r.values.pct) > 90;
                  return (
                    <div key={r.id} className={r.values.is_total ? "pt-3 border-t border-border" : ""}>
                      <div className="flex flex-wrap justify-between gap-2 text-sm mb-1">
                        <span className={r.values.is_total ? "font-medium" : ""}>{r.label}</span>
                        <span className="font-mono text-muted-foreground">
                          {usd(r.values.executed)} de {usd(r.values.total)}
                          <span className={`ml-2 ${over ? "text-amber-500" : "text-accent"}`}>{pct(r.values.pct, 2)}</span>
                        </span>
                      </div>
                      <Progress value={Math.min(Number(r.values.pct || 0), 100)} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Hitos */}
          {items.milestones?.length > 0 && (
            <Card title="Avance de construcción" subtitle={`Avance reportado: ${pct(report.progress_pct, 2)}`}>
              <Table head={["Hito constructivo", "Fecha plan", "Fecha real", "Estado"]} min={520}>
                {items.milestones.map((r) => (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="py-2">{r.label}</td>
                    <td className="py-2 text-right font-mono">{r.values.planned}</td>
                    <td className="py-2 text-right font-mono">{r.values.actual}</td>
                    <td className="py-2 text-right"><Chip text={String(r.values.state ?? "")} /></td>
                  </tr>
                ))}
              </Table>
            </Card>
          )}

          {/* Financiamiento */}
          <Card title="Financiamiento bancario">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Stat label="Monto pactado" value={usd(report.financing_total)} />
              <Stat label="Desembolsado" value={usd(report.financing_disbursed)} note={report.financing_total ? `${((Number(report.financing_disbursed) / Number(report.financing_total)) * 100).toFixed(0)}% del total` : undefined} />
              <Stat label="Avance obra vs desembolso" value={`${pct(report.progress_pct, 0)} // ${report.financing_total ? ((Number(report.financing_disbursed) / Number(report.financing_total)) * 100).toFixed(0) : "—"}%`} />
              <Stat label="Tasa / plazo" value={report.interest_rate != null ? fmtPct(Number(report.interest_rate), 2) : "—"} note={report.loan_term ?? undefined} />
            </div>
          </Card>

          {/* Riesgos */}
          {items.risks?.length > 0 && (
            <Card title="Matriz de riesgos y mitigaciones">
              <div className="space-y-3">
                {items.risks.map((r) => (
                  <div key={r.id} className="rounded-lg border border-border p-4">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                      <span className="font-medium">{r.label}</span>
                      <Chip text={`Nivel ${r.values.level}`} />
                      <Chip text={`Impacto ${r.values.impact}`} />
                      <Chip text={`Prob. ${r.values.probability}`} />
                    </div>
                    <p className="text-sm text-muted-foreground">{r.values.description}</p>
                    <p className="text-sm mt-1"><span className="text-muted-foreground">Mitigación: </span>{r.values.mitigation}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Escenarios */}
          {items.scenarios?.length > 0 && (
            <Card title="Escenarios de sensibilidad" subtitle="Incluye tu utilidad prorrateada en cada escenario">
              <Table head={["Parámetro", "Pesimista", "Real", "Optimista"]} min={520}>
                {items.scenarios.map((r) => {
                  const f = (v: any) =>
                    r.values.format === "pct" ? fmtPct(Number(v), 0) : r.values.format === "multiple" ? fmtMultiple(Number(v)) : usd(v);
                  return (
                    <>
                      <tr key={r.id} className="border-b border-border/50">
                        <td className="py-2">{r.label}</td>
                        <td className="py-2 text-right font-mono">{f(r.values.pessimistic)}</td>
                        <td className="py-2 text-right font-mono text-accent">{f(r.values.real)}</td>
                        <td className="py-2 text-right font-mono">{f(r.values.optimistic)}</td>
                      </tr>
                      {r.values.prorate && pr.share > 0 && (
                        <tr key={r.id + "-mine"} className="border-b border-border/50 bg-secondary/30">
                          <td className="py-2 pl-4 text-muted-foreground">Mi {String(r.label).toLowerCase()} ({fmtSharePct(pr.share)})</td>
                          <td className="py-2 text-right font-mono">{usd(Number(r.values.pessimistic) * pr.share)}</td>
                          <td className="py-2 text-right font-mono text-accent">{usd(Number(r.values.real) * pr.share)}</td>
                          <td className="py-2 text-right font-mono">{usd(Number(r.values.optimistic) * pr.share)}</td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </Table>
            </Card>
          )}

          {/* Flujo de caja */}
          {cashFlow.length > 0 && (
            <Card title="Flujo de caja proyectado" subtitle="Flujo neto del proyecto y tu flujo prorrateado">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashFlow} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
                    <RTooltip formatter={(v: any) => fmtUSD(Number(v))} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Neto" fill="hsl(var(--accent))" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="h-56 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashFlow} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <RTooltip formatter={(v: any) => fmtUSD(Number(v))} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="Mi flujo" stroke="hsl(var(--accent))" fill="hsl(var(--accent) / 0.2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Distribuciones recibidas */}
          {perf.timeline.length > 0 && (
            <Card title="Mis distribuciones en el tiempo">
              <Table head={["Fecha", "Concepto", "Monto", "Acumulado", "% del capital"]} min={520}>
                {perf.timeline.map((t, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2">{fmtDate(t.date)}</td>
                    <td className="py-2">{t.type.replace(/_/g, " ")}</td>
                    <td className="py-2 text-right font-mono">{usd(t.amount)}</td>
                    <td className="py-2 text-right font-mono text-accent">{usd(t.cumulative)}</td>
                    <td className="py-2 text-right font-mono text-muted-foreground">{pr.myCapital > 0 ? fmtPct(t.cumulative / pr.myCapital) : "—"}</td>
                  </tr>
                ))}
              </Table>
            </Card>
          )}

          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            {(pr.myProfitDelta ?? 0) >= 0 ? <TrendingUp className="h-3.5 w-3.5 text-accent" /> : <TrendingDown className="h-3.5 w-3.5 text-destructive" />}
            Información confidencial para socios. Las cifras corresponden al informe del{" "}
            {new Date(report.report_date).toLocaleDateString("es-CO")} y pueden variar con el avance del proyecto.
          </p>
        </>
      )}
    </div>
  );
};

export default InvestorProjectDetail;
