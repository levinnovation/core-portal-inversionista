import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ArrowLeftRight, ShieldCheck, Briefcase, ShoppingBag } from "lucide-react";

/**
 * Visible only for admins. Lets the master/admin user jump between
 * the Admin, Investor and Customer portals.
 */
export const PortalSwitcher = () => {
  const { roles } = useAuth();
  const nav = useNavigate();
  if (!roles.includes("admin")) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowLeftRight className="h-4 w-4" />
          <span className="hidden sm:inline">Cambiar portal</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover">
        <DropdownMenuLabel>Vista de portal</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => nav("/admin")}>
          <ShieldCheck className="h-4 w-4 mr-2" /> Admin (Core)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => nav("/inversionistas")}>
          <Briefcase className="h-4 w-4 mr-2" /> Inversionistas
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => nav("/clientes")}>
          <ShoppingBag className="h-4 w-4 mr-2" /> Clientes
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
