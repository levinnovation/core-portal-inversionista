import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { buildCashFlows, cashOnCash, equityMultiple, estimateNOI, fmtMultiple, fmtPct, xirr, type CashFlow } from "./finance";

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = (d: Date) => d.toISOString().slice(0, 10);

interface Args {
  investments: any[];
  distributions: any[];
  totalInvested: number;
  totalDistributions: number;
  investorName?: string;
}

// Brand palette (matches index.css HSL → RGB)
const NAVY: [number, number, number] = [27, 41, 73];          // hsl(220 50% 14%)
const NAVY_SOFT: [number, number, number] = [56, 78, 121];    // hsl(220 45% 24%)
const GOLD: [number, number, number] = [206, 154, 70];        // hsl(38 65% 52%)
const GOLD_SOFT: [number, number, number] = [243, 230, 200];  // hsl(38 60% 88%)
const TEXT_MUTED: [number, number, number] = [105, 116, 138];
const BG_SUBTLE: [number, number, number] = [247, 245, 240];
const BORDER: [number, number, number] = [222, 220, 215];

function computeAll({ investments, distributions, totalInvested, totalDistributions }: Args) {
  const flows = buildCashFlows(investments, distributions).sort((a, b) => a.date.getTime() - b.date.getTime());
  const irr = xirr(flows);
  const em = equityMultiple(totalInvested, totalDistributions);
  const coc = cashOnCash(totalInvested, distributions);
  const noi = estimateNOI(distributions);
  return { flows, irr, em, coc, noi };
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportMetricsCSV(args: Args) {
  const { flows, irr, em, coc, noi } = computeAll(args);
  const lines: string[] = [];
  lines.push("Métricas avanzadas");
  lines.push("Métrica,Valor");
  lines.push(`IRR (anualizada),${irr !== null ? fmtPct(irr) : "—"}`);
  lines.push(`Cash-on-Cash,${fmtPct(coc)}`);
  lines.push(`Equity Multiple,${fmtMultiple(em)}`);
  lines.push(`NOI (12m),${noi.toFixed(2)}`);
  lines.push(`Capital invertido,${args.totalInvested.toFixed(2)}`);
  lines.push(`Distribuciones totales,${args.totalDistributions.toFixed(2)}`);
  lines.push("");
  lines.push("Flujos de caja usados para IRR");
  lines.push("Fecha,Tipo,Monto (USD)");
  flows.forEach((f: CashFlow) => {
    lines.push(`${fmtDate(f.date)},${f.amount < 0 ? "Inversión" : "Distribución"},${f.amount.toFixed(2)}`);
  });
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `metricas-${fmtDate(new Date())}.csv`);
}

export function exportMetricsPDF(args: Args) {
  const { flows, irr, em, coc, noi } = computeAll(args);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;

  // ===== Header band (navy) =====
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 90, "F");
  // Gold accent stripe
  doc.setFillColor(...GOLD);
  doc.rect(0, 90, pageW, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(245, 240, 225);
  doc.text("Reporte de Inversión", margin, 45);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(220, 210, 185);
  doc.text("Core Real Estate · Métricas avanzadas de portafolio", margin, 64);

  doc.setFontSize(9);
  const rightMeta = `Generado: ${new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}`;
  doc.text(rightMeta, pageW - margin, 64, { align: "right" });
  if (args.investorName) {
    doc.setFont("helvetica", "bold");
    doc.text(args.investorName, pageW - margin, 45, { align: "right" });
  }

  // ===== KPI cards =====
  let y = 120;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...NAVY);
  doc.text("Indicadores clave", margin, y);
  y += 14;

  const kpis: Array<{ label: string; value: string }> = [
    { label: "IRR (anualizada)", value: irr !== null ? fmtPct(irr) : "—" },
    { label: "Equity Multiple", value: fmtMultiple(em) },
    { label: "Cash-on-Cash", value: fmtPct(coc) },
    { label: "NOI estimado (12m)", value: fmtUSD(noi) },
    { label: "Capital invertido", value: fmtUSD(args.totalInvested) },
    { label: "Distribuciones", value: fmtUSD(args.totalDistributions) },
  ];

  const cardW = (pageW - margin * 2 - 16) / 3;
  const cardH = 62;
  kpis.forEach((kpi, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = margin + col * (cardW + 8);
    const cy = y + row * (cardH + 8);

    // Card bg
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, cy, cardW, cardH, 4, 4, "FD");

    // Gold left accent
    doc.setFillColor(...GOLD);
    doc.rect(x, cy, 3, cardH, "F");

    // Label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(kpi.label.toUpperCase(), x + 12, cy + 18, { charSpace: 0.5 });

    // Value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...NAVY);
    doc.text(kpi.value, x + 12, cy + 42);
  });

  y += Math.ceil(kpis.length / 3) * (cardH + 8) + 18;

  // ===== Methodology note =====
  doc.setFillColor(...BG_SUBTLE);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(margin, y, pageW - margin * 2, 50, 4, 4, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text("Metodología", margin + 12, y + 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_MUTED);
  const methodTxt = doc.splitTextToSize(
    "IRR calculado con XIRR (Newton-Raphson) sobre flujos reales. Cash-on-Cash usa distribuciones de los últimos 12 meses sobre capital invertido. Equity Multiple es el cociente entre distribuciones acumuladas y capital aportado.",
    pageW - margin * 2 - 24,
  );
  doc.text(methodTxt, margin + 12, y + 30);
  y += 60;

  // ===== Cash flow table =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...NAVY);
  doc.text("Flujos de caja", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(`${flows.length} movimientos registrados`, pageW - margin, y, { align: "right" });
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["Fecha", "Tipo", "Monto (USD)"]],
    body: flows.map((f) => [
      fmtDate(f.date),
      f.amount < 0 ? "Inversión (salida)" : "Distribución (entrada)",
      fmtUSD(f.amount),
    ]),
    theme: "grid",
    margin: { left: margin, right: margin },
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 6,
      lineColor: BORDER,
      lineWidth: 0.3,
      textColor: [40, 50, 70],
    },
    headStyles: {
      fillColor: NAVY,
      textColor: [245, 240, 225],
      fontStyle: "bold",
      fontSize: 8.5,
      cellPadding: 7,
      halign: "left",
    },
    alternateRowStyles: { fillColor: BG_SUBTLE },
    columnStyles: {
      0: { cellWidth: 90 },
      2: { halign: "right", fontStyle: "bold" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 2) {
        const raw = flows[data.row.index]?.amount ?? 0;
        data.cell.styles.textColor = raw < 0 ? [156, 64, 64] : [40, 110, 78];
      }
    },
  });

  // ===== Footer on every page =====
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

  doc.save(`reporte-inversion-${fmtDate(new Date())}.pdf`);
}
