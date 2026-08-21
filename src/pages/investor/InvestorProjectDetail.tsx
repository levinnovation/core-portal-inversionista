import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useImpersonation } from "@/hooks/useImpersonation";
import { loadPortfolio, fmtUSD, fmtDate } from "@/lib/investor";
import { projectPerformance, fmtPct, fmtMultiple } from "@/lib/finance";
import { loadProjectReport, prorate, fmtSharePct, type ProjectReport, type ReportItem } from "@/lib/projectReport";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MapPin, Calendar } from "lucide-react";
import {
  Card, Stat, Table, Chip, usd, pct, chartTooltip,
  ExecutiveSummary, ProfitabilityChart, ProfitabilityTable,
  SalesSections, ConstructionSections, RiskSections, CashFlowSection,
} from "@/components/project/ProjectMetrics";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, Legend,
} from "recharts";

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
  const promised = investments.some((i) => i.target_return_pct != null)
    ? investments.reduce((s, i) => s + Number(i.target_return_pct || 0) * Math.abs(Number(i.amount_invested || 0)), 0) /
      Math.max(pr.myCapital, 1)
    : report?.irr_proforma != null
      ? Number(report.irr_proforma)
      : null;

  const distChart = perf.timeline.map((t) => ({
    name: fmtDate(t.date),
    Distribución: t.amount,
    Acumulado: t.cumulative,
  }));

  const returnCompare = [
    { name: "Prometido", Retorno: (promised ?? 0) * 100 },
    { name: "Proyectado (proyecto)", Retorno: (report?.irr_actual != null ? Number(report.irr_actual) : 0) * 100 },
    { name: "Realizado (mis flujos)", Retorno: (perf.irr ?? 0) * 100 },
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado */}
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
            {report && <span>Informe: {new Date(report.report_date).toLocaleDateString("es-CO", { month: "long", year: "numeric" })}</span>}
          </div>
        </div>
        <div className="text-left sm:text-right shrink-0">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Mi capital</div>
          <div className="font-display text-2xl">{usd(pr.myCapital)}</div>
          {report?.equity_total ? (
            <div className="text-xs text-muted-foreground">{fmtSharePct(pr.share)} de {usd(report.equity_total)} en aportes</div>
          ) : null}
        </div>
      </div>

      {/* Cinta de métricas clave, siempre visible */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="ROI acumulado" value={fmtPct(perf.roi)} note={`${usd(perf.distributed)} distribuidos`} state={perf.roi >= 0 ? "ok" : "bad"} />
        <Stat label="Cash-on-Cash 12m" value={fmtPct(perf.cashOnCash)} note="Distribuciones últimos 12 meses" />
        <Stat label="TIR realizada" value={perf.irr !== null ? fmtPct(perf.irr) : "—"} note={promised != null ? `Prometido ${fmtPct(promised, 0)}` : undefined} delta={perf.irr !== null && promised != null ? perf.irr - promised : null} />
        <Stat label="Múltiplo de capital" value={pr.myCapital > 0 ? fmtMultiple(perf.distributed / pr.myCapital) : "—"} note={report?.coc_actual != null ? `COC proyecto ${fmtMultiple(Number(report.coc_actual))}` : undefined} />
      </div>

      {!report ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
          Aún no hay informe mensual publicado para este proyecto.
        </div>
      ) : (
        <Tabs defaultValue="resumen">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
            <TabsTrigger value="mi-inversion">Mi inversión</TabsTrigger>
            <TabsTrigger value="comercial">Comercial</TabsTrigger>
            <TabsTrigger value="obra">Obra y costos</TabsTrigger>
            <TabsTrigger value="riesgos">Riesgos y escenarios</TabsTrigger>
            <TabsTrigger value="flujos">Flujos</TabsTrigger>
          </TabsList>

          {/* Resumen */}
          <TabsContent value="resumen" className="space-y-6 mt-4">
            <Card title="Semáforo ejecutivo" subtitle="Estado del proyecto al cierre del informe">
              <ExecutiveSummary report={report} />
            </Card>
            <Card title="Rentabilidad: proforma vs real">
              <ProfitabilityChart report={report} />
              <div className="mt-6"><ProfitabilityTable report={report} /></div>
            </Card>
          </TabsContent>

          {/* Mi inversión */}
          <TabsContent value="mi-inversion" className="space-y-6 mt-4">
            <Card
              title="Mi posición"
              subtitle={`Prorrateo por aporte: mi participación = mi capital ÷ aportes totales de socios (${fmtSharePct(pr.share)})`}
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Stat label="Mi capital" value={usd(pr.myCapital)} note={perf.firstDate ? `Desde ${fmtDate(perf.firstDate.toISOString())}` : undefined} />
                <Stat label="Mi participación" value={fmtSharePct(pr.share)} note="Sobre aportes de socios" />
                <Stat label="Mi utilidad proyectada" value={pr.myProfitActual != null ? usd(pr.myProfitActual) : "—"} note={pr.myProfitProforma != null ? `Proforma ${usd(pr.myProfitProforma)}` : undefined} state={(pr.myProfitDelta ?? 0) >= 0 ? "ok" : "bad"} />
                <Stat label="Mi capital al COC actual" value={pr.myCocValueActual != null ? usd(pr.myCocValueActual) : "—"} note={report.coc_actual != null ? `${fmtMultiple(Number(report.coc_actual))} sobre el capital` : undefined} />
              </div>
            </Card>

            <Card title="Retorno prometido vs proyectado vs realizado" subtitle="Tasa anual (%)">
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={returnCompare} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v}%`} />
                    <RTooltip formatter={(v: any) => `${Number(v).toFixed(1)}%`} {...chartTooltip} />
                    <Bar dataKey="Retorno" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-5">
                <Table head={["Métrica", "Prometido / Proforma", "Proyectado (proyecto)", "Realizado (mis flujos)"]} min={620}>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Retorno anual</td>
                    <td className="py-2 text-right font-mono">{promised != null ? fmtPct(promised, 1) : "—"}</td>
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
              </div>
            </Card>

            {distChart.length > 0 && (
              <Card title="Mis distribuciones en el tiempo" subtitle="Monto por evento y acumulado">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={distChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <RTooltip formatter={(v: any) => fmtUSD(Number(v))} {...chartTooltip} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Area type="monotone" dataKey="Acumulado" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1) / 0.2)" />
                      <Area type="monotone" dataKey="Distribución" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2) / 0.2)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-5">
                  <Table head={["Fecha", "Concepto", "Monto", "Acumulado", "% del capital"]} min={520}>
                    {perf.timeline.map((t, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-2">{fmtDate(t.date)}</td>
                        <td className="py-2">{t.type.replace(/_/g, " ")}</td>
                        <td className="py-2 text-right font-mono">{usd(t.amount)}</td>
                        <td className="py-2 text-right font-mono">{usd(t.cumulative)}</td>
                        <td className="py-2 text-right font-mono text-muted-foreground">{pr.myCapital > 0 ? fmtPct(t.cumulative / pr.myCapital) : "—"}</td>
                      </tr>
                    ))}
                  </Table>
                </div>
              </Card>
            )}

            {investments.length > 0 && (
              <Card title="Detalle de mis aportes">
                <Table head={["Fecha", "Monto", "Tipo", "Retorno prometido", "Estado"]} min={520}>
                  {investments.map((i) => (
                    <tr key={i.id} className="border-b border-border/50">
                      <td className="py-2">{i.investment_date ? fmtDate(i.investment_date) : "—"}</td>
                      <td className="py-2 text-right font-mono">{usd(i.amount_invested)}</td>
                      <td className="py-2 text-right">{i.investment_type ?? "—"}</td>
                      <td className="py-2 text-right font-mono">{i.target_return_pct != null ? fmtPct(Number(i.target_return_pct), 1) : "—"}</td>
                      <td className="py-2 text-right"><Chip text={String(i.status ?? "activa")} /></td>
                    </tr>
                  ))}
                </Table>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="comercial" className="mt-4">
            <SalesSections items={items} />
          </TabsContent>

          <TabsContent value="obra" className="mt-4">
            <ConstructionSections report={report} items={items} />
          </TabsContent>

          <TabsContent value="riesgos" className="mt-4">
            <RiskSections items={items} share={pr.share} />
          </TabsContent>

          <TabsContent value="flujos" className="mt-4">
            <CashFlowSection items={items} share={pr.share} />
          </TabsContent>
        </Tabs>
      )}

      {report && (
        <p className="text-xs text-muted-foreground">
          Información confidencial para socios. Las cifras corresponden al informe del{" "}
          {new Date(report.report_date).toLocaleDateString("es-CO")} y pueden variar con el avance del proyecto.
        </p>
      )}
    </div>
  );
};

export default InvestorProjectDetail;
