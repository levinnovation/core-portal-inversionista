import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Auth = () => {
  const nav = useNavigate();
  const { user, primaryRole, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    if (primaryRole === "admin") nav("/admin", { replace: true });
    else if (primaryRole === "investor") nav("/inversionistas", { replace: true });
    else if (primaryRole === "customer") nav("/clientes", { replace: true });
    else nav("/onboarding", { replace: true });
  }, [user, primaryRole, loading, nav]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: fullName },
      },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Cuenta creada. Revisa tu correo para verificar.");
  };

  return (
    <div className="min-h-screen flex bg-subtle">
      <div className="hidden lg:flex flex-1 bg-hero p-16 flex-col justify-between text-primary-foreground">
        <Link to="/" className="font-display text-3xl text-accent tracking-tight">CORE</Link>
        <div>
          <div className="text-accent text-xs tracking-[0.3em] uppercase mb-4">Portal seguro</div>
          <h2 className="font-display text-4xl leading-tight max-w-md">
            Acceso institucional a tu portafolio inmobiliario.
          </h2>
        </div>
        <div className="text-sm text-primary-foreground/60">© {new Date().getFullYear()} Core</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden font-display text-2xl text-primary mb-8 text-center">CORE</div>
          <h1 className="font-display text-3xl mb-2">Bienvenido</h1>
          <p className="text-muted-foreground mb-8">Ingresa a tu portal Core</p>

          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="signin">Iniciar sesión</TabsTrigger>
              <TabsTrigger value="signup">Crear cuenta</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label>Contraseña</Label>
                  <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" disabled={busy} className="w-full bg-primary text-primary-foreground hover:bg-primary-glow">
                  {busy ? "Ingresando…" : "Ingresar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label>Nombre completo</Label>
                  <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label>Contraseña</Label>
                  <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" disabled={busy} className="w-full bg-primary text-primary-foreground hover:bg-primary-glow">
                  {busy ? "Creando…" : "Crear cuenta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
