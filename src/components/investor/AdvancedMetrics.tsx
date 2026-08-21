import { Activity, Percent, Layers, DollarSign, Info, FileDown, FileText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { buildCashFlows, cashOnCash, equityMultiple, estimateNOI, fmtMultiple, fmtPct, xirr } from "@/lib/finance";
import { fmtUSD } from "@/lib/investor";
import { exportMetricsCSV, exportMetricsPDF } from "@/lib/exportMetrics";

interface Props {
  investments: any[];
  distributions: any[];
  totalInvested: number;
  totalDistributions: number;
}

export const AdvancedMetrics = ({ investments, distributions, totalInvested, totalDistributions }: Props) => {
  const flows = buildCashFlows(investments, distributions);
  const irr = xirr(flows);
  const em = equityMultiple(totalInvested, totalDistributions);
  const coc = cashOnCash(totalInvested, distributions);
  const noi = estimateNOI(distributions);

  const items = [
    {
      label: "IRR (anualizada)",
      value: irr !== null ? fmtPct(irr) : "—",
      icon: <Activity className="h-5 w-5" />,
      help: "Tasa interna de retorno anualizada calculada con flujos reales (XIRR, Newton-Raphson). En inversiones vigentes incluye el capital no devuelto valorado a costo.",
    },
    {
      label: "Cash-on-Cash",
      value: fmtPct(coc),
      icon: <Percent className="h-5 w-5" />,
      help: "Distribuciones de los últimos 12 meses ÷ capital invertido.",
    },
    {
      label: "Equity Multiple",
      value: fmtMultiple(em),
      icon: <Layers className="h-5 w-5" />,
      help: "Total distribuido ÷ capital invertido. >1.0x = retorno positivo.",
    },
    {
      label: "NOI (12m)",
      value: fmtUSD(noi),
      icon: <DollarSign className="h-5 w-5" />,
      help: "Ingreso operativo neto estimado a partir de distribuciones recurrentes (excluye retorno de capital).",
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-display text-xl">Métricas avanzadas</h3>
          <span className="text-xs text-muted-foreground">Calculadas sobre tus inversiones y distribuciones reales</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportMetricsCSV({ investments, distributions, totalInvested, totalDistributions })}
          >
            <FileDown className="h-4 w-4 mr-1.5" /> CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportMetricsPDF({ investments, distributions, totalInvested, totalDistributions })}
          >
            <FileText className="h-4 w-4 mr-1.5" /> PDF
          </Button>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TooltipProvider>
          {items.map((it) => (
            <div key={it.label} className="bg-card border border-border rounded-lg p-5 shadow-card min-w-0">
              <div className="flex items-center justify-between mb-3 text-accent">
                {it.icon}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-muted-foreground hover:text-foreground">
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[220px] text-xs">
                    {it.help}
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1 truncate">{it.label}</div>
              <div className="font-display text-2xl text-foreground truncate" title={it.value}>{it.value}</div>
            </div>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
};
