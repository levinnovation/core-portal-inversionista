// Financial metrics: IRR, Cash-on-Cash Return, Equity Multiple, NOI

export interface CashFlow {
  date: Date;
  amount: number; // negative = invested (outflow), positive = distribution (inflow)
  label?: string;
}


/**
 * Compute XIRR (annualized IRR for irregular cash flows) using Newton-Raphson,
 * with bisection fallback. Returns annual rate (e.g. 0.12 = 12%) or null if it
 * cannot converge / inputs are invalid.
 */
export function xirr(flows: CashFlow[], guess = 0.1): number | null {
  if (!flows || flows.length < 2) return null;
  const hasPos = flows.some((f) => f.amount > 0);
  const hasNeg = flows.some((f) => f.amount < 0);
  if (!hasPos || !hasNeg) return null;

  const sorted = [...flows].sort((a, b) => a.date.getTime() - b.date.getTime());
  const t0 = sorted[0].date.getTime();
  const years = sorted.map((f) => (f.date.getTime() - t0) / (365 * 24 * 3600 * 1000));
  const amounts = sorted.map((f) => f.amount);

  const npv = (rate: number) => {
    if (rate <= -1) return Number.NaN;
    let s = 0;
    for (let i = 0; i < amounts.length; i++) s += amounts[i] / Math.pow(1 + rate, years[i]);
    return s;
  };
  const dnpv = (rate: number) => {
    let s = 0;
    for (let i = 0; i < amounts.length; i++) s += (-years[i] * amounts[i]) / Math.pow(1 + rate, years[i] + 1);
    return s;
  };

  // Newton-Raphson
  let rate = guess;
  for (let i = 0; i < 80; i++) {
    const v = npv(rate);
    if (!isFinite(v)) break;
    if (Math.abs(v) < 1e-7) return rate;
    const d = dnpv(rate);
    if (!isFinite(d) || d === 0) break;
    const next = rate - v / d;
    if (!isFinite(next)) break;
    if (Math.abs(next - rate) < 1e-9) return next;
    rate = next;
    if (rate <= -0.999) rate = -0.99;
  }

  // Bisection fallback
  let lo = -0.9999;
  let hi = 10;
  let vlo = npv(lo);
  let vhi = npv(hi);
  if (!isFinite(vlo) || !isFinite(vhi) || vlo * vhi > 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const vm = npv(mid);
    if (!isFinite(vm)) return null;
    if (Math.abs(vm) < 1e-7) return mid;
    if (vlo * vm < 0) {
      hi = mid;
      vhi = vm;
    } else {
      lo = mid;
      vlo = vm;
    }
  }
  return (lo + hi) / 2;
}

/** Equity Multiple = total distributions / total invested */
export function equityMultiple(invested: number, distributions: number): number {
  if (!invested || invested <= 0) return 0;
  return distributions / invested;
}

/**
 * Cash-on-Cash Return (annualized).
 * Uses last 12 months of distributions ÷ total invested capital.
 */
export function cashOnCash(invested: number, distributions: { amount: number; distribution_date: string }[]): number {
  if (!invested || invested <= 0) return 0;
  const cutoff = Date.now() - 365 * 24 * 3600 * 1000;
  const last12 = distributions
    .filter((d) => new Date(d.distribution_date).getTime() >= cutoff)
    .reduce((s, d) => s + Number(d.amount || 0), 0);
  return last12 / invested;
}

/**
 * NOI estimate from distributions classified as 'noi' / 'preferred_return' / 'cash_flow'.
 * Falls back to all non-capital distributions in the last 12 months.
 */
export function estimateNOI(distributions: any[]): number {
  const cutoff = Date.now() - 365 * 24 * 3600 * 1000;
  return distributions
    .filter((d) => new Date(d.distribution_date).getTime() >= cutoff)
    .filter((d) => {
      const t = String(d.type || "").toLowerCase();
      return t !== "capital_return" && t !== "return_of_capital";
    })
    .reduce((s, d) => s + Number(d.amount || 0), 0);
}

/**
 * Capital aún no devuelto: capital aportado menos las distribuciones
 * clasificadas como retorno de capital. Se usa como valor residual
 * (a costo, sin apreciación) para el cálculo de IRR de un portafolio vivo.
 */
export function unreturnedCapital(investments: any[], distributions: any[]): number {
  const invested = investments
    .filter((i) => String(i.status ?? "active").toLowerCase() !== "exited")
    .reduce((s, i) => s + Math.abs(Number(i.amount_invested || 0)), 0);
  const returned = distributions
    .filter((d) => String(d.type || "").toLowerCase() === "return_of_capital")
    .reduce((s, d) => s + Math.abs(Number(d.amount || 0)), 0);
  return Math.max(invested - returned, 0);
}

/**
 * Build cash flows array from investments + distributions (investor perspective).
 * Por defecto agrega un flujo residual a la fecha de hoy con el capital aún no
 * devuelto, para que la IRR de un portafolio en curso no se lea como pérdida total.
 */
export function buildCashFlows(
  investments: any[],
  distributions: any[],
  opts?: { includeResidual?: boolean; asOf?: Date }
): CashFlow[] {
  const flows: CashFlow[] = [];
  investments.forEach((inv) => {
    if (inv.investment_date && inv.amount_invested) {
      flows.push({
        date: new Date(inv.investment_date),
        amount: -Math.abs(Number(inv.amount_invested)),
        label: "Aporte de capital",
      });
    }
  });
  distributions.forEach((d) => {
    if (d.distribution_date && d.amount) {
      flows.push({
        date: new Date(d.distribution_date),
        amount: Math.abs(Number(d.amount)),
        label: "Distribución",
      });
    }
  });
  if (opts?.includeResidual !== false) {
    const residual = unreturnedCapital(investments, distributions);
    if (residual > 0 && flows.length > 0) {
      flows.push({
        date: opts?.asOf ?? new Date(),
        amount: residual,
        label: "Valor residual (capital no devuelto, a costo)",
      });
    }
  }
  return flows;
}


export const fmtPct = (n: number, digits = 1) =>
  isFinite(n) ? `${(n * 100).toFixed(digits)}%` : "—";
export const fmtMultiple = (n: number) => (isFinite(n) && n > 0 ? `${n.toFixed(2)}x` : "—");
