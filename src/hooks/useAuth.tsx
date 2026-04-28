import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "investor" | "customer";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  loading: boolean;
  rolesLoading: boolean;
  rolesError: string | null;
  signOut: () => Promise<void>;
  refreshRoles: () => Promise<AppRole[]>;
  primaryRole: AppRole | null;
}

const Ctx = createContext<AuthCtx>({} as AuthCtx);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);

  const fetchRoles = useCallback(async (userId: string): Promise<AppRole[]> => {
    setRolesLoading(true);
    setRolesError(null);
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    setRolesLoading(false);
    if (error) {
      setRolesError(error.message);
      return [];
    }
    const next = (data ?? []).map((r: any) => r.role as AppRole);
    setRoles(next);
    return next;
  }, []);

  const refreshRoles = useCallback(async () => {
    if (!user) return [];
    return fetchRoles(user.id);
  }, [user, fetchRoles]);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        setTimeout(() => fetchRoles(sess.user.id), 0);
      } else {
        setRoles([]);
        setRolesError(null);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchRoles(session.user.id);
      }
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, [fetchRoles]);

  const signOut = async () => {
    try {
      sessionStorage.removeItem("core.impersonation.v1");
    } catch { /* ignore */ }
    await supabase.auth.signOut();
  };

  const primaryRole: AppRole | null =
    roles.includes("admin") ? "admin" :
    roles.includes("investor") ? "investor" :
    roles.includes("customer") ? "customer" : null;

  return (
    <Ctx.Provider
      value={{
        user,
        session,
        roles,
        loading,
        rolesLoading,
        rolesError,
        signOut,
        refreshRoles,
        primaryRole,
      }}
    >
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);
