import { supabase } from "@/integrations/supabase/client";

export interface PortfolioData {
  investorIds: string[];
  totalInvested: number;
  totalDistributions: number;
  activeInvestments: number;
  projectsCount: number;
  investments: any[];
  distributions: any[];
  projects: any[];
}

export async function loadPortfolio(
  userId: string,
  opts?: { impersonateInvestorId?: string | null }
): Promise<PortfolioData> {
  let investorIds: string[];
  if (opts?.impersonateInvestorId) {
    investorIds = [opts.impersonateInvestorId];
  } else {
    const { data: investors } = await supabase
      .from("investors")
      .select("id")
      .eq("user_id", userId);
    investorIds = (investors ?? []).map((i: any) => i.id);
  }
  if (investorIds.length === 0) {
    return {
      investorIds: [],
      totalInvested: 0,
      totalDistributions: 0,
      activeInvestments: 0,
      projectsCount: 0,
      investments: [],
      distributions: [],
      projects: [],
    };
  }

  const { data: investments } = await supabase
    .from("investments")
    .select("*")
    .in("investor_id", investorIds);

  const investmentIds = (investments ?? []).map((i: any) => i.id);
  const projectIds = Array.from(new Set((investments ?? []).map((i: any) => i.project_id)));

  const [{ data: distributions }, { data: projects }] = await Promise.all([
    investmentIds.length
      ? supabase.from("distributions").select("*").in("investment_id", investmentIds)
      : Promise.resolve({ data: [] as any[] }),
    projectIds.length
      ? supabase.from("projects").select("*").in("id", projectIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const totalInvested = (investments ?? []).reduce((s: number, r: any) => s + Number(r.amount_invested || 0), 0);
  const totalDistributions = (distributions ?? []).reduce((s: number, r: any) => s + Number(r.amount || 0), 0);
  const activeInvestments = (investments ?? []).filter((i: any) => i.status === "active").length;

  return {
    investorIds,
    totalInvested,
    totalDistributions,
    activeInvestments,
    projectsCount: projectIds.length,
    investments: investments ?? [],
    distributions: distributions ?? [],
    projects: projects ?? [],
  };
}

export const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);

export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" });
