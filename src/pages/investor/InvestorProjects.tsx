import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useImpersonation } from "@/hooks/useImpersonation";
import { supabase } from "@/integrations/supabase/client";
import { loadPortfolio, fmtUSD } from "@/lib/investor";
import { Progress } from "@/components/ui/progress";
import { MapPin, Calendar } from "lucide-react";

const InvestorProjects = () => {
  const { user } = useAuth();
  const { target } = useImpersonation();
  const [projects, setProjects] = useState<any[]>([]);
  const [phases, setPhases] = useState<Record<string, any[]>>({});
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const portfolio = await loadPortfolio(user.id, { impersonateInvestorId: target?.kind === "investor" ? target.recordId : null });
      setProjects(portfolio.projects);
      setInvestments(portfolio.investments);
      if (portfolio.projects.length > 0) {
        const { data } = await supabase
          .from("project_phases")
          .select("*")
          .in("project_id", portfolio.projects.map((p) => p.id))
          .order("order_index");
        const grouped: Record<string, any[]> = {};
        (data ?? []).forEach((ph: any) => {
          (grouped[ph.project_id] ??= []).push(ph);
        });
        setPhases(grouped);
      }
      setLoading(false);
    })();
  }, [user, target]);

  if (loading) return <div className="text-muted-foreground">Cargando proyectos…</div>;
  if (projects.length === 0) {
    return <div className="bg-card border border-border rounded-lg p-10 text-center text-muted-foreground">Sin proyectos vinculados.</div>;
  }

  return (
    <div className="space-y-6">
      {projects.map((p) => {
        const myInvestments = investments.filter((i) => i.project_id === p.id);
        const myCapital = myInvestments.reduce((s, i) => s + Number(i.amount_invested), 0);
        const projectPhases = phases[p.id] ?? [];
        const overall = projectPhases.length
          ? projectPhases.reduce((s, ph) => s + Number(ph.completion_percentage), 0) / projectPhases.length
          : 0;
        return (
          <div key={p.id} className="bg-card border border-border rounded-lg p-6 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-2xl mb-1 truncate">{p.name}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {p.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{p.location}</span>}
                  {p.estimated_delivery && (
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Entrega: {new Date(p.estimated_delivery).toLocaleDateString("es-CO")}</span>
                  )}
                  <span className="capitalize px-2 py-0.5 rounded bg-accent/10 text-accent text-xs">{p.status}</span>
                </div>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Mi capital</div>
                <div className="font-display text-2xl truncate" title={fmtUSD(myCapital)}>{fmtUSD(myCapital)}</div>
              </div>
            </div>

            {p.description && <p className="text-sm text-muted-foreground mb-6">{p.description}</p>}

            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Avance general</span>
                <span className="font-mono text-accent">{overall.toFixed(0)}%</span>
              </div>
              <Progress value={overall} className="h-2" />
            </div>

            {projectPhases.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">Fases</h4>
                {projectPhases.map((ph) => (
                  <div key={ph.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{ph.phase_name}</span>
                      <span className="font-mono text-muted-foreground">{Number(ph.completion_percentage).toFixed(0)}%</span>
                    </div>
                    <Progress value={Number(ph.completion_percentage)} className="h-1.5" />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default InvestorProjects;
