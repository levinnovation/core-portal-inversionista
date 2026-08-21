import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
  projectId: string;
  nextOrder: number;
}

export const PhaseFormDialog = ({ open, onOpenChange, onSaved, projectId, nextOrder }: Props) => {
  const [form, setForm] = useState({
    phase_name: "", completion_percentage: 0,
    estimated_start: "", estimated_end: "",
  });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("project_phases").insert({
      project_id: projectId,
      phase_name: form.phase_name,
      order_index: nextOrder,
      completion_percentage: Number(form.completion_percentage),
      estimated_start: form.estimated_start || null,
      estimated_end: form.estimated_end || null,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Fase añadida");
    setForm({ phase_name: "", completion_percentage: 0, estimated_start: "", estimated_end: "" });
    onOpenChange(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle className="font-display text-2xl">Añadir fase</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Nombre de la fase *</Label>
            <Input required value={form.phase_name} onChange={(e) => setForm({ ...form, phase_name: e.target.value })} placeholder="Ej. Cimentación" />
          </div>
          <div>
            <Label>% Avance</Label>
            <Input type="number" min={0} max={100} value={form.completion_percentage} onChange={(e) => setForm({ ...form, completion_percentage: Number(e.target.value) })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Inicio estimado</Label><Input type="date" value={form.estimated_start} onChange={(e) => setForm({ ...form, estimated_start: e.target.value })} /></div>
            <div><Label>Fin estimado</Label><Input type="date" value={form.estimated_end} onChange={(e) => setForm({ ...form, estimated_end: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={busy} className="bg-accent text-accent-foreground hover:bg-accent/90">{busy ? "Guardando…" : "Guardar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
