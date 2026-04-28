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
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Reporte de métricas de inversión", 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 25);
  if (args.investorName) doc.text(`Inversionista: ${args.investorName}`, 14, 30);

  autoTable(doc, {
    startY: 38,
    head: [["Métrica", "Valor"]],
    body: [
      ["IRR (anualizada)", irr !== null ? fmtPct(irr) : "—"],
      ["Cash-on-Cash (12m)", fmtPct(coc)],
      ["Equity Multiple", fmtMultiple(em)],
      ["NOI estimado (12m)", fmtUSD(noi)],
      ["Capital invertido", fmtUSD(args.totalInvested)],
      ["Distribuciones totales", fmtUSD(args.totalDistributions)],
    ],
    theme: "striped",
    headStyles: { fillColor: [30, 30, 30] },
  });

  const afterY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(13);
  doc.setTextColor(0);
  doc.text("Flujos de caja utilizados para el cálculo de IRR", 14, afterY);

  autoTable(doc, {
    startY: afterY + 4,
    head: [["Fecha", "Tipo", "Monto (USD)"]],
    body: flows.map((f) => [
      fmtDate(f.date),
      f.amount < 0 ? "Inversión (salida)" : "Distribución (entrada)",
      fmtUSD(f.amount),
    ]),
    theme: "grid",
    headStyles: { fillColor: [30, 30, 30] },
    columnStyles: { 2: { halign: "right" } },
  });

  doc.save(`metricas-${fmtDate(new Date())}.pdf`);
}
