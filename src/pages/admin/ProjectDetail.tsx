import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Edit, Plus } from "lucide-react";
import { ProjectFormDialog } from "@/components/admin/ProjectFormDialog";
import { PhaseFormDialog } from "@/components/admin/PhaseFormDialog";
import { UnitFormDialog } from "@/components/admin/UnitFormDialog";
import { PhasePhotoUploader } from "@/components/admin/PhasePhotoUploader";
import { DocumentUploadDialog } from "@/components/admin/DocumentUploadDialog";
import { FileText, Download, Upload as UploadIcon } from "lucide-react";

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [phases, setPhases] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [docs, setDocs] = useState<any[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [phaseOpen, setPhaseOpen] = useState(false);
  const [unitOpen, setUnitOpen] = useState(false);
  const [docOpen, setDocOpen] = useState(false);

  const load = async () => {
    const [p, ph, un, dc] = await Promise.all([
      supabase.from("projects").select("*").eq("id", id).maybeSingle(),
      supabase.from("project_phases").select("*").eq("project_id", id).order("order_index"),
      supabase.from("units").select("*").eq("project_id", id).order("unit_number"),
      supabase.from("documents").select("*").eq("entity_type", "project").eq("entity_id", id!).order("created_at", { ascending: false }),
    ]);
    setProject(p.data);
    setPhases(ph.data ?? []);
    setUnits(un.data ?? []);
    setDocs(dc.data ?? []);
  };

  useEffect(() => { if (id) load(); }, [id]);

  if (!project) return <AdminPage title="Cargando…"><div /></AdminPage>;

  const fmt = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <AdminPage
      title={project.name}
      action={
        <div className="flex gap-2">
          <Link to="/admin/proyectos"><Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Volver</Button></Link>
          <Button onClick={() => setEditOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary-glow">
            <Edit className="h-4 w-4 mr-2" /> Editar
          </Button>
        </div>
      }
    >
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-lg p-5"><div className="text-xs uppercase text-muted-foreground mb-1">Ubicación</div><div className="font-medium">{project.location ?? "—"}</div></div>
        <div className="bg-card border border-border rounded-lg p-5"><div className="text-xs uppercase text-muted-foreground mb-1">Unidades</div><div className="font-medium">{project.total_units}</div></div>
        <div className="bg-card border border-border rounded-lg p-5"><div className="text-xs uppercase text-muted-foreground mb-1">Presupuesto</div><div className="font-medium">{project.budget_total ? fmt(Number(project.budget_total)) : "—"}</div></div>
        <div className="bg-card border border-border rounded-lg p-5"><div className="text-xs uppercase text-muted-foreground mb-1">Entrega</div><div className="font-medium">{project.estimated_delivery ? new Date(project.estimated_delivery).toLocaleDateString("es-CO") : "—"}</div></div>
      </div>

      <Tabs defaultValue="phases">
        <TabsList>
          <TabsTrigger value="phases">Fases de obra ({phases.length})</TabsTrigger>
          <TabsTrigger value="units">Unidades ({units.length})</TabsTrigger>
          <TabsTrigger value="docs">Documentos ({docs.length})</TabsTrigger>
          <TabsTrigger value="info">Información</TabsTrigger>
        </TabsList>

        <TabsContent value="phases">
          <div className="bg-card border border-border rounded-lg p-6 shadow-card">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-display text-xl">Fases de construcción</h3>
              <Button size="sm" onClick={() => setPhaseOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="h-4 w-4 mr-2" /> Añadir fase
              </Button>
            </div>
            {phases.length === 0 ? (
              <div className="text-muted-foreground text-sm py-8 text-center">No hay fases registradas</div>
            ) : (
              <div className="space-y-4">
                {phases.map((p) => (
                  <div key={p.id} className="border border-border rounded-md p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">{p.phase_name}</div>
                      <Badge variant="secondary">{Number(p.completion_percentage).toFixed(0)}%</Badge>
                    </div>
                    <Progress value={Number(p.completion_percentage)} className="h-2 mb-2" />
                    <div className="text-xs text-muted-foreground">
                      {p.estimated_start && `Inicio est: ${new Date(p.estimated_start).toLocaleDateString("es-CO")}`}
                      {p.estimated_end && ` · Fin est: ${new Date(p.estimated_end).toLocaleDateString("es-CO")}`}
                    </div>
                    <PhasePhotoUploader phaseId={p.id} projectId={project.id} photos={p.photos ?? []} onChange={load} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="units">
          <div className="bg-card border border-border rounded-lg p-6 shadow-card">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-display text-xl">Unidades</h3>
              <Button size="sm" onClick={() => setUnitOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="h-4 w-4 mr-2" /> Añadir unidad
              </Button>
            </div>
            {units.length === 0 ? (
              <div className="text-muted-foreground text-sm py-8 text-center">No hay unidades registradas</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground border-b border-border">
                  <tr><th className="py-2">Unidad</th><th>Piso</th><th>m²</th><th>Hab</th><th>Precio</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  {units.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0">
                      <td className="py-3 font-medium">{u.unit_number}</td>
                      <td>{u.floor ?? "—"}</td>
                      <td>{u.sqft ?? "—"}</td>
                      <td>{u.bedrooms ?? "—"}</td>
                      <td>{u.price_total ? fmt(Number(u.price_total)) : "—"}</td>
                      <td><Badge variant={u.status === "sold" ? "default" : "secondary"}>{u.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="docs">
          <div className="bg-card border border-border rounded-lg p-6 shadow-card">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-display text-xl">Documentos del proyecto</h3>
              <Button size="sm" onClick={() => setDocOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <UploadIcon className="h-4 w-4 mr-2" /> Subir documento
              </Button>
            </div>
            {docs.length === 0 ? (
              <div className="text-muted-foreground text-sm py-8 text-center">No hay documentos subidos</div>
            ) : (
              <div className="divide-y divide-border">
                {docs.map((d) => (
                  <div key={d.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-accent" />
                      <div>
                        <div className="font-medium text-sm">{d.name ?? d.doc_type}</div>
                        <div className="text-xs text-muted-foreground">{d.doc_type} · {new Date(d.created_at).toLocaleDateString("es-CO")}</div>
                      </div>
                    </div>
                    <a href={d.file_url} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline inline-flex items-center gap-1.5">
                      <Download className="h-4 w-4" /> Descargar
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="info">
          <div className="bg-card border border-border rounded-lg p-6 shadow-card">
            <p className="text-muted-foreground whitespace-pre-wrap">{project.description ?? "Sin descripción"}</p>
          </div>
        </TabsContent>
      </Tabs>

      <ProjectFormDialog open={editOpen} onOpenChange={setEditOpen} onSaved={load} project={project} />
      <PhaseFormDialog open={phaseOpen} onOpenChange={setPhaseOpen} onSaved={load} projectId={project.id} nextOrder={phases.length} />
      <UnitFormDialog open={unitOpen} onOpenChange={setUnitOpen} onSaved={load} projectId={project.id} />
      <DocumentUploadDialog open={docOpen} onOpenChange={setDocOpen} onSaved={load} entityType="project" entityId={project.id} />
    </AdminPage>
  );
};

export default ProjectDetail;
