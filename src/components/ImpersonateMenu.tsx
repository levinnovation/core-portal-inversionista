import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useImpersonation, ImpersonationKind } from "@/hooks/useImpersonation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { UserCog, X, Check } from "lucide-react";

interface Row {
  id: string;
  full_name: string;
  email: string | null;
}

/**
 * Admin-only. Lets a super-admin impersonate any investor or customer
 * record so the dashboards render that user's data instead of the
 * admin's own (empty) data.
 *
 * The impersonation context is read by loadPortfolio / loadCustomerData
 * via an override id — RLS still allows the queries because admins have
 * "manage all" policies on these tables.
 */
export const ImpersonateMenu = () => {
  const { roles } = useAuth();
  const { target, setTarget, clear } = useImpersonation();
  const loc = useLocation();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  // Decide which entity list to show based on the current portal route.
  const kind: ImpersonationKind | null = loc.pathname.startsWith("/inversionistas")
    ? "investor"
    : loc.pathname.startsWith("/clientes")
    ? "customer"
    : null;

  const isAdmin = roles.includes("admin");

  useEffect(() => {
    if (!isAdmin || !kind) return;
    setLoading(true);
    const table = kind === "investor" ? "investors" : "customers";
    supabase
      .from(table)
      .select("id, full_name, email")
      .order("full_name")
      .then(({ data }) => {
        setRows((data as Row[]) ?? []);
        setLoading(false);
      });
  }, [isAdmin, kind]);

  if (!isAdmin || !kind) return null;

  const label = kind === "investor" ? "inversionista" : "cliente";

  return (
    <div className="flex items-center gap-2">
      {target && target.kind === kind && (
        <Badge variant="secondary" className="gap-1.5 hidden md:inline-flex">
          Viendo como: <span className="font-semibold">{target.name}</span>
          <button onClick={clear} aria-label="Salir de impersonación" className="ml-1 hover:text-destructive">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <UserCog className="h-4 w-4" />
            <span className="hidden sm:inline">Impersonar</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 max-h-[70vh] overflow-y-auto bg-popover">
          <DropdownMenuLabel>Ver portal como otro {label}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {target && target.kind === kind && (
            <>
              <DropdownMenuItem onClick={clear} className="text-destructive focus:text-destructive">
                <X className="h-4 w-4 mr-2" /> Salir de impersonación
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {loading && (
            <div className="px-2 py-3 text-xs text-muted-foreground">Cargando…</div>
          )}
          {!loading && rows.length === 0 && (
            <div className="px-2 py-3 text-xs text-muted-foreground">
              No hay {label}s registrados.
            </div>
          )}
          {rows.map((r) => {
            const active = target?.kind === kind && target.recordId === r.id;
            return (
              <DropdownMenuItem
                key={r.id}
                onClick={() => setTarget({ kind, recordId: r.id, name: r.full_name })}
                className="flex items-start gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{r.full_name}</div>
                  {r.email && (
                    <div className="text-xs text-muted-foreground truncate">{r.email}</div>
                  )}
                </div>
                {active && <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
