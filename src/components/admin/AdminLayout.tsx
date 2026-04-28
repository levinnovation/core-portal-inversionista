import { Link, useLocation, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  LogOut, LayoutDashboard, Building2, Users, ShoppingBag,
  Upload, RefreshCw, Bot, BarChart3,
} from "lucide-react";
import { ReactNode } from "react";

const nav = [
  { to: "/admin", label: "Resumen", icon: LayoutDashboard, end: true },
  { to: "/admin/proyectos", label: "Proyectos", icon: Building2 },
  { to: "/admin/inversionistas", label: "Inversionistas", icon: Users },
  { to: "/admin/clientes", label: "Clientes", icon: ShoppingBag },
  { to: "/admin/excel", label: "Carga Excel", icon: Upload },
  { to: "/admin/quickbase", label: "QuickBase", icon: RefreshCw },
  { to: "/admin/agentes", label: "Agentes AI", icon: Bot },
  { to: "/admin/reportes", label: "Reportes", icon: BarChart3 },
];

export const AdminLayout = ({ children }: { children?: ReactNode }) => {
  const { signOut, user } = useAuth();
  const loc = useLocation();

  const isActive = (to: string, end?: boolean) =>
    end ? loc.pathname === to : loc.pathname === to || loc.pathname.startsWith(to + "/");

  return (
    <div className="min-h-screen flex bg-subtle">
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border shrink-0">
        <div className="px-6 py-7 border-b border-sidebar-border">
          <div className="font-display text-2xl text-accent tracking-tight">CORE</div>
          <div className="text-xs uppercase tracking-[0.2em] text-sidebar-foreground/60 mt-1">Equipo Core</div>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to, item.end);
            return (
              <Link
                key={item.to}
                to={item.to}
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
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-foreground/60 truncate mb-2">{user?.email}</div>
          <Button variant="ghost" size="sm" onClick={signOut} className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent">
            <LogOut className="h-4 w-4 mr-2" /> Cerrar sesión
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children ?? <Outlet />}
      </main>
    </div>
  );
};

export const AdminPage = ({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) => (
  <>
    <header className="px-10 py-6 border-b border-border bg-card flex items-center justify-between gap-4">
      <h1 className="font-display text-3xl text-foreground">{title}</h1>
      {action}
    </header>
    <div className="p-10">{children}</div>
  </>
);
