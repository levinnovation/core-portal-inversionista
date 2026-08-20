import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useImpersonation } from "@/hooks/useImpersonation";
import { loadPortfolio, fmtUSD, fmtDate } from "@/lib/investor";

const InvestorDistributions = () => {
  const { user } = useAuth();
  const { target } = useImpersonation();
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    if (!user) return;
    loadPortfolio(user.id, { impersonateInvestorId: target?.kind === "investor" ? target.recordId : null }).then(setData);
  }, [user, target]);

  if (!data) return <div className="text-muted-foreground">Cargando…</div>;

  const sorted = [...data.distributions].sort(
    (a: any, b: any) => new Date(b.distribution_date).getTime() - new Date(a.distribution_date).getTime()
  );
  const total = sorted.reduce((s: number, d: any) => s + Number(d.amount), 0);

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Total recibido</div>
        <div className="font-display text-3xl sm:text-4xl truncate">{fmtUSD(total)}</div>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="font-display text-xl">Histórico de distribuciones</h3>
        </div>
        {sorted.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">Aún no hay distribuciones registradas.</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-subtle">
              <tr className="text-left text-muted-foreground">
                <th className="px-6 py-3 font-medium">Fecha</th>
                <th className="px-6 py-3 font-medium">Proyecto</th>
                <th className="px-6 py-3 font-medium">Tipo</th>
                <th className="px-6 py-3 font-medium">Descripción</th>
                <th className="px-6 py-3 font-medium text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((d: any) => {
                const inv = data.investments.find((i: any) => i.id === d.investment_id);
                const pj = data.projects.find((p: any) => p.id === inv?.project_id);
                return (
                  <tr key={d.id} className="border-t border-border">
                    <td className="px-6 py-3">{fmtDate(d.distribution_date)}</td>
                    <td className="px-6 py-3 font-medium">{pj?.name ?? "—"}</td>
                    <td className="px-6 py-3 capitalize">{d.type.replace("_", " ")}</td>
                    <td className="px-6 py-3 text-muted-foreground">{d.description ?? "—"}</td>
                    <td className="px-6 py-3 text-right font-mono text-accent">{fmtUSD(Number(d.amount))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestorDistributions;
