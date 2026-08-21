import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CoreLogoBadge } from "@/components/CoreLogo";

const ResetPassword = () => {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Si el usuario llegó desde el enlace del correo, ya hay sesión de recuperación
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "recovery",
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else setReady(true);
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Contraseña actualizada");
    nav("/auth", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-subtle p-8">
      <div className="w-full max-w-md bg-card border border-border rounded-lg p-8 shadow-card">
        <Link to="/" className="inline-block mb-6"><CoreLogoBadge className="h-8" /></Link>
        <h1 className="font-display text-3xl mb-2">Restablecer contraseña</h1>

        {!ready ? (
          <>
            <p className="text-muted-foreground mb-6">
              Ingresa el código de 6 dígitos que enviamos a tu correo.
            </p>
            <form onSubmit={verifyCode} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label>Código</Label>
                <Input
                  required
                  inputMode="numeric"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={busy} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                {busy ? "Verificando…" : "Verificar código"}
              </Button>
            </form>
          </>
        ) : (
          <>
            <p className="text-muted-foreground mb-6">Define tu nueva contraseña.</p>
            <form onSubmit={updatePassword} className="space-y-4">
              <div>
                <Label>Nueva contraseña</Label>
                <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div>
                <Label>Confirmar contraseña</Label>
                <Input type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>
              <Button type="submit" disabled={busy} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                {busy ? "Guardando…" : "Guardar contraseña"}
              </Button>
            </form>
          </>
        )}

        <Link to="/auth" className="block mt-6 text-sm text-muted-foreground hover:text-accent">
          Volver a iniciar sesión
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
