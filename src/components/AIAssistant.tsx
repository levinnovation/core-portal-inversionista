import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Wrench } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Props {
  title?: string;
  subtitle?: string;
  suggestions?: string[];
}

export const AIAssistant = ({
  title = "Asistente Core AI",
  subtitle = "Pregunta sobre tus datos y documentos.",
  suggestions = [],
}: Props) => {
  const [token, setToken] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setToken(data.session?.access_token ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setToken(session?.access_token ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rag-agent`,
      headers: () => (token ? { Authorization: `Bearer ${token}` } : {}),
    }),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const submit = (text: string) => {
    if (!text.trim() || status === "streaming" || status === "submitted") return;
    sendMessage({ text });
    setInput("");
  };

  const renderPart = (part: any, idx: number) => {
    if (part.type === "text") {
      return (
        <div key={idx} className="prose prose-sm max-w-none prose-p:my-2 prose-headings:font-display">
          <ReactMarkdown>{part.text}</ReactMarkdown>
        </div>
      );
    }
    if (part.type?.startsWith?.("tool-")) {
      const toolName = part.type.replace(/^tool-/, "");
      const state = part.state;
      return (
        <div key={idx} className="text-xs text-muted-foreground inline-flex items-center gap-1.5 bg-subtle border border-border rounded px-2 py-1 my-1">
          <Wrench className="h-3 w-3" />
          <span className="font-mono">{toolName}</span>
          {state === "input-streaming" || state === "input-available" ? <span className="opacity-70">consultando…</span> : null}
          {state === "output-available" ? <span className="opacity-70">✓</span> : null}
          {state === "output-error" ? <span className="text-destructive">error</span> : null}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-card flex flex-col h-[calc(100vh-220px)] min-h-[500px]">
      <div className="p-5 border-b border-border flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-xl">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Sugerencias:</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="text-left text-sm p-3 rounded-md border border-border hover:border-accent hover:bg-accent/5 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-lg px-4 py-3 text-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-subtle border border-border text-foreground"
                }`}
              >
                {m.parts?.map(renderPart) ?? null}
              </div>
            </div>
          ))
        )}
        {(status === "submitted" || status === "streaming") && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="bg-subtle border border-border rounded-lg px-4 py-3 text-sm text-muted-foreground">
              Pensando…
            </div>
          </div>
        )}
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-3">
            {error.message ?? "Error al consultar al agente"}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); submit(input); }}
        className="p-4 border-t border-border flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu pregunta…"
          disabled={status === "streaming" || status === "submitted"}
        />
        <Button type="submit" disabled={status === "streaming" || status === "submitted" || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};
