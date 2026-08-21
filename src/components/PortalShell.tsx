import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Menu, X, User } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { PortalSwitcher } from "@/components/PortalSwitcher";
import { ImpersonateMenu } from "@/components/ImpersonateMenu";
import { CoreLogo } from "@/components/CoreLogo";
import { ThemeToggle } from "@/components/ThemeToggle";

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
  const [open, setOpen] = useState(false);

  const sidebar = (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border h-full">
      <div className="px-6 py-7 border-b border-sidebar-border flex items-center justify-between">
        <div>
          <CoreLogo className="h-7" />
          <div className="text-xs uppercase tracking-[0.2em] text-sidebar-foreground/60 mt-1">{subtitle}</div>
        </div>
        <button
          className="md:hidden text-sidebar-foreground/70 p-1"
          onClick={() => setOpen(false)}
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const active = loc.pathname === item.to;
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
              {item.icon}
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
      {/* Desktop sidebar */}
      <div className="hidden md:flex shrink-0">{sidebar}</div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative z-10">{sidebar}</div>
        </div>
      )}

      <main className="flex-1 min-w-0 overflow-auto">
        <header className="px-5 md:px-10 py-5 md:py-7 border-b border-border bg-card flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="md:hidden p-1.5 -ml-1 rounded-md hover:bg-subtle"
              onClick={() => setOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-display text-xl md:text-3xl text-foreground truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-foreground shrink-0">
            <ThemeToggle />
            <PortalSwitcher />
            <ImpersonateMenu />
            <NotificationBell />
          </div>
        </header>
        <div className="p-4 md:p-10">{children}</div>
      </main>
    </div>
  );
};
