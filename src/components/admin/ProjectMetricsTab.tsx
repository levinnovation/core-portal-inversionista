import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { loadProjectReport, type ProjectReport, type ReportItem } from "@/lib/projectReport";
import { fmtPct, fmtMultiple, xirr } from "@/lib/finance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card, Stat, Table, usd, ExecutiveSummary, ProfitabilityChart, ProfitabilityTable,
  SalesSections, ConstructionSections, RiskSections, CashFlowSection,
} from "@/components/project/ProjectMetrics";

/** Mismas métricas que ve el inversionista, en versión consolidada para el equipo Core. */
export const ProjectMetricsTab = ({ projectId }: { projectId: string }) => {
  const [report, setReport] = useState<ProjectReport | null>(null);
  const [items, setItems] = useState<Record<string, ReportItem[]>>({});
  const [investments, setInvestments] = useState<any[]>([]);
  const [distributions, setDistributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const rep = await loadProjectReport(projectId);
      const { data: inv } = await supabase
        .from("investments")
        .select("*, investors(full_name)")
        .eq("project_id", projectId);
      const ids = (inv ?? []).map((i: any) => i.id);
      const { data: dist } = ids.length
        ? await supabase.from("distributions").select("*").in("investment_id", ids)
        : { data: [] as any[] };
      setReport(rep.report);
      setItems(rep.items);
      setInvestments(inv ?? []);
      setDistributions(dist ?? []);
      setLoading(false);
    })();
  }, [projectId]);

  if (loading) return <div className="text-muted-foreground py-8">Cargando métricas…</div>;

  const capital = investments.reduce((s, i) => s + Number(i.amount_invested || 0), 0);
  const paid = distributions.reduce((s, d) => s + Number(d.amount || 0), 0);
  const flows = [
    ...investments.map((i: any) => ({ date: new Date(i.investment_date ?? Date.now()), amount: -Number(i.amount_invested || 0) })),
    ...distributions.map((d: any) => ({ date: new Date(d.distribution_date ?? Date.now()), amount: Number(d.amount || 0) })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());
  const irr = flows.length > 1 ? xirr(flows) : null;

  const byInvestor = Object.values(
    investments.reduce((acc: Record<string, any>, i: any) => {
      const key = i.investor_id;
      acc[key] = acc[key] ?? { name: i.investors?.full_name ?? "—", capital: 0, ids: [] as string[] };
      acc[key].capital += Number(i.amount_invested || 0);
      acc[key].ids.push(i.id);
      return acc;
    }, {}),
  ).map((r: any) => ({
    ...r,
    paid: distributions.filter((d) => r.ids.includes(d.investment_id)).reduce((s, d) => s + Number(d.amount || 0), 0),
    share: capital > 0 ? r.capital / capital : 0,
  }));

  return (
    <div className="space-y-6">
      <Card title="Posición de socios" subtitle="Capital comprometido y distribuciones pagadas en este proyecto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <Stat label="Capital de socios" value={usd(capital)} note={`${byInvestor.length} inversionistas`} />
          <Stat label="Distribuciones pagadas" value={usd(paid)} note={capital > 0 ? `${((paid / capital) * 100).toFixed(1)}% del capital` : undefined} />
          <Stat label="TIR realizada (agregada)" value={irr != null ? fmtPct(irr) : "—"} note="Sobre flujos reales de socios" />
          <Stat label="Múltiplo pagado" value={capital > 0 ? fmtMultiple(paid / capital) : "—"} note="Distribuciones ÷ capital" />
        </div>
        {byInvestor.length > 0 && (
          <Table head={["Inversionista", "Capital", "Participación", "Distribuido", "Múltiplo"]} min={560}>
            {byInvestor.map((r: any) => (
              <tr key={r.name} className="border-b border-border/50">
                <td className="py-2 font-medium">{r.name}</td>
                <td className="py-2 text-right font-mono">{usd(r.capital)}</td>
                <td className="py-2 text-right font-mono">{(r.share * 100).toFixed(2)}%</td>
                <td className="py-2 text-right font-mono">{usd(r.paid)}</td>
                <td className="py-2 text-right font-mono">{r.capital > 0 ? fmtMultiple(r.paid / r.capital) : "—"}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {!report ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
          Este proyecto todavía no tiene informe mensual publicado. Créalo en la pestaña “Informe mensual”.
        </div>
      ) : (
        <Tabs defaultValue="resumen">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
            <TabsTrigger value="comercial">Comercial</TabsTrigger>
            <TabsTrigger value="obra">Obra y costos</TabsTrigger>
            <TabsTrigger value="riesgos">Riesgos y escenarios</TabsTrigger>
            <TabsTrigger value="flujos">Flujos</TabsTrigger>
          </TabsList>

          <TabsContent value="resumen" className="space-y-6 mt-4">
            <Card title="Semáforo ejecutivo" subtitle="Lo mismo que ve el inversionista">
              <ExecutiveSummary report={report} />
            </Card>
            <Card title="Rentabilidad: proforma vs real">
              <ProfitabilityChart report={report} />
              <div className="mt-6"><ProfitabilityTable report={report} /></div>
            </Card>
          </TabsContent>

          <TabsContent value="comercial" className="mt-4"><SalesSections items={items} /></TabsContent>
          <TabsContent value="obra" className="mt-4"><ConstructionSections report={report} items={items} /></TabsContent>
          <TabsContent value="riesgos" className="mt-4"><RiskSections items={items} /></TabsContent>
          <TabsContent value="flujos" className="mt-4"><CashFlowSection items={items} /></TabsContent>
        </Tabs>
      )}
    </div>
  );
};
