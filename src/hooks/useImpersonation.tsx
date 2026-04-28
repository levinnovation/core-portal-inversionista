import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

export type ImpersonationKind = "investor" | "customer";

export interface ImpersonationTarget {
  kind: ImpersonationKind;
  /** investors.id or customers.id */
  recordId: string;
  /** display name for the badge */
  name: string;
}

interface Ctx {
  target: ImpersonationTarget | null;
  setTarget: (t: ImpersonationTarget | null) => void;
  clear: () => void;
}

const ImpersonationCtx = createContext<Ctx>({} as Ctx);

const STORAGE_KEY = "core.impersonation.v1";

export const ImpersonationProvider = ({ children }: { children: ReactNode }) => {
  const [target, setTargetState] = useState<ImpersonationTarget | null>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ImpersonationTarget) : null;
    } catch {
      return null;
    }
  });

  const setTarget = useCallback((t: ImpersonationTarget | null) => {
    setTargetState(t);
    try {
      if (t) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(t));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const clear = useCallback(() => setTarget(null), [setTarget]);

  // Listen for cross-tab clears (e.g. on sign out)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && !e.newValue) setTargetState(null);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <ImpersonationCtx.Provider value={{ target, setTarget, clear }}>{children}</ImpersonationCtx.Provider>
  );
};

export const useImpersonation = () => useContext(ImpersonationCtx);
