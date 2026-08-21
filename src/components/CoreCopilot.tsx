import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, Wrench, Minus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

type Scope = "guest" | "investor" | "customer" | "admin";

const COPY: Record<Scope, { title: string; subtitle: string; suggestions: string[] }> = {
  guest: {
    title: "Core Copilot",
    subtitle: "Información pública de los proyectos Core.",
    suggestions: [
      "¿Qué proyectos tiene Core hoy?",
      "¿Cómo funciona Babylon como apart-hotel?",
      "¿Cómo solicito acceso al portal?",
      "¿Qué es PortalCore?",
    ],
  },
  investor: {
    title: "Core Copilot",
    subtitle: "Tu portafolio, distribuciones e informes.",
    suggestions: [
      "¿Cómo va mi portafolio?",
      "¿Cuánto he recibido en distribuciones?",
      "Explícame la TIR de SIIX Nunciatura",
      "¿Cómo va la obra de mis proyectos?",
    ],
  },
  customer: {
    title: "Core Copilot",
    subtitle: "Tu unidad, pagos y avance de obra.",
    suggestions: [
      "¿Cuál es mi próximo pago?",
      "¿Cómo va la obra de mi proyecto?",
      "Detalles de mi unidad",
      "¿Tengo cuotas vencidas?",
    ],
  },
  admin: {
    title: "Core Copilot",
    subtitle: "KPIs, inversionistas, clientes y leads.",
    suggestions: [
      "Dame los KPIs del portafolio",
      "¿Cuánto hay en mora hoy?",
      "Busca al inversionista Alejandra",
      "Resumen del informe de Babylon",
    ],
  },
};

export const CoreCopilot = () => {
  const { primaryRole } = useAuth();
  const location = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const tokenRef = useRef<string | null>(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      tokenRef.current = data.session?.access_token ?? null;
      setToken(tokenRef.current);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      tokenRef.current = session?.access_token ?? null;
      setToken(tokenRef.current);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // El alcance real lo decide el backend con el JWT; esto es sólo copy/sugerencias.
  const scope: Scope = useMemo(() => {
    if (!token) return "guest";
    if (location.pathname.startsWith("/admin")) return "admin";
    if (location.pathname.startsWith("/clientes")) return "customer";
    if (location.pathname.startsWith("/inversionistas")) return "investor";
    return (primaryRole as Scope) ?? "guest";
  }, [token, primaryRole, location.pathname]);

  const copy = COPY[scope];

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/core-copilot`,
        headers: () =>
          tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {},
      }),
    [],
  );

  const { messages, sendMessage, status, error } = useChat({ transport });


  const busy = status === "streaming" || status === "submitted";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, busy]);

  const submit = (text: string) => {
    if (!text.trim() || busy) return;
    sendMessage({ text });
    setInput("");
  };

  const markdownComponents = {
    p: (p: any) => <p className="my-1.5 leading-relaxed" {...p} />,
    strong: (p: any) => <strong className="font-semibold text-foreground" {...p} />,
    ul: (p: any) => <ul className="my-1.5 list-disc pl-4 space-y-1" {...p} />,
    ol: (p: any) => <ol className="my-1.5 list-decimal pl-4 space-y-1" {...p} />,
    li: (p: any) => <li className="leading-relaxed" {...p} />,
    h1: (p: any) => <h1 className="font-display text-base mt-3 mb-1.5" {...p} />,
    h2: (p: any) => <h2 className="font-display text-base mt-3 mb-1.5" {...p} />,
    h3: (p: any) => <h3 className="font-display text-sm mt-3 mb-1.5" {...p} />,
    a: (p: any) => <a className="text-accent underline underline-offset-2" target="_blank" rel="noreferrer" {...p} />,
    hr: () => <hr className="my-3 border-border" />,
    blockquote: (p: any) => (
      <blockquote className="border-l-2 border-accent/50 pl-3 my-2 text-muted-foreground" {...p} />
    ),
    code: ({ inline, className, children, ...rest }: any) =>
      inline ? (
        <code className="rounded bg-subtle px-1 py-0.5 text-[12px] font-mono" {...rest}>{children}</code>
      ) : (
        <pre className="my-2 overflow-x-auto rounded-md bg-subtle border border-border p-2.5">
          <code className="text-[12px] font-mono leading-relaxed" {...rest}>{children}</code>
        </pre>
      ),
    table: (p: any) => (
      <div className="my-2 -mx-1 overflow-x-auto">
        <table className="w-full text-[12px] border-collapse" {...p} />
      </div>
    ),
    thead: (p: any) => <thead className="bg-subtle" {...p} />,
    th: (p: any) => (
      <th className="border border-border px-2 py-1 text-left font-medium whitespace-nowrap" {...p} />
    ),
    td: (p: any) => <td className="border border-border px-2 py-1 align-top" {...p} />,
  };

  const renderPart = (part: any, idx: number) => {
    if (part.type === "text") {
      return (
        <div key={idx} className="text-sm break-words [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {part.text}
          </ReactMarkdown>
        </div>
      );
    }
    if (part.type?.startsWith?.("tool-")) {
      const toolName = part.type.replace(/^tool-/, "");
      return (
        <div key={idx} className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5 bg-subtle border border-border rounded px-2 py-1 my-1">
          <Wrench className="h-3 w-3" />
          <span className="font-mono">{toolName}</span>
          {part.state === "output-available" ? <span className="opacity-70">✓</span> : null}
          {part.state === "output-error" ? <span className="text-destructive">error</span> : null}
          {part.state === "input-streaming" || part.state === "input-available" ? <span className="opacity-70">consultando…</span> : null}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir Core Copilot"
          className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Sparkles className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div
          className={cn(
            "fixed z-50 bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden",
            "inset-x-3 bottom-3 top-16 sm:inset-auto sm:bottom-5 sm:right-5 sm:top-auto sm:w-[400px] sm:h-[600px] sm:max-h-[calc(100vh-3rem)]",
          )}
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-subtle">
            <div className="h-9 w-9 rounded-full bg-accent/15 text-accent flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="font-display text-base leading-tight truncate">{copy.title}</div>
              <div className="text-xs text-muted-foreground truncate">{copy.subtitle}</div>
            </div>
            <Button variant="ghost" size="icon" aria-label="Minimizar" onClick={() => setOpen(false)}>
              <Minus className="h-4 w-4" />
            </Button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {scope === "guest"
                    ? "Preguntá sobre los proyectos de Core o pedí acceso al portal."
                    : "Preguntá sobre tu información dentro del portal."}
                </p>
                {copy.suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="block w-full text-left text-sm p-2.5 rounded-md border border-border hover:border-accent hover:bg-accent/5 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={cn(
                      "max-w-[90%] rounded-lg px-3 py-2 text-sm",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground",
                    )}
                  >
                    {m.parts?.map(renderPart) ?? null}
                  </div>
                </div>
              ))
            )}
            {busy && messages[messages.length - 1]?.role === "user" && (
              <div className="text-sm text-muted-foreground animate-pulse">Pensando…</div>
            )}
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-3">
                {error.message ?? "No pude responder en este momento."}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); submit(input); }}
            className="p-3 border-t border-border flex gap-2"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribí tu pregunta…"
              disabled={busy}
            />
            <Button type="submit" size="icon" disabled={busy || !input.trim()} aria-label="Enviar">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
};
