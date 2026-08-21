import { useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type EntityType = "projects" | "payments" | "distributions";

const SCHEMAS: Record<EntityType, { label: string; fields: string[]; sample: any[] }> = {
  projects: {
    label: "Proyectos",
    fields: ["name", "location", "type", "total_units", "budget_total", "status", "estimated_delivery"],
    sample: [
      { name: "Torre Vista", location: "Bogotá", type: "residential", total_units: 80, budget_total: 12000000, status: "construction", estimated_delivery: "2026-12-31" },
    ],
  },
  payments: {
    label: "Pagos de clientes",
    fields: ["sale_id", "amount", "due_date", "status", "payment_method"],
    sample: [
      { sale_id: "<uuid de sale>", amount: 5000, due_date: "2026-06-15", status: "pending", payment_method: "transferencia" },
    ],
  },
  distributions: {
    label: "Distribuciones",
    fields: ["investment_id", "amount", "distribution_date", "type", "description"],
    sample: [
      { investment_id: "<uuid de investment>", amount: 12000, distribution_date: "2026-03-31", type: "preferred_return", description: "Q1 2026" },
    ],
  },
};

const ExcelUpload = () => {
  const [entity, setEntity] = useState<EntityType>("projects");
  const [rows, setRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const data: any[] = XLSX.utils.sheet_to_json(sheet);
    setRows(data);
  };

  const downloadTemplate = () => {
    const schema = SCHEMAS[entity];
    const ws = XLSX.utils.json_to_sheet(schema.sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, schema.label);
    XLSX.writeFile(wb, `plantilla_${entity}.xlsx`);
  };

  const validate = () => {
    const schema = SCHEMAS[entity];
    const required = schema.fields.slice(0, entity === "projects" ? 1 : 3);
    const errors: string[] = [];
    rows.forEach((r, i) => {
      required.forEach((f) => {
        if (!r[f] && r[f] !== 0) errors.push(`Fila ${i + 2}: falta "${f}"`);
      });
    });
    return errors;
  };

  const errors = rows.length ? validate() : [];

  const upload = async () => {
    if (errors.length) {
      toast.error(`Hay ${errors.length} errores. Corrige antes de cargar.`);
      return;
    }
    setBusy(true);
    const schema = SCHEMAS[entity];
    const cleaned = rows.map((r) => {
      const obj: any = {};
      schema.fields.forEach((f) => {
        if (r[f] !== undefined && r[f] !== "") obj[f] = r[f];
      });
      return obj;
    });

    const { error } = await supabase.from(entity).insert(cleaned);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("sync_logs").insert({
      source: "excel_upload",
      direction: "import",
      entity_type: entity,
      records_processed: error ? 0 : cleaned.length,
      records_failed: error ? cleaned.length : 0,
      error_details: error ? { message: error.message } : null,
      initiated_by: user?.id,
    });
    setBusy(false);
    if (error) {
      toast.error(`Error al cargar: ${error.message}`);
    } else {
      toast.success(`${cleaned.length} registros cargados correctamente`);
      setRows([]);
      setFileName("");
    }
  };

  return (
    <AdminPage title="Carga masiva vía Excel">
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-1">
          <h3 className="font-display text-xl mb-4">1. Selecciona tipo</h3>
          <Select value={entity} onValueChange={(v) => { setEntity(v as EntityType); setRows([]); setFileName(""); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(SCHEMAS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>

          <div className="mt-5 pt-5 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3">Columnas esperadas:</p>
            <div className="flex flex-wrap gap-1.5">
              {SCHEMAS[entity].fields.map((f) => (
                <span key={f} className="text-xs bg-muted px-2 py-1 rounded font-mono">{f}</span>
              ))}
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={downloadTemplate} className="w-full mt-5">
            <Download className="h-4 w-4 mr-2" /> Descargar plantilla
          </Button>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="font-display text-xl mb-4">2. Sube tu archivo</h3>
          <label className="block border-2 border-dashed border-border rounded-lg p-10 text-center hover:border-accent transition-colors cursor-pointer">
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <div className="font-medium mb-1">{fileName || "Haz clic para seleccionar archivo"}</div>
            <div className="text-xs text-muted-foreground">.xlsx, .xls o .csv</div>
          </label>

          {rows.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-accent" />
                  <span className="font-medium">{rows.length} filas detectadas</span>
                </div>
                {errors.length === 0 ? (
                  <span className="flex items-center gap-1.5 text-success text-sm"><CheckCircle2 className="h-4 w-4" />Validación OK</span>
                ) : (
                  <span className="flex items-center gap-1.5 text-destructive text-sm"><AlertCircle className="h-4 w-4" />{errors.length} errores</span>
                )}
              </div>

              {errors.length > 0 && (
                <div className="bg-destructive/5 border border-destructive/20 rounded-md p-3 mb-4 max-h-32 overflow-y-auto text-xs space-y-1">
                  {errors.slice(0, 10).map((e, i) => <div key={i} className="text-destructive">{e}</div>)}
                  {errors.length > 10 && <div className="text-muted-foreground">…y {errors.length - 10} más</div>}
                </div>
              )}

              <div className="border border-border rounded-md overflow-x-auto max-h-72 mb-4">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>{Object.keys(rows[0]).map((k) => <th key={k} className="px-3 py-2 text-left font-medium">{k}</th>)}</tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 50).map((r, i) => (
                      <tr key={i} className="border-t border-border">
                        {Object.keys(rows[0]).map((k) => <td key={k} className="px-3 py-2">{String(r[k] ?? "")}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Button onClick={upload} disabled={busy || errors.length > 0} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                {busy ? "Cargando…" : `Confirmar e insertar ${rows.length} registros`}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </AdminPage>
  );
};

export default ExcelUpload;
