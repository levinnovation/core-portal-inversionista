import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
  projectId: string;
}

export const UnitFormDialog = ({ open, onOpenChange, onSaved, projectId }: Props) => {
  const [form, setForm] = useState({
    unit_number: "", floor: "", sqft: "", bedrooms: "", bathrooms: "", price_total: "", status: "available",
  });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("units").insert({
      project_id: projectId,
      unit_number: form.unit_number,
      floor: form.floor ? Number(form.floor) : null,
      sqft: form.sqft ? Number(form.sqft) : null,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
      price_total: form.price_total ? Number(form.price_total) : null,
      status: form.status as any,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Unidad añadida");
    setForm({ unit_number: "", floor: "", sqft: "", bedrooms: "", bathrooms: "", price_total: "", status: "available" });
    onOpenChange(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle className="font-display text-2xl">Añadir unidad</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Número *</Label><Input required value={form.unit_number} onChange={(e) => setForm({ ...form, unit_number: e.target.value })} /></div>
            <div><Label>Piso</Label><Input type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} /></div>
            <div><Label>Área (m²)</Label><Input type="number" value={form.sqft} onChange={(e) => setForm({ ...form, sqft: e.target.value })} /></div>
            <div><Label>Habitaciones</Label><Input type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} /></div>
            <div><Label>Baños</Label><Input type="number" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} /></div>
            <div><Label>Precio total</Label><Input type="number" value={form.price_total} onChange={(e) => setForm({ ...form, price_total: e.target.value })} /></div>
            <div className="col-span-2">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="reserved">Reservada</SelectItem>
                  <SelectItem value="sold">Vendida</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={busy} className="bg-primary text-primary-foreground hover:bg-primary-glow">{busy ? "Guardando…" : "Guardar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
