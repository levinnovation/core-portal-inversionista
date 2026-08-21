import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { loadProjectReport, type ProjectReport, type ReportItem } from "@/lib/projectReport";
import { Plus, Trash2 } from "lucide-react";

const SECTIONS: { value: string; label: string }[] = [
  { value: "sales_by_tower", label: "Ventas por torre" },
  { value: "sales_detail", label: "Detalle comercial" },
  { value: "collections", label: "Cobranza de primas" },
  { value: "cost_execution", label: "Ejecución de costos" },
  { value: "milestones", label: "Hitos constructivos" },
  { value: "risks", label: "Riesgos" },
  { value: "scenarios", label: "Escenarios" },
  { value: "cash_flow", label: "Flujo de caja" },
];

const NUM_FIELDS: { key: keyof ProjectReport; label: string; step?: string }[] = [
  { key: "construction_month", label: "Mes constructivo" },
  { key: "progress_pct", label: "Avance de obra (%)", step: "0.01" },
  { key: "units_total", label: "Unidades totales" },
  { key: "units_sold", label: "Unidades vendidas" },
  { key: "sales_pct", label: "% ventas totales", step: "0.01" },
  { key: "revenue_projected", label: "Ingresos proyectados (USD)" },
  { key: "sales_placed", label: "Ventas colocadas (USD)" },
  { key: "profit_actual", label: "Utilidad real (USD)" },
  { key: "profit_proforma", label: "Utilidad proforma (USD)" },
  { key: "irr_actual", label: "TIR real (0.27 = 27%)", step: "0.001" },
  { key: "irr_proforma", label: "TIR proforma", step: "0.001" },
  { key: "coc_actual", label: "COC real (multiplicador)", step: "0.01" },
  { key: "coc_proforma", label: "COC proforma", step: "0.01" },
  { key: "delinquency_pct", label: "Morosidad (%)", step: "0.01" },
  { key: "cost_budget_total", label: "Presupuesto total (USD)" },
  { key: "cost_executed_pct", label: "% costos ejecutados", step: "0.01" },
  { key: "expense_executed_pct", label: "% gastos ejecutados", step: "0.01" },
  { key: "financing_total", label: "Financiamiento total (USD)" },
  { key: "financing_disbursed", label: "Financiamiento desembolsado (USD)" },
  { key: "interest_rate", label: "Tasa (0.067 = 6.7%)", step: "0.0001" },
  { key: "equity_total", label: "Aportes totales de socios (USD)" },
];

export const ProjectReportEditor = ({ projectId }: { projectId: string }) => {
  const [report, setReport] = useState<any>(null);
  const [items, setItems] = useState<ReportItem[]>([]);
  const [history, setHistory] = useState<{ id: string; report_date: string }[]>([]);
  const [busy, setBusy] = useState(false);

  const load = async (reportId?: string) => {
    const data = await loadProjectReport(projectId, reportId);
    setReport(data.report);
    setItems(Object.values(data.items).flat().sort((a, b) => a.section.localeCompare(b.section) || a.order_index - b.order_index));
    setHistory(data.history);
  };

  useEffect(() => {
    load();
  }, [projectId]);

  const createReport = async () => {
    setBusy(true);
    const { error } = await supabase.from("project_reports").insert({
      project_id: projectId,
      report_date: new Date().toISOString().slice(0, 10),
      published: true,
    } as any);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Informe creado");
    load();
  };

  const saveReport = async () => {
    if (!report) return;
    setBusy(true);
    const payload: any = { report_date: report.report_date, status_note: report.status_note, loan_term: report.loan_term, published: report.published };
    NUM_FIELDS.forEach(({ key }) => {
      const v = report[key];
      payload[key] = v === "" || v === null || v === undefined ? null : Number(v);
    });
    const { error } = await supabase.from("project_reports").update(payload).eq("id", report.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Informe guardado");
  };

  const addItem = async () => {
    const { error } = await supabase.from("project_report_items").insert({
      report_id: report.id,
      section: "milestones",
      order_index: items.length + 1,
      label: "Nueva fila",
      values: {},
    } as any);
    if (error) return toast.error(error.message);
    load(report.id);
  };

  const saveItem = async (it: ReportItem, patch: any) => {
    const { error } = await supabase.from("project_report_items").update(patch).eq("id", it.id);
    if (error) return toast.error(error.message);
    load(report.id);
  };

  const deleteItem = async (it: ReportItem) => {
    const { error } = await supabase.from("project_report_items").delete().eq("id", it.id);
    if (error) return toast.error(error.message);
    load(report.id);
  };

  if (!report) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center space-y-3">
        <p className="text-muted-foreground">Este proyecto aún no tiene informe mensual.</p>
        <Button onClick={createReport} disabled={busy}>Crear informe del mes</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h4 className="font-display text-xl">Indicadores del informe</h4>
          <div className="flex flex-wrap gap-2">
            {history.length > 1 && (
              <Select value={report.id} onValueChange={(v) => load(v)}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {history.map((h) => (
                    <SelectItem key={h.id} value={h.id}>{new Date(h.report_date).toLocaleDateString("es-CO")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" onClick={createReport} disabled={busy}>Nuevo mes</Button>
            <Button onClick={saveReport} disabled={busy}>Guardar</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <Label>Fecha del informe</Label>
            <Input type="date" value={report.report_date ?? ""} onChange={(e) => setReport({ ...report, report_date: e.target.value })} />
          </div>
          {NUM_FIELDS.map((f) => (
            <div key={String(f.key)}>
              <Label>{f.label}</Label>
              <Input
                type="number"
                step={f.step ?? "1"}
                value={report[f.key] ?? ""}
                onChange={(e) => setReport({ ...report, [f.key]: e.target.value })}
              />
            </div>
          ))}
          <div>
            <Label>Plazo del préstamo</Label>
            <Input value={report.loan_term ?? ""} onChange={(e) => setReport({ ...report, loan_term: e.target.value })} />
          </div>
        </div>
        <div className="mt-3">
          <Label>Estatus ejecutivo</Label>
          <Textarea rows={3} value={report.status_note ?? ""} onChange={(e) => setReport({ ...report, status_note: e.target.value })} />
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-display text-xl">Secciones del informe</h4>
            <p className="text-xs text-muted-foreground">Ventas, cobranza, costos, hitos, riesgos, escenarios y flujo de caja.</p>
          </div>
          <Button variant="outline" size="sm" onClick={addItem}><Plus className="h-4 w-4 mr-1.5" /> Fila</Button>
        </div>
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.id} className="grid grid-cols-1 lg:grid-cols-[180px_1fr_2fr_auto] gap-2 items-start">
              <Select value={it.section} onValueChange={(v) => saveItem(it, { section: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SECTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input defaultValue={it.label ?? ""} onBlur={(e) => e.target.value !== it.label && saveItem(it, { label: e.target.value })} />
              <Textarea
                rows={2}
                className="font-mono text-xs"
                defaultValue={JSON.stringify(it.values)}
                onBlur={(e) => {
                  try {
                    saveItem(it, { values: JSON.parse(e.target.value || "{}") });
                  } catch {
                    toast.error("JSON inválido en los valores de la fila");
                  }
                }}
              />
              <Button variant="ghost" size="icon" onClick={() => deleteItem(it)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-muted-foreground">Sin filas todavía.</p>}
        </div>
      </div>
    </div>
  );
};
