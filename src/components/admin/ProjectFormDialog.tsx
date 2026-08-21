import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
  project?: any;
}

export const ProjectFormDialog = ({ open, onOpenChange, onSaved, project }: Props) => {
  const [form, setForm] = useState({
    name: "", location: "", type: "residential", total_units: 0,
    total_sqft: "", budget_total: "", status: "planning",
    start_date: "", estimated_delivery: "", description: "",
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (project) {
      setForm({
        name: project.name ?? "",
        location: project.location ?? "",
        type: project.type ?? "residential",
        total_units: project.total_units ?? 0,
        total_sqft: project.total_sqft?.toString() ?? "",
        budget_total: project.budget_total?.toString() ?? "",
        status: project.status ?? "planning",
        start_date: project.start_date ?? "",
        estimated_delivery: project.estimated_delivery ?? "",
        description: project.description ?? "",
      });
    } else {
      setForm({
        name: "", location: "", type: "residential", total_units: 0,
        total_sqft: "", budget_total: "", status: "planning",
        start_date: "", estimated_delivery: "", description: "",
      });
    }
  }, [project, open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const payload: any = {
      name: form.name,
      location: form.location || null,
      type: form.type || null,
      total_units: Number(form.total_units) || 0,
      total_sqft: form.total_sqft ? Number(form.total_sqft) : null,
      budget_total: form.budget_total ? Number(form.budget_total) : null,
      status: form.status,
      start_date: form.start_date || null,
      estimated_delivery: form.estimated_delivery || null,
      description: form.description || null,
    };
    const { error } = project
      ? await supabase.from("projects").update(payload).eq("id", project.id)
      : await supabase.from("projects").insert(payload);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(project ? "Proyecto actualizado" : "Proyecto creado");
    onOpenChange(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {project ? "Editar proyecto" : "Nuevo proyecto"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Nombre del proyecto *</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Ubicación</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residencial</SelectItem>
                  <SelectItem value="commercial">Comercial</SelectItem>
                  <SelectItem value="mixed">Mixto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Total unidades</Label>
              <Input type="number" value={form.total_units} onChange={(e) => setForm({ ...form, total_units: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Área total (m²)</Label>
              <Input type="number" value={form.total_sqft} onChange={(e) => setForm({ ...form, total_sqft: e.target.value })} />
            </div>
            <div>
              <Label>Presupuesto total (USD)</Label>
              <Input type="number" value={form.budget_total} onChange={(e) => setForm({ ...form, budget_total: e.target.value })} />
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planeación</SelectItem>
                  <SelectItem value="pre_construction">Pre-construcción</SelectItem>
                  <SelectItem value="construction">Construcción</SelectItem>
                  <SelectItem value="completed">Entregado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fecha de inicio</Label>
              <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div>
              <Label>Entrega estimada</Label>
              <Input type="date" value={form.estimated_delivery} onChange={(e) => setForm({ ...form, estimated_delivery: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>Descripción</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={busy} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {busy ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
