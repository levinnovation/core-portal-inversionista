import { Fragment } from "react";
import { Progress } from "@/components/ui/progress";
import { fmtUSD } from "@/lib/investor";
import { fmtPct, fmtMultiple } from "@/lib/finance";
import type { ProjectReport, ReportItem } from "@/lib/projectReport";
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar, PolarAngleAxis,
} from "recharts";

export const usd = (n: any) => fmtUSD(Number(n || 0));
export const pct = (n: any, d = 1) => (n == null ? "—" : `${Number(n).toFixed(d)}%`);

export const chartTooltip = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 8,
    color: "hsl(var(--card-foreground))",
    fontSize: 12,
  },
  labelStyle: { color: "hsl(var(--card-foreground))" },
} as const;

export const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export const Card = ({ title, subtitle, right, children }: { title?: string; subtitle?: string; right?: React.ReactNode; children: React.ReactNode }) => (
  <section className="bg-card border border-border rounded-lg p-5 sm:p-6 shadow-card">
    {(title || right) && (
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {title && <h3 className="font-display text-xl">{title}</h3>}
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {right}
      </div>
    )}
    {children}
  </section>
);

const tone = (state?: "ok" | "warn" | "bad") =>
  state === "ok" ? "text-success" : state === "warn" ? "text-warning" : state === "bad" ? "text-destructive" : "";

export const Chip = ({ text }: { text: string }) => {
  const t = (text ?? "").toLowerCase();
  const cls = /línea|completo|normal|ok|mayor|viable|baja|bajo/.test(t)
    ? "bg-success/10 text-success"
    : /alerta|atención|medio|en curso|warn/.test(t)
      ? "bg-warning/10 text-warning"
      : /alto|rojo|vencid|irregular|menor/.test(t)
        ? "bg-destructive/10 text-destructive"
        : "bg-secondary text-muted-foreground";
  return <span className={`px-2 py-0.5 rounded text-xs whitespace-nowrap ${cls}`}>{text}</span>;
};

export const Stat = ({
  label, value, note, state, delta,
}: { label: string; value: string; note?: string; state?: "ok" | "warn" | "bad"; delta?: number | null }) => (
  <div className="rounded-lg border border-border bg-muted/40 p-4 min-w-0">
    <div className="text-[11px] uppercase tracking-wider text-muted-foreground truncate">{label}</div>
    <div className={`font-display text-xl truncate ${tone(state)}`} title={value}>{value}</div>
    <div className="flex items-center gap-1 mt-1">
      {delta != null && (
        delta > 0 ? <TrendingUp className="h-3 w-3 text-success shrink-0" />
          : delta < 0 ? <TrendingDown className="h-3 w-3 text-destructive shrink-0" />
            : <Minus className="h-3 w-3 text-muted-foreground shrink-0" />
      )}
      {note && <div className="text-[11px] text-muted-foreground line-clamp-2">{note}</div>}
    </div>
  </div>
);

