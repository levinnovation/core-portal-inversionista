import { createContext, useContext, useState, ReactNode } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { opportunities } from "@/content/site";
import { toast } from "sonner";

export const leadSchema = z.object({
  full_name: z.string().trim().min(2, "Ingresa tu nombre").max(120, "Máximo 120 caracteres"),
  email: z.string().trim().email("Correo inválido").max(255),
  phone: z.string().trim().max(40, "Máximo 40 caracteres").optional().or(z.literal("")),
  interest_amount: z.string().trim().max(20).optional().or(z.literal("")),
  project_interest: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(1000, "Máximo 1000 caracteres").optional().or(z.literal("")),
});

type Ctx = { open: (source?: string) => void };
const LeadCtx = createContext<Ctx>({ open: () => {} });
export const useLeadDialog = () => useContext(LeadCtx);

export const LeadForm = ({
  source = "landing",
  onDone,
  compact,
}: {
  source?: string;
  onDone?: () => void;
  compact?: boolean;
}) => {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    interest_amount: "",
    project_interest: "",
    message: "",
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = leadSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setBusy(true);
    const v = parsed.data;
    const amount = v.interest_amount ? Number(v.interest_amount.replace(/[^\d.]/g, "")) : null;
    const { error } = await supabase.from("leads").insert({
      full_name: v.full_name,
      email: v.email,
      phone: v.phone || null,
      interest_amount: Number.isFinite(amount as number) ? amount : null,
      project_interest: v.project_interest || null,
      message: v.message || null,
      source,
    });
    setBusy(false);
    if (error) {
      toast.error("No pudimos enviar tu solicitud. Intenta de nuevo.");
      return;
    }
    toast.success("Solicitud enviada. El equipo Core te contactará en menos de 48 horas.");
    setForm({ full_name: "", email: "", phone: "", interest_amount: "", project_interest: "", message: "" });
    onDone?.();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className={compact ? "space-y-4" : "grid sm:grid-cols-2 gap-4"}>
        <div>
          <Label htmlFor="lead-name">Nombre completo</Label>
          <Input id="lead-name" required value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="lead-email">Email</Label>
          <Input id="lead-email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="lead-phone">Teléfono</Label>
          <Input id="lead-phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="lead-amount">Monto de interés (USD)</Label>
          <Input id="lead-amount" inputMode="numeric" placeholder="50,000" value={form.interest_amount} onChange={(e) => set("interest_amount", e.target.value)} />
        </div>
      </div>

      <div>
        <Label>Proyecto de interés</Label>
        <Select value={form.project_interest} onValueChange={(v) => set("project_interest", v)}>
          <SelectTrigger><SelectValue placeholder="Selecciona un proyecto (opcional)" /></SelectTrigger>
          <SelectContent>
            {opportunities.map((o) => (
              <SelectItem key={o.slug} value={o.name}>{o.name}</SelectItem>
            ))}
            <SelectItem value="Aún no lo decido">Aún no lo decido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="lead-message">Mensaje</Label>
        <Textarea id="lead-message" rows={3} maxLength={1000} value={form.message} onChange={(e) => set("message", e.target.value)} />
      </div>

      <Button type="submit" disabled={busy} className="w-full bg-primary text-primary-foreground hover:bg-primary-glow">
        {busy ? "Enviando…" : "Enviar solicitud"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Al enviar aceptas que el equipo Core te contacte. No compartimos tu información con terceros.
      </p>
    </form>
  );
};

export const LeadDialogProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState("landing");

  const open = (src = "landing") => {
    setSource(src);
    setIsOpen(true);
  };

  return (
    <LeadCtx.Provider value={{ open }}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Solicitar acceso</DialogTitle>
            <DialogDescription>
              Cuéntanos sobre ti y un ejecutivo de Core te contactará en menos de 48 horas.
            </DialogDescription>
          </DialogHeader>
          <LeadForm source={source} onDone={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </LeadCtx.Provider>
  );
};
