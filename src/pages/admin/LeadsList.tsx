import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

type LeadStatus = "new" | "contacted" | "qualified" | "discarded";

type Lead = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  interest_amount: number | null;
  project_interest: string | null;
  message: string | null;
  source: string;
  status: LeadStatus;
  notes: string | null;
  created_at: string;
};

const statusLabel: Record<LeadStatus, string> = {
  new: "Nuevo",
  contacted: "Contactado",
  qualified: "Calificado",
  discarded: "Descartado",
};

const statusClass: Record<LeadStatus, string> = {
  new: "bg-accent/15 text-accent",
  contacted: "bg-secondary text-secondary-foreground",
  qualified: "bg-success/15 text-success",
  discarded: "bg-muted text-muted-foreground",
};

const money = (n: number | null) =>
  n == null ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const LeadsList = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setLeads((data ?? []) as Lead[]);
  };

  useEffect(() => { load(); }, []);

  const update = async (id: string, patch: Partial<Lead>) => {
    const { error } = await supabase.from("leads").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } as Lead : l)));
    toast.success("Prospecto actualizado");
  };

  const shown = filter === "all" ? leads : leads.filter((l) => l.status === filter);
  const counts = (s: LeadStatus) => leads.filter((l) => l.status === s).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl">Prospectos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Solicitudes de acceso y mensajes recibidos desde el sitio público.
          </p>
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as LeadStatus | "all")}>
          <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos ({leads.length})</SelectItem>
            {(Object.keys(statusLabel) as LeadStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{statusLabel[s]} ({counts(s)})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>
      ) : shown.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground shadow-card">
          Aún no hay prospectos en esta categoría.
        </div>
      ) : (
        <div className="space-y-4">
          {shown.map((l) => (
            <div key={l.id} className="bg-card border border-border rounded-lg p-6 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="font-display text-xl truncate">{l.full_name}</h2>
                    <span className={`text-xs px-2.5 py-1 rounded-full ${statusClass[l.status]}`}>{statusLabel[l.status]}</span>
                    <span className="text-xs text-muted-foreground">{l.source}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                    <a href={`mailto:${l.email}`} className="flex items-center gap-1.5 hover:text-accent">
                      <Mail className="h-3.5 w-3.5" /> {l.email}
                    </a>
                    {l.phone && (
                      <a href={`tel:${l.phone}`} className="flex items-center gap-1.5 hover:text-accent">
                        <Phone className="h-3.5 w-3.5" /> {l.phone}
                      </a>
                    )}
                    <span>{new Date(l.created_at).toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
                <Select value={l.status} onValueChange={(v) => update(l.id, { status: v as LeadStatus })}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(statusLabel) as LeadStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>{statusLabel[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Monto de interés</div>
                  <div className="font-medium">{money(l.interest_amount)}</div>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Proyecto</div>
                  <div className="font-medium truncate">{l.project_interest ?? "—"}</div>
                </div>
              </div>

              {l.message && (
                <p className="text-sm text-muted-foreground bg-secondary rounded-md p-4 mb-4 leading-relaxed">{l.message}</p>
              )}

              <div className="space-y-2">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Notas internas</div>
                <Textarea
                  rows={2}
                  value={notesDraft[l.id] ?? l.notes ?? ""}
                  onChange={(e) => setNotesDraft((d) => ({ ...d, [l.id]: e.target.value }))}
                />
                <Button size="sm" variant="outline" onClick={() => update(l.id, { notes: notesDraft[l.id] ?? l.notes ?? "" })}>
                  Guardar notas
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeadsList;
