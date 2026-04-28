import { supabase } from "@/integrations/supabase/client";

export interface CustomerData {
  customer: any | null;
  sales: any[];
  units: any[];
  projects: any[];
  payments: any[];
  phases: any[];
}

export async function loadCustomerData(userId: string): Promise<CustomerData> {
  const { data: customers } = await supabase.from("customers").select("*").eq("user_id", userId);
  const customer = customers?.[0] ?? null;
  if (!customer) {
    return { customer: null, sales: [], units: [], projects: [], payments: [], phases: [] };
  }

  const { data: sales } = await supabase.from("sales").select("*").eq("customer_id", customer.id);
  const unitIds = (sales ?? []).map((s: any) => s.unit_id).filter(Boolean);
  const saleIds = (sales ?? []).map((s: any) => s.id);

  const [{ data: units }, { data: payments }] = await Promise.all([
    unitIds.length ? supabase.from("units").select("*").in("id", unitIds) : Promise.resolve({ data: [] as any[] }),
    saleIds.length ? supabase.from("payments").select("*").in("sale_id", saleIds) : Promise.resolve({ data: [] as any[] }),
  ]);

  const projectIds = Array.from(new Set((units ?? []).map((u: any) => u.project_id)));
  const [{ data: projects }, { data: phases }] = await Promise.all([
    projectIds.length ? supabase.from("projects").select("*").in("id", projectIds) : Promise.resolve({ data: [] as any[] }),
    projectIds.length
      ? supabase.from("project_phases").select("*").in("project_id", projectIds).order("order_index")
      : Promise.resolve({ data: [] as any[] }),
  ]);

  return {
    customer,
    sales: sales ?? [],
    units: units ?? [],
    projects: projects ?? [],
    payments: payments ?? [],
    phases: phases ?? [],
  };
}

export const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);

export const fmtDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" }) : "—";

export function paymentStatusLabel(p: any): { label: string; color: string } {
  if (p.status === "paid") return { label: "Pagado", color: "bg-emerald-500/10 text-emerald-600" };
  if (p.status === "overdue") return { label: "Vencido", color: "bg-destructive/10 text-destructive" };
  const due = new Date(p.due_date);
  const today = new Date();
  if (due < today && p.status === "pending") return { label: "Vencido", color: "bg-destructive/10 text-destructive" };
  return { label: "Pendiente", color: "bg-amber-500/10 text-amber-600" };
}
