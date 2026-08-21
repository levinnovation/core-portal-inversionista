import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, ArrowRight, LogIn } from "lucide-react";
import { useLeadDialog } from "./LeadDialog";

const menus = [
  {
    label: "Invertir",
    items: [
      { to: "/oportunidades", label: "Oportunidades" },
      { to: "/como-invertir", label: "Cómo invertir" },
      { to: "/#diferenciadores", label: "Por qué Core" },
    ],
  },
  {
    label: "Portafolio",
    items: [
      { to: "/oportunidades", label: "Proyectos" },
      { to: "/#casos", label: "Casos de éxito" },
    ],
  },
  {
    label: "Nosotros",
    items: [
      { to: "/nosotros", label: "Sobre Core" },
      { to: "/nosotros#equipo", label: "Equipo" },
      { to: "/faq", label: "Preguntas frecuentes" },
      { to: "/contacto", label: "Contacto" },
    ],
  },
];

export const PublicNav = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { open } = useLeadDialog();
  const loc = useLocation();
  const onDark = loc.pathname === "/";

  const textBase = onDark
    ? "text-primary-foreground/85 hover:text-accent"
    : "text-foreground/80 hover:text-accent";

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-colors ${
        onDark ? "bg-primary/95 border-primary-glow/40 backdrop-blur" : "bg-background/95 border-border backdrop-blur"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className={`font-display text-2xl tracking-tight shrink-0 ${onDark ? "text-accent" : "text-accent"}`}>
          CORE
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {menus.map((menu) => (
            <div key={menu.label} className="relative group">
              <button className={`flex items-center gap-1 px-3 py-2 text-sm transition-colors ${textBase}`}>
                {menu.label}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="min-w-[220px] bg-popover border border-border rounded-md shadow-elegant py-2">
                  {menu.items.map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      className="block px-4 py-2 text-sm text-popover-foreground hover:bg-secondary transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link to="/auth">
            <Button
              variant="ghost"
              size="sm"
              className={onDark ? "text-primary-foreground/90 hover:text-accent hover:bg-primary-foreground/10" : "text-foreground/80 hover:text-accent hover:bg-secondary"}
            >
              Iniciar sesión
            </Button>
          </Link>
          <Button size="sm" variant="premium" onClick={() => open("nav")}>
            Solicitar acceso <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>

        <button
          className={`lg:hidden p-2 ${onDark ? "text-primary-foreground" : "text-foreground"}`}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menú"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background px-6 py-4 space-y-4">
          {menus.map((menu) => (
            <div key={menu.label}>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{menu.label}</div>
              <div className="space-y-1">
                {menu.items.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="block py-1.5 text-sm text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <div className="flex flex-col gap-3 pt-3 border-t border-border">
            <Button size="lg" variant="premium" onClick={() => { setMobileOpen(false); open("nav-mobile"); }}>
              Solicitar acceso <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Link to="/auth" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" size="lg" className="w-full">
                <LogIn className="mr-2 h-4 w-4" /> Iniciar sesión
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
