import { supabase } from "@/integrations/supabase/client";

export type ReportSection =
  | "sales_by_tower"
  | "sales_detail"
  | "collections"
  | "cost_execution"
  | "milestones"
  | "risks"
  | "scenarios"
  | "cash_flow";

export interface ReportItem {
  id: string;
  section: string;
  order_index: number;
  label: string | null;
  values: any;
}

export interface ProjectReport {
  id: string;
  project_id: string;
  report_date: string;
  construction_month: number | null;
  progress_pct: number | null;
  status_note: string | null;
  units_total: number | null;
  units_sold: number | null;
  sales_pct: number | null;
  revenue_projected: number | null;
  sales_placed: number | null;
  profit_actual: number | null;
  profit_proforma: number | null;
  irr_actual: number | null;
  irr_proforma: number | null;
  coc_actual: number | null;
  coc_proforma: number | null;
  delinquency_pct: number | null;
  cost_budget_total: number | null;
  cost_executed_pct: number | null;
  expense_executed_pct: number | null;
  financing_total: number | null;
  financing_disbursed: number | null;
  interest_rate: number | null;
  loan_term: string | null;
  equity_total: number | null;
  published: boolean;
}

export interface ProjectReportData {
  report: ProjectReport | null;
  items: Record<string, ReportItem[]>;
  history: { id: string; report_date: string }[];
}

/** Carga el informe más reciente del proyecto (o uno específico) con sus secciones. */
export async function loadProjectReport(projectId: string, reportId?: string): Promise<ProjectReportData> {
  const { data: reports } = await supabase
    .from("project_reports")
    .select("*")
    .eq("project_id", projectId)
    .order("report_date", { ascending: false });

  const list = (reports ?? []) as any[];
  const report = (reportId ? list.find((r) => r.id === reportId) : list[0]) ?? null;
  if (!report) return { report: null, items: {}, history: [] };

  const { data: rows } = await supabase
    .from("project_report_items")
    .select("*")
    .eq("report_id", report.id)
    .order("order_index");

  const items: Record<string, ReportItem[]> = {};
  (rows ?? []).forEach((it: any) => {
    (items[it.section] ??= []).push(it as ReportItem);
  });

  return {
    report: report as ProjectReport,
    items,
    history: list.map((r) => ({ id: r.id, report_date: r.report_date })),
  };
}

export interface ProratedMetrics {
  share: number; // participación del inversionista (0-1)
  myCapital: number;
  myProfitActual: number | null;
  myProfitProforma: number | null;
  myProfitDelta: number | null;
  myCocValueActual: number | null; // capital × COC actual
  myCocValueProforma: number | null;
}

/**
 * Prorratea los indicadores del proyecto según el aporte del inversionista.
 * participación = mi capital ÷ aportes totales de socios (equity_total).
 * Si no hay equity_total, cae al % de participación registrado en la inversión.
 */
export function prorate(
  report: ProjectReport | null,
  myInvestments: any[],
): ProratedMetrics {
  const myCapital = myInvestments.reduce((s, i) => s + Math.abs(Number(i.amount_invested || 0)), 0);
  let share = 0;
  const equity = Number(report?.equity_total || 0);
  if (equity > 0) {
    share = myCapital / equity;
  } else {
    const pct = myInvestments.reduce((s, i) => s + Number(i.ownership_percentage || 0), 0);
    share = pct / 100;
  }

  const pa = report?.profit_actual != null ? Number(report.profit_actual) * share : null;
  const pp = report?.profit_proforma != null ? Number(report.profit_proforma) * share : null;

  return {
    share,
    myCapital,
    myProfitActual: pa,
    myProfitProforma: pp,
    myProfitDelta: pa != null && pp != null ? pa - pp : null,
    myCocValueActual: report?.coc_actual != null ? myCapital * Number(report.coc_actual) : null,
    myCocValueProforma: report?.coc_proforma != null ? myCapital * Number(report.coc_proforma) : null,
  };
}

export const fmtSharePct = (n: number) => `${(n * 100).toFixed(2)}%`;
