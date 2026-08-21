import { Link, useLocation, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  LogOut, LayoutDashboard, Building2, Users, ShoppingBag,
  Upload, RefreshCw, Bot, BarChart3, Menu, X, User, ShieldCheck, UserPlus,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { NotificationBell } from "@/components/NotificationBell";
import { PortalSwitcher } from "@/components/PortalSwitcher";
import { CoreLogo, CoreLogoBadge } from "@/components/CoreLogo";
import { ThemeToggle } from "@/components/ThemeToggle";

const nav = [
  { to: "/admin", label: "Resumen", icon: LayoutDashboard, end: true },
  { to: "/admin/proyectos", label: "Proyectos", icon: Building2 },
  { to: "/admin/inversionistas", label: "Inversionistas", icon: Users },
  { to: "/admin/clientes", label: "Clientes", icon: ShoppingBag },
  { to: "/admin/prospectos", label: "Prospectos", icon: UserPlus },
  { to: "/admin/excel", label: "Carga Excel", icon: Upload },
  { to: "/admin/quickbase", label: "QuickBase", icon: RefreshCw },
  { to: "/admin/agentes", label: "Agentes AI", icon: Bot },
  { to: "/admin/reportes", label: "Reportes", icon: BarChart3 },
  { to: "/admin/auditoria", label: "Auditoría", icon: ShieldCheck },
];

export const AdminLayout = ({ children }: { children?: ReactNode }) => {
  const { signOut, user } = useAuth();
  const loc = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (to: string, end?: boolean) =>
    end ? loc.pathname === to : loc.pathname === to || loc.pathname.startsWith(to + "/");

  const sidebar = (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border shrink-0 h-full">
      <div className="px-6 py-7 border-b border-sidebar-border flex items-center justify-between">
        <div>
          <CoreLogo className="h-7" />
          <div className="text-xs uppercase tracking-[0.2em] text-sidebar-foreground/60 mt-1">Equipo Core</div>
        </div>
        <button className="md:hidden text-sidebar-foreground/70 p-1" onClick={() => setOpen(false)} aria-label="Cerrar menú">
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to, item.end);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                active
                  ? "bg-sidebar-accent text-accent font-medium"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border space-y-1">
        <Link
          to="/perfil"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          <User className="h-4 w-4" /> Mi perfil
        </Link>
        <div className="text-xs text-sidebar-foreground/60 truncate px-3 pt-2">{user?.email}</div>
        <Button variant="ghost" size="sm" onClick={signOut} className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent">
          <LogOut className="h-4 w-4 mr-2" /> Cerrar sesión
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-subtle">
      <div className="hidden md:flex">{sidebar}</div>
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative z-10">{sidebar}</div>
        </div>
      )}
      <main className="flex-1 min-w-0 overflow-auto">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <button onClick={() => setOpen(true)} aria-label="Abrir menú" className="p-1.5 rounded-md hover:bg-subtle">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2"><CoreLogoBadge className="h-6" /><span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin</span></div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <PortalSwitcher />
            <NotificationBell />
          </div>
        </div>
        {children ?? <Outlet />}
      </main>
    </div>
  );
};

export const AdminPage = ({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) => (
  <>
    <header className="px-5 md:px-10 py-5 md:py-6 border-b border-border bg-card flex items-center justify-between gap-4">
      <h1 className="font-display text-xl md:text-3xl text-foreground truncate min-w-0">{title}</h1>
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <PortalSwitcher />
          <NotificationBell />
        </div>
        {action}
      </div>
    </header>
    <div className="p-4 md:p-10">{children}</div>
  </>
);
