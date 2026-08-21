import coreLogo from "@/assets/core-logo.png.asset.json";
import { cn } from "@/lib/utils";

/** Logotipo oficial de Core (marca "C" amarilla + wordmark blanco). */
export const CoreLogo = ({ className }: { className?: string }) => (
  <img src={coreLogo.url} alt="Core" className={cn("h-8 w-auto object-contain", className)} />
);

/**
 * El wordmark es blanco: sobre superficies claras debe ir siempre dentro de
 * una pastilla negra para conservar contraste.
 */
export const CoreLogoBadge = ({
  className,
  boxClassName,
}: {
  className?: string;
  boxClassName?: string;
}) => (
  <span
    className={cn(
      "inline-flex items-center rounded-md bg-[#0d0d0d] px-2.5 py-1.5",
      boxClassName,
    )}
  >
    <CoreLogo className={className} />
  </span>
);

export default CoreLogo;