export const Table = ({ head, children, min = 640 }: { head: string[]; children: React.ReactNode; min?: number }) => (
  <div className="overflow-x-auto -mx-1 px-1">
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

/** Anillo de progreso con etiqueta central. */
export const Gauge = ({ value, label, caption, color = "hsl(var(--chart-1))" }: { value: number; label: string; caption?: string; color?: string }) => (
  <div className="rounded-lg border border-border bg-muted/40 p-4 flex flex-col items-center">
    <div className="h-28 w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="72%" outerRadius="100%" data={[{ v: Math.max(0, Math.min(Number(value || 0), 100)) }]} startAngle={90} endAngle={-270}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="v" cornerRadius={8} fill={color} background={{ fill: "hsl(var(--border))" }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="font-display text-lg">{value == null ? "—" : `${Number(value).toFixed(0)}%`}</span>
      </div>
    </div>
    <div className="text-xs uppercase tracking-wider text-muted-foreground text-center mt-1">{label}</div>
    {caption && <div className="text-[11px] text-muted-foreground text-center mt-0.5">{caption}</div>}
  </div>
);

/* ------------------------------ Secciones ------------------------------ */

export const ExecutiveSummary = ({ report }: { report: ProjectReport }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Gauge value={Number(report.progress_pct || 0)} label="Avance de obra" caption={report.construction_month ? `Mes ${report.construction_month}` : undefined} />
      <Gauge value={Number(report.sales_pct || 0)} label="Ventas colocadas" caption={`${report.units_sold ?? "—"} de ${report.units_total ?? "—"} unidades`} color="hsl(var(--chart-2))" />
      <Gauge value={Number(report.cost_executed_pct || 0)} label="Costos ejecutados" caption={report.cost_budget_total ? `Presupuesto ${usd(report.cost_budget_total)}` : undefined} color="hsl(var(--chart-3))" />
      <Gauge
        value={report.financing_total ? (Number(report.financing_disbursed) / Number(report.financing_total)) * 100 : 0}
        label="Financiamiento girado"
        caption={`${usd(report.financing_disbursed)} de ${usd(report.financing_total)}`}
        color="hsl(var(--chart-4))"
      />
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Stat
        label="Utilidad real"
        value={usd(report.profit_actual)}
        note={`Proforma ${usd(report.profit_proforma)}`}
        delta={Number(report.profit_actual) - Number(report.profit_proforma)}
        state={Number(report.profit_actual) >= Number(report.profit_proforma) ? "ok" : "bad"}
      />
      <Stat
        label="TIR proyecto"
        value={report.irr_actual != null ? fmtPct(Number(report.irr_actual), 0) : "—"}
        note={`Proforma ${report.irr_proforma != null ? fmtPct(Number(report.irr_proforma), 0) : "—"}`}
        delta={report.irr_actual != null && report.irr_proforma != null ? Number(report.irr_actual) - Number(report.irr_proforma) : null}
        state={Number(report.irr_actual) >= Number(report.irr_proforma) ? "ok" : "bad"}
      />
      <Stat
        label="COC proyecto"
        value={report.coc_actual != null ? fmtMultiple(Number(report.coc_actual)) : "—"}
        note={`Proforma ${report.coc_proforma != null ? fmtMultiple(Number(report.coc_proforma)) : "—"}`}
        delta={report.coc_actual != null && report.coc_proforma != null ? Number(report.coc_actual) - Number(report.coc_proforma) : null}
        state={Number(report.coc_actual) >= Number(report.coc_proforma) ? "ok" : "bad"}
      />
      <Stat
        label="Morosidad"
        value={pct(report.delinquency_pct, 2)}
        note="Normal ≤ 4% · Irregular > 4%"
        state={Number(report.delinquency_pct) <= 4 ? "ok" : "bad"}
      />
    </div>

    {report.status_note && (
      <p className="text-sm text-muted-foreground border-l-2 border-accent pl-3">{report.status_note}</p>
    )}
  </div>
);

export const ProfitabilityChart = ({ report }: { report: ProjectReport }) => {
  const data = [
    { name: "Utilidad", Proforma: Number(report.profit_proforma || 0), Real: Number(report.profit_actual || 0) },
  ];
  const units = [
    { name: "Vendidas", value: Number(report.units_sold || 0) },
    { name: "Disponibles", value: Math.max(Number(report.units_total || 0) - Number(report.units_sold || 0), 0) },
  ];
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Utilidad: proforma vs real</div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
              <RTooltip formatter={(v: any) => fmtUSD(Number(v))} {...chartTooltip} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Proforma" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Real" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Colocación de unidades</div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={units} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
                {units.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
              </Pie>
              <RTooltip {...chartTooltip} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export const ProfitabilityTable = ({ report }: { report: ProjectReport }) => (
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
          <td className={`py-2 text-right font-mono ${up ? "text-success" : "text-destructive"}`}>
            {diff == null ? "—" : `${up ? "+" : ""}${row.f(diff)}`}
          </td>
          <td className="py-2 text-right"><Chip text={up ? "Mayor a proforma" : "Menor a proforma"} /></td>
        </tr>
      );
    })}
  </Table>
);

