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
  investorId: string | null;
}

export const InvestmentFormDialog = ({ open, onOpenChange, onSaved, investorId }: Props) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [form, setForm] = useState({
    project_id: "", amount_invested: "", investment_date: new Date().toISOString().slice(0, 10),
    investment_type: "equity", ownership_percentage: "",
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) supabase.from("projects").select("id, name").then(({ data }) => setProjects(data ?? []));
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investorId) return;
    setBusy(true);
    const { error } = await supabase.from("investments").insert({
      investor_id: investorId,
      project_id: form.project_id,
      amount_invested: Number(form.amount_invested),
      investment_date: form.investment_date,
      investment_type: form.investment_type as any,
      ownership_percentage: form.ownership_percentage ? Number(form.ownership_percentage) : null,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Inversión registrada");
    setForm({ project_id: "", amount_invested: "", investment_date: new Date().toISOString().slice(0, 10), investment_type: "equity", ownership_percentage: "" });
    onOpenChange(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle className="font-display text-2xl">Nueva inversión</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Proyecto *</Label>
            <Select value={form.project_id} onValueChange={(v) => setForm({ ...form, project_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecciona un proyecto" /></SelectTrigger>
              <SelectContent>
                {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Monto invertido (USD) *</Label><Input type="number" required value={form.amount_invested} onChange={(e) => setForm({ ...form, amount_invested: e.target.value })} /></div>
            <div><Label>Fecha *</Label><Input type="date" required value={form.investment_date} onChange={(e) => setForm({ ...form, investment_date: e.target.value })} /></div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.investment_type} onValueChange={(v) => setForm({ ...form, investment_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="equity">Equity</SelectItem>
                  <SelectItem value="debt">Deuda</SelectItem>
                  <SelectItem value="preferred">Preferente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>% Participación</Label><Input type="number" step="0.01" value={form.ownership_percentage} onChange={(e) => setForm({ ...form, ownership_percentage: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={busy || !form.project_id} className="bg-primary text-primary-foreground hover:bg-primary-glow">{busy ? "Guardando…" : "Registrar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
