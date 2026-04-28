import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, TrendingUp, Users } from "lucide-react";
import hero from "@/assets/hero-tower.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="absolute top-0 left-0 right-0 z-20 px-8 py-6 flex items-center justify-between">
        <div className="font-display text-2xl text-accent tracking-tight">CORE</div>
        <Link to="/auth">
          <Button variant="ghost" className="text-primary-foreground hover:text-accent hover:bg-transparent">
            Iniciar sesión
          </Button>
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative h-[88vh] min-h-[640px] overflow-hidden">
        <img src={hero} alt="" width={1600} height={1024} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-hero opacity-90" />
        <div className="relative z-10 h-full flex items-center px-8 md:px-16 max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <div className="text-accent text-xs tracking-[0.3em] uppercase mb-6">Real Estate · Investment Platform</div>
            <h1 className="font-display text-5xl md:text-7xl text-primary-foreground leading-[1.05] mb-6">
              Tu portafolio.<br/>
              <span className="text-accent italic">Transparente.</span>
            </h1>
            <p className="text-lg text-primary-foreground/75 max-w-xl mb-10 leading-relaxed">
              Acceso institucional al estado de tus inversiones, avance de obra y pagos
              en un solo lugar. Construido para inversionistas y compradores de Core.
            </p>
            <div className="flex gap-4">
              <Link to="/auth">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-gold">
                  Acceder al portal <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Three pillars */}
      <section className="py-24 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-accent text-xs tracking-[0.3em] uppercase mb-3">Tres portales</div>
          <h2 className="font-display text-4xl md:text-5xl">Una plataforma. Tres experiencias.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: TrendingUp, title: "Inversionistas", desc: "Portafolio, IRR, distribuciones y avance de obra en tiempo real." },
            { icon: Building2, title: "Compradores", desc: "Plan de pagos, avance de tu unidad y documentación del proyecto." },
            { icon: Users, title: "Equipo Core", desc: "Gestión integral, carga masiva vía Excel y sincronización con QuickBase." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card border border-border rounded-lg p-8 shadow-card hover:shadow-elegant transition-shadow">
              <div className="w-12 h-12 rounded-md bg-accent-soft flex items-center justify-center mb-5">
                <Icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-display text-2xl mb-2">{title}</h3>
              <p className="text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 px-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Core · Plataforma de inversión inmobiliaria
      </footer>
    </div>
  );
};

export default Landing;
