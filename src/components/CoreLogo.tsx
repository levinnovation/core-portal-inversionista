import coreLogo from "@/assets/core-logo.png.asset.json";
import { cn } from "@/lib/utils";

/** Logotipo oficial de Core (marca "C" amarilla + wordmark blanco). */
export const CoreLogo = ({ className }: { className?: string }) => (
  <img src={coreLogo.url} alt="Core" className={cn("h-8 w-auto object-contain", className)} />
);

export default CoreLogo;
