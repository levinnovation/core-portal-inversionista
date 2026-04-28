import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { CustomerData, fmtDate, loadCustomerData } from "@/lib/customer";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Camera } from "lucide-react";

const CustomerProgress = () => {
  const { user } = useAuth();
  const [data, setData] = useState<CustomerData | null>(null);

  useEffect(() => { if (user) loadCustomerData(user.id).then(setData); }, [user]);

  if (!data) return <div className="text-muted-foreground">Cargando…</div>;
  if (!data.customer || data.projects.length === 0) {
    return <div className="bg-card border border-border rounded-lg p-10 text-center text-muted-foreground">Sin información de avance disponible.</div>;
  }

  const project = data.projects[0];
  const phases = data.phases.filter((ph: any) => ph.project_id === project.id);
  const overall = phases.length
    ? phases.reduce((s: number, ph: any) => s + Number(ph.completion_percentage), 0) / phases.length
    : 0;

  // Collect all photos across phases
  const allPhotos: { url: string; phase: string; date: string }[] = [];
  phases.forEach((ph: any) => {
    (ph.photos ?? []).forEach((url: string) => {
      allPhotos.push({ url, phase: ph.phase_name, date: ph.updated_at });
    });
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-lg p-8 shadow-card">
        <div className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70 mb-1">Avance de obra</div>
        <h2 className="font-display text-3xl mb-4">{project.name}</h2>
        <div className="flex justify-between text-sm mb-2">
          <span>Avance general</span>
          <span className="font-mono text-2xl font-display">{overall.toFixed(0)}%</span>
        </div>
        <Progress value={overall} className="h-3 bg-primary-foreground/20 [&>div]:bg-accent" />
      </div>

      {/* Checklist de fases */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        <h3 className="font-display text-xl mb-6">Etapas de construcción</h3>
        <div className="space-y-4">
          {phases.map((ph: any) => {
            const pct = Number(ph.completion_percentage);
            const isDone = pct >= 100;
            const Icon = isDone ? CheckCircle2 : Circle;
            return (
              <div key={ph.id} className="flex gap-4">
                <Icon className={`h-6 w-6 mt-0.5 flex-shrink-0 ${isDone ? "text-emerald-500" : pct > 0 ? "text-accent" : "text-muted-foreground/40"}`} />
                <div className="flex-1">
                  <div className="flex justify-between mb-1.5">
                    <div className="font-medium">{ph.phase_name}</div>
                    <div className="text-sm font-mono text-muted-foreground">{pct.toFixed(0)}%</div>
                  </div>
                  <Progress value={pct} className="h-1.5 mb-1.5" />
                  <div className="text-xs text-muted-foreground">
                    {ph.estimated_start && `Inicio: ${fmtDate(ph.estimated_start)}`}
                    {ph.estimated_end && ` · Fin: ${fmtDate(ph.estimated_end)}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Galería de fotos */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl flex items-center gap-2"><Camera className="h-5 w-5 text-accent" /> Galería de avance</h3>
          <span className="text-sm text-muted-foreground">{allPhotos.length} {allPhotos.length === 1 ? "foto" : "fotos"}</span>
        </div>
        {allPhotos.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            Aún no hay fotos del avance disponibles. El equipo Core las publicará periódicamente.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {allPhotos.map((ph, i) => (
              <a key={i} href={ph.url} target="_blank" rel="noreferrer" className="group relative aspect-square overflow-hidden rounded-md border border-border">
                <img src={ph.url} alt={ph.phase} className="object-cover w-full h-full group-hover:scale-105 transition-transform" loading="lazy" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <div className="text-xs text-white font-medium truncate">{ph.phase}</div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProgress;
