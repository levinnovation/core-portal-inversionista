import { useEffect, useState } from "react";
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
  customerId: string | null;
}

export const SaleFormDialog = ({ open, onOpenChange, onSaved, customerId }: Props) => {
  const [units, setUnits] = useState<any[]>([]);
  const [form, setForm] = useState({
    unit_id: "", sale_date: new Date().toISOString().slice(0, 10),
    price_agreed: "", financing_bank: "", financing_amount: "",
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      supabase
        .from("units")
        .select("id, unit_number, price_total, status, projects(name)")
        .neq("status", "sold")
        .then(({ data }) => setUnits(data ?? []));
    }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;
    setBusy(true);
    const { error } = await supabase.from("sales").insert({
      customer_id: customerId,
      unit_id: form.unit_id,
      sale_date: form.sale_date,
      price_agreed: Number(form.price_agreed),
      financing_bank: form.financing_bank || null,
      financing_amount: form.financing_amount ? Number(form.financing_amount) : null,
    });
    if (!error) {
      await supabase.from("units").update({ status: "sold" }).eq("id", form.unit_id);
    }
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Venta registrada");
    setForm({ unit_id: "", sale_date: new Date().toISOString().slice(0, 10), price_agreed: "", financing_bank: "", financing_amount: "" });
    onOpenChange(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle className="font-display text-2xl">Nueva venta</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Unidad *</Label>
            <Select value={form.unit_id} onValueChange={(v) => {
              const u = units.find((x) => x.id === v);
              setForm({ ...form, unit_id: v, price_agreed: u?.price_total?.toString() ?? form.price_agreed });
            }}>
              <SelectTrigger><SelectValue placeholder="Selecciona una unidad disponible" /></SelectTrigger>
              <SelectContent>
                {units.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.projects?.name} · Unidad {u.unit_number}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Precio acordado (USD) *</Label><Input type="number" required value={form.price_agreed} onChange={(e) => setForm({ ...form, price_agreed: e.target.value })} /></div>
            <div><Label>Fecha *</Label><Input type="date" required value={form.sale_date} onChange={(e) => setForm({ ...form, sale_date: e.target.value })} /></div>
            <div><Label>Banco financiador</Label><Input value={form.financing_bank} onChange={(e) => setForm({ ...form, financing_bank: e.target.value })} /></div>
            <div><Label>Monto financiado</Label><Input type="number" value={form.financing_amount} onChange={(e) => setForm({ ...form, financing_amount: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={busy || !form.unit_id} className="bg-primary text-primary-foreground hover:bg-primary-glow">{busy ? "Guardando…" : "Registrar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
