import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage } from "@/components/admin/AdminLayout";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { TrendingUp, Wallet, Receipt, Target, AlertTriangle, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);

const COLORS = ["hsl(var(--accent))", "hsl(var(--primary))", "#8B6F3D", "#A8B5C7", "#D4AF7A", "#5A6B85"];

interface Data {
  projects: any[];
  investments: any[];
  distributions: any[];
  sales: any[];
  payments: any[];
  units: any[];
}

const Reports = () => {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    (async () => {
      const [pr, inv, dist, sa, pay, un] = await Promise.all([
        supabase.from("projects").select("*"),
        supabase.from("investments").select("*"),
        supabase.from("distributions").select("*"),
        supabase.from("sales").select("*"),
        supabase.from("payments").select("*"),
        supabase.from("units").select("*"),
      ]);
      setData({
        projects: pr.data ?? [],
        investments: inv.data ?? [],
        distributions: dist.data ?? [],
        sales: sa.data ?? [],
        payments: pay.data ?? [],
        units: un.data ?? [],
      });
    })();
  }, []);

  if (!data) {
    return (
      <AdminPage title="Reportes & Analytics">
        <div className="text-muted-foreground">Cargando analítica…</div>
      </AdminPage>
    );
  }

  // ===== KPIs globales =====
  const totalCapital = data.investments.reduce((s, i) => s + Number(i.amount_invested || 0), 0);
  const totalDistributed = data.distributions.reduce((s, d) => s + Number(d.amount || 0), 0);
  const globalROI = totalCapital > 0 ? (totalDistributed / totalCapital) * 100 : 0;

  const totalSales = data.sales.reduce((s, x) => s + Number(x.price_agreed || 0), 0);
  const paidPayments = data.payments.filter((p) => p.status === "paid");
  const pendingPayments = data.payments.filter((p) => p.status !== "paid");
  const overduePayments = data.payments.filter(
    (p) => p.status !== "paid" && new Date(p.due_date) < new Date(),
  );
  const totalCollected = paidPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const totalPending = pendingPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const collectionRate =
    paidPayments.length + pendingPayments.length > 0
      ? (paidPayments.length / (paidPayments.length + pendingPayments.length)) * 100
      : 0;

  // ===== ROI por proyecto =====
  const roiByProject = data.projects.map((p) => {
    const projInv = data.investments.filter((i) => i.project_id === p.id);
    const invIds = projInv.map((i) => i.id);
    const projDist = data.distributions.filter((d) => invIds.includes(d.investment_id));
    const cap = projInv.reduce((s, i) => s + Number(i.amount_invested), 0);
    const dist = projDist.reduce((s, d) => s + Number(d.amount), 0);
    return {
      name: p.name,
      capital: cap,
      distribuido: dist,
      roi: cap > 0 ? (dist / cap) * 100 : 0,
    };
  }).filter((p) => p.capital > 0);

  // ===== Capital por proyecto (pie) =====
  const capitalByProject = roiByProject.map((p) => ({ name: p.name, value: p.capital }));

  // ===== Pipeline de ventas =====
  const unitsByStatus = data.units.reduce<Record<string, number>>((acc, u) => {
    acc[u.status] = (acc[u.status] ?? 0) + 1;
    return acc;
  }, {});
  const pipelineData = Object.entries(unitsByStatus).map(([status, count]) => ({
    status: status === "available" ? "Disponible" : status === "reserved" ? "Reservada" : status === "sold" ? "Vendida" : status,
    count,
  }));

  // ===== Cobranza mensual =====
  const monthlyCollection = new Map<string, { mes: string; cobrado: number; pendiente: number }>();
  data.payments.forEach((p) => {
    const d = new Date(p.due_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("es-CO", { month: "short", year: "2-digit" });
    const e = monthlyCollection.get(key) ?? { mes: label, cobrado: 0, pendiente: 0 };
    if (p.status === "paid") e.cobrado += Number(p.amount);
    else e.pendiente += Number(p.amount);
    monthlyCollection.set(key, e);
  });
  const collectionTrend = Array.from(monthlyCollection.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);

  // ===== PDF Export =====
  const exportReportPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 40;

    // Brand palette
    const NAVY: [number, number, number] = [27, 41, 73];
    const GOLD: [number, number, number] = [206, 154, 70];
    const TEXT_MUTED: [number, number, number] = [105, 116, 138];
    const BG_SUBTLE: [number, number, number] = [247, 245, 240];
    const BORDER: [number, number, number] = [222, 220, 215];

    // Header
    doc.setFillColor(...NAVY);
    doc.rect(0, 0, pageW, 90, "F");
    doc.setFillColor(...GOLD);
    doc.rect(0, 90, pageW, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(245, 240, 225);
    doc.text("Reporte Ejecutivo", margin, 45);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(220, 210, 185);
    doc.text("Core Real Estate · Analítica consolidada", margin, 64);
    doc.setFontSize(9);
    doc.text(`Generado: ${new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}`, pageW - margin, 64, { align: "right" });

    // KPI cards
    let y = 120;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...NAVY);
    doc.text("Indicadores ejecutivos", margin, y);
    y += 14;

    const kpis = [
      { label: "Capital comprometido", value: fmtUSD(totalCapital) },
      { label: "Distribuido a inversionistas", value: fmtUSD(totalDistributed) },
      { label: "ROI global", value: `${globalROI.toFixed(1)}%` },
      { label: "Ventas totales", value: fmtUSD(totalSales) },
      { label: "Cobrado", value: fmtUSD(totalCollected) },
      { label: "Tasa de pagos al día", value: `${collectionRate.toFixed(1)}%` },
    ];
    const cardW = (pageW - margin * 2 - 16) / 3;
    const cardH = 62;
    kpis.forEach((kpi, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = margin + col * (cardW + 8);
      const cy = y + row * (cardH + 8);
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.5);
      doc.roundedRect(x, cy, cardW, cardH, 4, 4, "FD");
      doc.setFillColor(...GOLD);
      doc.rect(x, cy, 3, cardH, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...TEXT_MUTED);
      doc.text(kpi.label.toUpperCase(), x + 12, cy + 18);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(...NAVY);
      doc.text(kpi.value, x + 12, cy + 42);
    });
    y += Math.ceil(kpis.length / 3) * (cardH + 8) + 18;

    // ROI por proyecto
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...NAVY);
    doc.text("ROI por proyecto", margin, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [["Proyecto", "Capital", "Distribuido", "ROI"]],
      body: roiByProject.map((p) => [p.name, fmtUSD(p.capital), fmtUSD(p.distribuido), `${p.roi.toFixed(1)}%`]),
      theme: "grid",
      margin: { left: margin, right: margin },
      styles: { font: "helvetica", fontSize: 9, cellPadding: 6, lineColor: BORDER, lineWidth: 0.3 },
      headStyles: { fillColor: NAVY, textColor: [245, 240, 225], fontStyle: "bold", fontSize: 8.5 },
      alternateRowStyles: { fillColor: BG_SUBTLE },
      columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right", fontStyle: "bold" } },
    });

    let afterY = (doc as any).lastAutoTable.finalY + 18;

    // Pipeline de ventas
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...NAVY);
    doc.text("Pipeline de unidades", margin, afterY);
    afterY += 8;
    autoTable(doc, {
      startY: afterY,
      head: [["Estado", "Unidades"]],
      body: pipelineData.map((p) => [p.status, p.count.toString()]),
      theme: "grid",
      margin: { left: margin, right: margin },
      styles: { font: "helvetica", fontSize: 9, cellPadding: 6, lineColor: BORDER, lineWidth: 0.3 },
      headStyles: { fillColor: NAVY, textColor: [245, 240, 225], fontStyle: "bold", fontSize: 8.5 },
      alternateRowStyles: { fillColor: BG_SUBTLE },
      columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.4);
      doc.line(margin, pageH - 32, pageW - margin, pageH - 32);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...TEXT_MUTED);
      doc.text("Core Real Estate · Documento confidencial", margin, pageH - 18);
      doc.text(`Página ${i} de ${pageCount}`, pageW - margin, pageH - 18, { align: "right" });
    }

    doc.save(`reporte-ejecutivo-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const kpis = [
    { label: "Capital comprometido", value: fmtUSD(totalCapital), icon: <Wallet className="h-5 w-5" /> },
    { label: "Distribuido", value: fmtUSD(totalDistributed), icon: <TrendingUp className="h-5 w-5" /> },
    { label: "ROI global", value: `${globalROI.toFixed(1)}%`, icon: <Target className="h-5 w-5" /> },
    { label: "Ventas totales", value: fmtUSD(totalSales), icon: <Receipt className="h-5 w-5" /> },
    { label: "Cobrado", value: fmtUSD(totalCollected), icon: <Receipt className="h-5 w-5" /> },
    { label: "Tasa pagos al día", value: `${collectionRate.toFixed(1)}%`, icon: <Target className="h-5 w-5" /> },
  ];

  return (
    <AdminPage title="Reportes & Analytics">
      <div className="space-y-8">
        <div className="flex justify-end">
          <Button onClick={exportReportPDF} variant="default">
            <FileDown className="h-4 w-4 mr-2" /> Exportar PDF
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-card border border-border rounded-lg p-5 shadow-card min-w-0">
              <div className="text-accent mb-3">{kpi.icon}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1 truncate">{kpi.label}</div>
              <div className="font-display text-xl xl:text-2xl text-foreground truncate" title={kpi.value}>{kpi.value}</div>
            </div>
          ))}
        </div>

        {overduePayments.length > 0 && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <div className="text-sm">
              <strong className="text-destructive">{overduePayments.length} pagos vencidos</strong>
              <span className="text-muted-foreground"> · {fmtUSD(overduePayments.reduce((s, p) => s + Number(p.amount), 0))} en mora</span>
            </div>
          </div>
        )}

        {/* ROI por proyecto */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6 shadow-card">
            <h3 className="font-display text-xl mb-1">ROI por proyecto</h3>
            <p className="text-sm text-muted-foreground mb-6">Capital invertido vs distribuido a inversionistas.</p>
            {roiByProject.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roiByProject} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => `$${(v / 1e6).toFixed(0)}M`} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                    formatter={(v: number) => fmtUSD(v)}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="capital" fill="hsl(var(--primary))" name="Capital" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="distribuido" fill="hsl(var(--accent))" name="Distribuido" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">Sin datos.</div>
            )}
          </div>

          <div className="bg-card border border-border rounded-lg p-6 shadow-card">
            <h3 className="font-display text-xl mb-1">Capital por proyecto</h3>
            <p className="text-sm text-muted-foreground mb-6">Distribución del portafolio.</p>
            {capitalByProject.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <Pie data={capitalByProject} dataKey="value" nameKey="name" cx="50%" cy="42%" innerRadius="42%" outerRadius="72%" paddingAngle={2}>
                    {capitalByProject.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmtUSD(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} verticalAlign="bottom" height={36} iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">Sin datos.</div>
            )}
          </div>
        </div>

        {/* Cobranza mensual */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-card">
          <h3 className="font-display text-xl mb-1">Evolución de cobranza</h3>
          <p className="text-sm text-muted-foreground mb-6">Cobrado vs pendiente por mes según fechas de vencimiento.</p>
          {collectionTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={collectionTrend} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => `$${(v / 1e6).toFixed(1)}M`} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  formatter={(v: number) => fmtUSD(v)}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="cobrado" stroke="hsl(152 50% 38%)" strokeWidth={2.5} name="Cobrado" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="pendiente" stroke="hsl(var(--accent))" strokeWidth={2.5} name="Pendiente" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">Sin pagos registrados.</div>
          )}
        </div>

        {/* Pipeline de ventas */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-6 shadow-card">
            <h3 className="font-display text-xl mb-1">Pipeline de unidades</h3>
            <p className="text-sm text-muted-foreground mb-6">Estado actual del inventario.</p>
            {pipelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={pipelineData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="status" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Unidades" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">Sin unidades.</div>
            )}
          </div>

          <div className="bg-card border border-border rounded-lg p-6 shadow-card">
            <h3 className="font-display text-xl mb-1">Resumen de cartera</h3>
            <p className="text-sm text-muted-foreground mb-6">Estado de pagos a la fecha.</p>
            <div className="space-y-3">
              {[
                { label: "Cobrado", value: totalCollected, count: paidPayments.length, color: "bg-emerald-500" },
                { label: "Pendiente", value: totalPending - overduePayments.reduce((s, p) => s + Number(p.amount), 0), count: pendingPayments.length - overduePayments.length, color: "bg-accent" },
                { label: "Vencido", value: overduePayments.reduce((s, p) => s + Number(p.amount), 0), count: overduePayments.length, color: "bg-destructive" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between p-4 rounded-md bg-subtle border border-border">
                  <div className="flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${row.color}`} />
                    <div>
                      <div className="font-medium text-sm">{row.label}</div>
                      <div className="text-xs text-muted-foreground">{row.count} cuotas</div>
                    </div>
                  </div>
                  <div className="font-mono font-medium">{fmtUSD(row.value)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabla detalle ROI */}
        <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="font-display text-xl">Desempeño por proyecto</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead className="bg-subtle">
                <tr className="text-left text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Proyecto</th>
                  <th className="px-6 py-3 font-medium text-right">Capital</th>
                  <th className="px-6 py-3 font-medium text-right">Distribuido</th>
                  <th className="px-6 py-3 font-medium text-right">ROI</th>
                </tr>
              </thead>
              <tbody>
                {roiByProject.map((p) => (
                  <tr key={p.name} className="border-t border-border">
                    <td className="px-6 py-3 font-medium">{p.name}</td>
                    <td className="px-6 py-3 text-right font-mono">{fmtUSD(p.capital)}</td>
                    <td className="px-6 py-3 text-right font-mono">{fmtUSD(p.distribuido)}</td>
                    <td className="px-6 py-3 text-right font-mono text-accent font-medium">{p.roi.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminPage>
  );
};

export default Reports;
