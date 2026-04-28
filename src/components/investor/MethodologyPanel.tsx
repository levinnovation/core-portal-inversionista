import { useState } from "react";
import { ChevronDown, BookOpen } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface MethodItem {
  title: string;
  formula: string;
  description: string;
  assumptions: string[];
}

const items: MethodItem[] = [
  {
    title: "IRR (XIRR anualizada)",
    formula: "0 = Σ  CFᵢ / (1 + r)^((dᵢ − d₀) / 365)",
    description:
      "Tasa interna de retorno para flujos en fechas irregulares. Se resuelve r mediante Newton-Raphson (hasta 80 iteraciones, tolerancia 1e-7) con respaldo de bisección entre −0.9999 y 10.",
    assumptions: [
      "Inversiones se registran como flujos negativos en investment_date.",
      "Distribuciones se registran como flujos positivos en distribution_date.",
      "Año base de 365 días; no se reinvierten distribuciones.",
      "Requiere al menos un flujo positivo y uno negativo; si no converge devuelve “—”.",
    ],
  },
  {
    title: "Cash-on-Cash Return",
    formula: "CoC = Σ distribuciones (últimos 12 meses) / capital invertido total",
    description:
      "Mide el rendimiento en efectivo anualizado sobre el capital aportado. Considera solo distribuciones recibidas en los últimos 365 días.",
    assumptions: [
      "Capital invertido = suma de amount_invested de todas tus inversiones activas.",
      "Ventana de 12 meses contada desde hoy hacia atrás.",
      "Incluye todos los tipos de distribución (preferred_return, cash_flow, capital_return, etc.).",
    ],
  },
  {
    title: "Equity Multiple",
    formula: "EM = distribuciones totales / capital invertido total",
    description:
      "Múltiplo de capital recibido sobre lo aportado. >1.0x indica retorno positivo acumulado (sin descontar valor del dinero en el tiempo).",
    assumptions: [
      "No anualizado; es una razón acumulada desde el inicio.",
      "No incluye valor residual de equity todavía no distribuido.",
      "Si capital invertido = 0, el resultado se muestra como “—”.",
    ],
  },
  {
    title: "NOI estimado (12m)",
    formula: "NOI ≈ Σ distribuciones (12m) excluyendo retorno de capital",
    description:
      "Proxy de Net Operating Income basado en distribuciones recurrentes recibidas en el último año, excluyendo aquellas marcadas como devolución de capital.",
    assumptions: [
      "Excluye type ∈ { capital_return, return_of_capital }.",
      "Es una estimación a nivel inversionista, no a nivel proyecto bruto.",
      "No descuenta gastos de capex o reservas; refleja flujo neto distribuido.",
    ],
  },
];

export const MethodologyPanel = () => {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="bg-card border border-border rounded-lg shadow-card">
        <CollapsibleTrigger className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors rounded-lg">
          <div className="flex items-center gap-3">
            <div className="text-accent">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg leading-tight">Metodología de cálculo</h3>
              <p className="text-xs text-muted-foreground">
                Fórmulas y supuestos exactos detrás de IRR, Cash-on-Cash, Equity Multiple y NOI.
              </p>
            </div>
          </div>
          <ChevronDown
            className={`h-5 w-5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-5 pb-5 pt-1 grid md:grid-cols-2 gap-4">
            {items.map((it) => (
              <div key={it.title} className="border border-border/70 rounded-md p-4 bg-background/40">
                <div className="font-display text-base mb-2">{it.title}</div>
                <div className="font-mono text-xs bg-muted/50 border border-border/50 rounded px-2.5 py-2 mb-3 overflow-x-auto">
                  {it.formula}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{it.description}</p>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Supuestos</div>
                <ul className="text-sm space-y-1 list-disc list-inside text-foreground/80">
                  {it.assumptions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="px-5 pb-5 -mt-1">
            <p className="text-xs text-muted-foreground">
              Las métricas se recalculan en tiempo real a partir de tus registros de inversiones y distribuciones. Para auditar
              los flujos exactos usados en IRR, exporta el reporte en CSV o PDF desde la sección de métricas avanzadas.
            </p>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
