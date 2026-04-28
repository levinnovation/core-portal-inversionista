import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Notif {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  type: string;
  read_at: string | null;
  created_at: string;
}

export const NotificationBell = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Notif[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => setItems((data ?? []) as Notif[]));

    const channel = supabase.channel(`notif-${user.id}-${Math.random().toString(36).slice(2)}`);
    channel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => {
          supabase
            .from("notifications")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(20)
            .then(({ data }) => setItems((data ?? []) as Notif[]));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const unread = items.filter((n) => !n.read_at).length;

  const markAll = async () => {
    if (!user || unread === 0) return;
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .is("read_at", null)
      .eq("user_id", user.id);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label="Notificaciones"
          className="relative p-2 rounded-md text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-[10px] font-semibold text-accent-foreground flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <span className="font-medium text-sm">Notificaciones</span>
          <Button variant="ghost" size="sm" onClick={markAll} disabled={unread === 0} className="h-7 text-xs">
            <CheckCheck className="h-3.5 w-3.5 mr-1" /> Marcar leídas
          </Button>
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Sin notificaciones</div>
          ) : (
            items.map((n) => {
              const body = (
                <div
                  className={`p-3 border-b border-border/60 last:border-0 hover:bg-subtle transition-colors ${
                    !n.read_at ? "bg-accent/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.read_at && <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{n.title}</div>
                      {n.body && <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.body}</div>}
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {new Date(n.created_at).toLocaleString("es-CO")}
                      </div>
                    </div>
                  </div>
                </div>
              );
              return n.link ? (
                <Link key={n.id} to={n.link}>{body}</Link>
              ) : (
                <div key={n.id}>{body}</div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