export const SalesSections = ({ items }: { items: Record<string, ReportItem[]> }) => (
  <div className="space-y-6">
    {items.sales_by_tower?.length > 0 && (
      <Card title="Ventas y colocación" subtitle="Contratos de pre-venta por torre">
        <div className="h-56 w-full mb-5">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={items.sales_by_tower.map((r) => ({ name: r.label ?? "", Vendidas: Number(r.values?.units_sold || 0), Totales: Number(r.values?.units_total || 0) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <RTooltip {...chartTooltip} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Totales" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Vendidas" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
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

    {items.sales_detail?.length > 0 && (
      <Card title="Desempeño comercial: real vs proyectado">
        <Table head={["Indicador", "Real", "Proyectado", "Variación"]} min={600}>
          {items.sales_detail.map((r) => (
            <tr key={r.id} className="border-b border-border/50">
              <td className="py-2">{r.label}</td>
              <td className="py-2 text-right font-mono">{r.values.real}</td>
              <td className="py-2 text-right font-mono text-muted-foreground">{r.values.projected}</td>
              <td className={`py-2 text-right font-mono ${r.values.state === "alert" ? "text-destructive" : r.values.state === "warn" ? "text-warning" : "text-success"}`}>
                {r.values.variance}
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    )}

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
  </div>
);

export const ConstructionSections = ({ report, items }: { report: ProjectReport; items: Record<string, ReportItem[]> }) => (
  <div className="space-y-6">
    {items.cost_execution?.length > 0 && (
      <Card
        title="Ejecución de costos y gastos"
        subtitle={`Presupuesto total ${usd(report.cost_budget_total)} · costos ${pct(report.cost_executed_pct, 2)} · gastos ${pct(report.expense_executed_pct, 2)}`}
      >
        <div className="space-y-4">
          {items.cost_execution.map((r) => {
            const over = Number(r.values.pct) > 90;
            return (
              <div key={r.id} className={r.values.is_total ? "pt-3 border-t border-border" : ""}>
                <div className="flex flex-wrap justify-between gap-2 text-sm mb-1">
                  <span className={r.values.is_total ? "font-medium" : ""}>{r.label}</span>
                  <span className="font-mono text-muted-foreground">
                    {usd(r.values.executed)} de {usd(r.values.total)}
                    <span className={`ml-2 ${over ? "text-warning" : "text-success"}`}>{pct(r.values.pct, 2)}</span>
                  </span>
                </div>
                <Progress value={Math.min(Number(r.values.pct || 0), 100)} className="h-1.5" />
              </div>
            );
          })}
        </div>
      </Card>
    )}

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

    <Card title="Financiamiento bancario">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Monto pactado" value={usd(report.financing_total)} />
        <Stat
          label="Desembolsado"
          value={usd(report.financing_disbursed)}
          note={report.financing_total ? `${((Number(report.financing_disbursed) / Number(report.financing_total)) * 100).toFixed(0)}% del total` : undefined}
        />
        <Stat label="Avance de obra" value={pct(report.progress_pct, 0)} note="Referencia para el desembolso" />
        <Stat label="Tasa / plazo" value={report.interest_rate != null ? fmtPct(Number(report.interest_rate), 2) : "—"} note={report.loan_term ?? undefined} />
      </div>
    </Card>
  </div>
);

export const RiskSections = ({ items, share = 0 }: { items: Record<string, ReportItem[]>; share?: number }) => (
  <div className="space-y-6">
    {items.risks?.length > 0 && (
      <Card title="Matriz de riesgos y mitigaciones">
        <div className="space-y-3">
          {items.risks.map((r) => (
            <div key={r.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
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

    {items.scenarios?.length > 0 && (
      <Card title="Escenarios de sensibilidad" subtitle={share > 0 ? "Incluye tu utilidad prorrateada en cada escenario" : undefined}>
        <Table head={["Parámetro", "Pesimista", "Real", "Optimista"]} min={520}>
          {items.scenarios.map((r) => {
            const f = (v: any) =>
              r.values.format === "pct" ? fmtPct(Number(v), 0) : r.values.format === "multiple" ? fmtMultiple(Number(v)) : usd(v);
            return (
              <Fragment key={r.id}>
                <tr className="border-b border-border/50">
                  <td className="py-2">{r.label}</td>
                  <td className="py-2 text-right font-mono">{f(r.values.pessimistic)}</td>
                  <td className="py-2 text-right font-mono font-medium">{f(r.values.real)}</td>
                  <td className="py-2 text-right font-mono">{f(r.values.optimistic)}</td>
                </tr>
                {r.values.prorate && share > 0 && (
                  <tr className="border-b border-border/50 bg-muted/40">
                    <td className="py-2 pl-4 text-muted-foreground">Mi {String(r.label).toLowerCase()}</td>
                    <td className="py-2 text-right font-mono">{usd(Number(r.values.pessimistic) * share)}</td>
                    <td className="py-2 text-right font-mono font-medium">{usd(Number(r.values.real) * share)}</td>
                    <td className="py-2 text-right font-mono">{usd(Number(r.values.optimistic) * share)}</td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </Table>
      </Card>
    )}
  </div>
);

export const CashFlowSection = ({ items, share = 0 }: { items: Record<string, ReportItem[]>; share?: number }) => {
  const data = (items.cash_flow ?? []).map((r) => ({
    name: r.label ?? "",
    Ingresos: Number(r.values?.inflow || 0),
    Egresos: Number(r.values?.outflow || 0),
    Neto: Number(r.values?.net || 0),
    "Mi flujo": Number(r.values?.net || 0) * share,
  }));
  if (!data.length) return null;
  return (
    <div className="space-y-6">
      <Card title="Flujo de caja del proyecto" subtitle="Ingresos, egresos y flujo neto proyectado">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
              <RTooltip formatter={(v: any) => fmtUSD(Number(v))} {...chartTooltip} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Ingresos" fill="hsl(var(--chart-2))" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Egresos" fill="hsl(var(--chart-4))" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Neto" fill="hsl(var(--chart-1))" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {share > 0 && (
        <Card title="Mi flujo prorrateado" subtitle="Flujo neto del proyecto multiplicado por tu participación">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <RTooltip formatter={(v: any) => fmtUSD(Number(v))} {...chartTooltip} />
                <Area type="monotone" dataKey="Mi flujo" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1) / 0.25)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
};
