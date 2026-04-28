import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { loadPortfolio, fmtUSD, PortfolioData } from "@/lib/investor";
import { TrendingUp, Wallet, Building2, PieChart as PieIcon } from "lucide-react";
import { AdvancedMetrics } from "@/components/investor/AdvancedMetrics";
import { MethodologyPanel } from "@/components/investor/MethodologyPanel";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["hsl(var(--accent))", "hsl(var(--primary))", "hsl(var(--muted-foreground))", "#A8B5C7", "#D4AF7A"];

const InvestorDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadPortfolio(user.id).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return <div className="text-muted-foreground">Cargando portafolio…</div>;
  }
  if (!data || data.investorIds.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-10 shadow-card text-center">
        <h2 className="font-display text-2xl mb-2">Aún no estás registrado como inversionista</h2>
        <p className="text-muted-foreground">El equipo Core te vinculará a tus inversiones próximamente.</p>
      </div>
    );
  }

  const roi = data.totalInvested > 0 ? (data.totalDistributions / data.totalInvested) * 100 : 0;

  // Trend: cumulative distributions by month
  const sorted = [...data.distributions].sort(
    (a, b) => new Date(a.distribution_date).getTime() - new Date(b.distribution_date).getTime()
  );
  const monthly = new Map<string, number>();
  let cum = 0;
  sorted.forEach((d) => {
    const key = new Date(d.distribution_date).toLocaleDateString("en-US", { year: "2-digit", month: "short" });
    cum += Number(d.amount);
    monthly.set(key, cum);
  });
  const trendData = Array.from(monthly.entries()).map(([name, value]) => ({ name, value }));

  // Allocation by project
  const allocMap = new Map<string, number>();
  data.investments.forEach((inv: any) => {
    const pj = data.projects.find((p) => p.id === inv.project_id);
    const key = pj?.name ?? "—";
    allocMap.set(key, (allocMap.get(key) ?? 0) + Number(inv.amount_invested));
  });
  const allocData = Array.from(allocMap.entries()).map(([name, value]) => ({ name, value }));

  const kpis = [
    { label: "Capital invertido", value: fmtUSD(data.totalInvested), icon: <Wallet className="h-5 w-5" /> },
    { label: "Distribuciones recibidas", value: fmtUSD(data.totalDistributions), icon: <TrendingUp className="h-5 w-5" /> },
    { label: "ROI acumulado", value: `${roi.toFixed(1)}%`, icon: <PieIcon className="h-5 w-5" /> },
    { label: "Proyectos activos", value: data.projectsCount.toString(), icon: <Building2 className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-lg p-6 shadow-card">
            <div className="flex items-center justify-between mb-3 text-accent">{kpi.icon}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{kpi.label}</div>
            <div className="font-display text-3xl text-foreground">{kpi.value}</div>
          </div>
        ))}
      </div>

      <AdvancedMetrics
        investments={data.investments}
        distributions={data.distributions}
        totalInvested={data.totalInvested}
        totalDistributions={data.totalDistributions}
      />

      <MethodologyPanel />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6 shadow-card">
          <h3 className="font-display text-xl mb-1">Distribuciones acumuladas</h3>
          <p className="text-sm text-muted-foreground mb-6">Evolución del retorno recibido en el tiempo.</p>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  formatter={(v: number) => fmtUSD(v)}
                />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
              Sin distribuciones registradas todavía.
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-card">
          <h3 className="font-display text-xl mb-1">Asignación por proyecto</h3>
          <p className="text-sm text-muted-foreground mb-6">Distribución de tu capital.</p>
          {allocData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={allocData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {allocData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => fmtUSD(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
              Sin inversiones registradas.
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        <h3 className="font-display text-xl mb-4">Tus inversiones</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-3 font-medium">Proyecto</th>
                <th className="py-3 font-medium">Fecha</th>
                <th className="py-3 font-medium">Tipo</th>
                <th className="py-3 font-medium text-right">Monto</th>
                <th className="py-3 font-medium text-right">% Participación</th>
                <th className="py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.investments.map((inv: any) => {
                const pj = data.projects.find((p) => p.id === inv.project_id);
                return (
                  <tr key={inv.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 font-medium">{pj?.name ?? "—"}</td>
                    <td className="py-3 text-muted-foreground">{new Date(inv.investment_date).toLocaleDateString("es-CO")}</td>
                    <td className="py-3 capitalize">{inv.investment_type}</td>
                    <td className="py-3 text-right font-mono">{fmtUSD(Number(inv.amount_invested))}</td>
                    <td className="py-3 text-right font-mono">{inv.ownership_percentage ? `${Number(inv.ownership_percentage).toFixed(2)}%` : "—"}</td>
                    <td className="py-3">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs bg-accent/10 text-accent capitalize">{inv.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvestorDashboard;
