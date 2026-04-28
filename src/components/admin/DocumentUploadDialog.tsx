import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
  entityType: "project" | "investor" | "customer" | "sale" | "unit" | "investment";
  entityId: string;
  /** Where the file is uploaded: public bucket for non-confidential, documents for private */
  bucket?: "documents" | "project-photos";
}

const DOC_TYPES: Record<string, { value: string; label: string }[]> = {
  project: [
    { value: "report", label: "Reporte trimestral" },
    { value: "financial_statement", label: "Estado financiero" },
    { value: "inspection", label: "Reporte de inspección" },
    { value: "other", label: "Otro" },
  ],
  investor: [
    { value: "ppm", label: "PPM" },
    { value: "subscription", label: "Subscription Agreement" },
    { value: "k1", label: "K-1" },
    { value: "report", label: "Reporte trimestral" },
    { value: "other", label: "Otro" },
  ],
  customer: [
    { value: "id", label: "Documento de identidad" },
    { value: "kyc", label: "KYC" },
    { value: "other", label: "Otro" },
  ],
  sale: [
    { value: "contract", label: "Contrato de compraventa" },
    { value: "delivery_act", label: "Acta de entrega" },
    { value: "other", label: "Otro" },
  ],
  unit: [
    { value: "floor_plan", label: "Planos" },
    { value: "regulation", label: "Reglamento" },
    { value: "other", label: "Otro" },
  ],
  investment: [
    { value: "agreement", label: "Acuerdo de inversión" },
    { value: "distribution_notice", label: "Aviso de distribución" },
    { value: "other", label: "Otro" },
  ],
};

export const DocumentUploadDialog = ({ open, onOpenChange, onSaved, entityType, entityId, bucket = "documents" }: Props) => {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState("");
  const [name, setName] = useState("");
  const [textToIndex, setTextToIndex] = useState("");
  const [busy, setBusy] = useState(false);

  const types = DOC_TYPES[entityType] ?? [{ value: "other", label: "Otro" }];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) return toast.error("Selecciona un archivo");
    if (!docType) return toast.error("Selecciona el tipo de documento");
    setBusy(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${entityType}/${entityId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file);
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
      const { data: inserted, error } = await supabase.from("documents").insert({
        entity_type: entityType,
        entity_id: entityId,
        doc_type: docType,
        name: name || file.name,
        file_url: pub.publicUrl,
        uploaded_by: user?.id ?? null,
        text_content: textToIndex || null,
      }).select("id").single();
      if (error) throw error;
      toast.success("Documento subido");

      // Index for RAG if text was provided
      if (inserted?.id && textToIndex.trim()) {
        toast.info("Indexando para búsqueda semántica…");
        const { error: idxErr } = await supabase.functions.invoke("embed-document", {
          body: { documentId: inserted.id, text: textToIndex },
        });
        if (idxErr) toast.error(`Indexación falló: ${idxErr.message}`);
        else toast.success("Documento indexado en el RAG");
      }

      setDocType("");
      setName("");
      setTextToIndex("");
      if (inputRef.current) inputRef.current.value = "";
      onOpenChange(false);
      onSaved();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle className="font-display text-2xl">Subir documento</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Tipo de documento *</Label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger><SelectValue placeholder="Selecciona…" /></SelectTrigger>
              <SelectContent>
                {types.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Nombre (opcional)</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre visible para el usuario" />
          </div>
          <div>
            <Label>Archivo *</Label>
            <Input ref={inputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" required />
          </div>
          <div>
            <Label className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Texto para indexar en el RAG (opcional)
            </Label>
            <Textarea
              value={textToIndex}
              onChange={(e) => setTextToIndex(e.target.value)}
              placeholder="Pega aquí el contenido del documento para que el agente AI pueda buscarlo semánticamente."
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={busy} className="bg-primary text-primary-foreground hover:bg-primary-glow">
              {busy ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Subiendo…</> : <><Upload className="h-4 w-4 mr-2" />Subir</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
