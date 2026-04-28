import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Calendar } from "lucide-react";
import { ProjectFormDialog } from "@/components/admin/ProjectFormDialog";
import { Badge } from "@/components/ui/badge";

const statusLabel: Record<string, string> = {
  planning: "Planeación",
  pre_construction: "Pre-construcción",
  construction: "Construcción",
  completed: "Entregado",
};

const ProjectsList = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    setProjects(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <AdminPage
      title="Proyectos"
      action={
        <Button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary-glow">
          <Plus className="h-4 w-4 mr-2" /> Nuevo proyecto
        </Button>
      }
    >
      {loading ? (
        <div className="text-muted-foreground">Cargando…</div>
      ) : projects.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-lg p-16 text-center">
          <h3 className="font-display text-xl mb-2">No hay proyectos aún</h3>
          <p className="text-muted-foreground mb-6">Crea tu primer proyecto para comenzar.</p>
          <Button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" /> Crear proyecto
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <Link
              key={p.id}
              to={`/admin/proyectos/${p.id}`}
              className="bg-card border border-border rounded-lg overflow-hidden shadow-card hover:shadow-elegant transition-shadow group"
            >
              <div className="h-40 bg-hero relative">
                {p.cover_image_url && (
                  <img src={p.cover_image_url} alt="" className="w-full h-full object-cover" />
                )}
                <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground border-0">
                  {statusLabel[p.status] ?? p.status}
                </Badge>
              </div>
              <div className="p-5">
                <h3 className="font-display text-xl mb-2 group-hover:text-accent transition-colors">{p.name}</h3>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  {p.location && (
                    <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {p.location}</div>
                  )}
                  {p.estimated_delivery && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" /> Entrega: {new Date(p.estimated_delivery).toLocaleDateString("es-CO")}
                    </div>
                  )}
                  <div>{p.total_units || 0} unidades</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <ProjectFormDialog open={open} onOpenChange={setOpen} onSaved={load} />
    </AdminPage>
  );
};

export default ProjectsList;
