import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";

interface NavItem { to: string; label: string; icon?: ReactNode }

interface Props {
  title: string;
  subtitle: string;
  nav: NavItem[];
  children: ReactNode;
}

export const PortalShell = ({ title, subtitle, nav, children }: Props) => {
  const { signOut, user } = useAuth();
  const loc = useLocation();

  return (
    <div className="min-h-screen flex bg-subtle">
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
        <div className="px-6 py-7 border-b border-sidebar-border">
          <div className="font-display text-2xl text-accent tracking-tight">CORE</div>
          <div className="text-xs uppercase tracking-[0.2em] text-sidebar-foreground/60 mt-1">{subtitle}</div>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-1">
          {nav.map((item) => {
            const active = loc.pathname === item.to;
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
                {item.icon}
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
        <header className="px-10 py-7 border-b border-border bg-card">
          <h1 className="font-display text-3xl text-foreground">{title}</h1>
        </header>
        <div className="p-10">{children}</div>
      </main>
    </div>
  );
};
