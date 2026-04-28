import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  phaseId: string;
  projectId: string;
  photos: string[];
  onChange: () => void;
}

export const PhasePhotoUploader = ({ phaseId, projectId, photos, onChange }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const path = `${projectId}/${phaseId}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("project-photos").upload(path, file);
        if (error) throw error;
        const { data } = supabase.storage.from("project-photos").getPublicUrl(path);
        newUrls.push(data.publicUrl);
      }
      const { error: updErr } = await supabase
        .from("project_phases")
        .update({ photos: [...photos, ...newUrls] })
        .eq("id", phaseId);
      if (updErr) throw updErr;
      toast.success(`${newUrls.length} foto(s) subida(s)`);
      onChange();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = async (url: string) => {
    if (!confirm("¿Eliminar esta foto?")) return;
    setBusy(true);
    try {
      // Try to delete from storage (extract path)
      const marker = "/project-photos/";
      const idx = url.indexOf(marker);
      if (idx > -1) {
        const path = url.slice(idx + marker.length);
        await supabase.storage.from("project-photos").remove([path]);
      }
      const { error } = await supabase
        .from("project_phases")
        .update({ photos: photos.filter((p) => p !== url) })
        .eq("id", phaseId);
      if (error) throw error;
      toast.success("Foto eliminada");
      onChange();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2 mb-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Camera className="h-3.5 w-3.5 mr-1.5" />}
          Subir fotos
        </Button>
        <span className="text-xs text-muted-foreground">{photos.length} foto(s)</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => upload(e.target.files)}
      />
      {photos.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {photos.map((url) => (
            <div key={url} className="relative group aspect-square rounded-md overflow-hidden border border-border">
              <img src={url} alt="" className="object-cover w-full h-full" loading="lazy" />
              <button
                type="button"
                onClick={() => remove(url)}
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
