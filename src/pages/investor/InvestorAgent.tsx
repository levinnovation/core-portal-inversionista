import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "¿Cuál es mi ROI actual?",
  "¿Cuándo es mi próxima distribución estimada?",
  "Resume el avance de mis proyectos",
  "¿Cómo se compara mi rendimiento contra el mercado?",
];

const InvestorAgent = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load chat history (last 50)
  useEffect(() => {
    if (!user) return;
    supabase
      .from("ai_chat_messages")
      .select("role, content")
      .eq("user_id", user.id)
      .eq("agent", "investor")
      .order("created_at", { ascending: true })
      .limit(50)
      .then(({ data }) => {
        if (data && data.length) {
          setMessages(data.map((m: any) => ({ role: m.role, content: m.content })));
        }
      });
  }, [user]);

  const persist = async (role: "user" | "assistant", content: string) => {
    if (!user) return;
    await supabase.from("ai_chat_messages").insert({
      user_id: user.id,
      agent: "investor",
      role,
      content,
    });
  };

  const send = async (text: string) => {
    if (!text.trim() || streaming) return;
    const newMessages: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);
    persist("user", text);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/investor-agent`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Error desconocido" }));
        toast.error(err.error || "Error al consultar al agente");
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistant = "";
      setMessages([...newMessages, { role: "assistant", content: "" }]);
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistant += delta;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: assistant };
                return copy;
              });
              scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
            }
          } catch {/* ignore */}
        }
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-card flex flex-col h-[calc(100vh-220px)]">
      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-xl">Agente Financiero Core</h3>
          <p className="text-sm text-muted-foreground">Pregunta sobre tu portafolio, rendimientos o proyectos.</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Sugerencias para empezar:</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left text-sm p-3 rounded-md border border-border hover:border-accent hover:bg-accent/5 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-subtle border border-border text-foreground"
                }`}
              >
                {m.content || <span className="opacity-60">…</span>}
              </div>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="p-4 border-t border-border flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu pregunta…"
          disabled={streaming}
        />
        <Button type="submit" disabled={streaming || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default InvestorAgent;
