// RAG agent powered by Vercel AI SDK + Lovable AI Gateway (OpenAI-compatible).
// Uses tool-calling (structured Supabase queries) AND vector search over documents.
// Each user only sees what their RLS allows — we run all queries with the user's JWT.

import { createOpenAI } from "npm:@ai-sdk/openai@3.0.53";
import { streamText, tool, convertToModelMessages, stepCountIs } from "npm:ai@6.0.168";
import { z } from "npm:zod@4.3.6";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const lovable = createOpenAI({
  apiKey: LOVABLE_API_KEY,
  baseURL: "https://ai.gateway.lovable.dev/v1",
});

async function embedQuery(text: string): Promise<number[]> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "openai/text-embedding-3-small", input: text }),
  });
  if (!res.ok) throw new Error(`embed failed: ${res.status}`);
  const data = await res.json();
  return data.data[0].embedding;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // User-scoped client — every query honours RLS
    const supa = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: auth } },
    });
    const { data: { user } } = await supa.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleRows } = await supa.from("user_roles").select("role").eq("user_id", user.id);
    const roles = (roleRows ?? []).map((r: any) => r.role);
    const role = roles.includes("admin") ? "admin" : roles.includes("investor") ? "investor" : roles.includes("customer") ? "customer" : "guest";

    const { messages } = await req.json();

    // ============= TOOLS =============
    const tools = {
      search_documents: tool({
        description: "Búsqueda semántica en documentos a los que el usuario tiene acceso (contratos, planos, prospectos, reportes). Devuelve fragmentos relevantes.",
        inputSchema: z.object({
          query: z.string().describe("Consulta en lenguaje natural"),
          k: z.number().int().min(1).max(10).default(5),
        }),
        execute: async ({ query, k }) => {
          const embedding = await embedQuery(query);
          const { data, error } = await supa.rpc("match_document_chunks", {
            query_embedding: embedding as any,
            match_count: k,
          });
          if (error) return { error: error.message };
          return { matches: data ?? [] };
        },
      }),
      get_my_portfolio: tool({
        description: "Resumen del portafolio del inversionista autenticado: total invertido, distribuciones, ROI, proyectos.",
        inputSchema: z.object({}),
        execute: async () => {
          const { data: investors } = await supa.from("investors").select("id").eq("user_id", user.id);
          const ids = (investors ?? []).map((i: any) => i.id);
          if (ids.length === 0) return { message: "No estás registrado como inversionista." };
          const { data: investments } = await supa.from("investments").select("*").in("investor_id", ids);
          const invIds = (investments ?? []).map((i: any) => i.id);
          const { data: distributions } = invIds.length
            ? await supa.from("distributions").select("*").in("investment_id", invIds)
            : { data: [] };
          const totalInvested = (investments ?? []).reduce((s, r: any) => s + Number(r.amount_invested || 0), 0);
          const totalDist = (distributions ?? []).reduce((s, r: any) => s + Number(r.amount || 0), 0);
          return {
            totalInvested,
            totalDistributions: totalDist,
            roiPercent: totalInvested > 0 ? (totalDist / totalInvested) * 100 : 0,
            investmentCount: (investments ?? []).length,
            investments,
          };
        },
      }),
      get_project_progress: tool({
        description: "Avance de obra (fases) de los proyectos en los que el usuario participa.",
        inputSchema: z.object({ projectName: z.string().optional() }),
        execute: async ({ projectName }) => {
          let q = supa.from("projects").select("id, name, status, estimated_delivery, project_phases(phase_name, completion_percentage, estimated_end, actual_end)");
          if (projectName) q = q.ilike("name", `%${projectName}%`);
          const { data, error } = await q;
          if (error) return { error: error.message };
          return { projects: data };
        },
      }),
      get_my_payments: tool({
        description: "Plan de pagos del cliente: cuotas, fechas, estado (pendiente/pagado/vencido) y próximo pago.",
        inputSchema: z.object({}),
        execute: async () => {
          const { data: customers } = await supa.from("customers").select("id").eq("user_id", user.id);
          const cIds = (customers ?? []).map((c: any) => c.id);
          if (cIds.length === 0) return { message: "No estás registrado como cliente." };
          const { data: sales } = await supa.from("sales").select("id, unit_id, price_agreed").in("customer_id", cIds);
          const sIds = (sales ?? []).map((s: any) => s.id);
          const { data: payments } = sIds.length
            ? await supa.from("payments").select("*").in("sale_id", sIds).order("due_date")
            : { data: [] };
          const now = new Date().toISOString().slice(0, 10);
          const next = (payments ?? []).find((p: any) => p.status === "pending" && p.due_date >= now);
          return { sales, payments, nextPayment: next ?? null };
        },
      }),
      get_my_distributions: tool({
        description: "Histórico de distribuciones recibidas por el inversionista.",
        inputSchema: z.object({}),
        execute: async () => {
          const { data: investors } = await supa.from("investors").select("id").eq("user_id", user.id);
          const ids = (investors ?? []).map((i: any) => i.id);
          if (ids.length === 0) return { distributions: [] };
          const { data: investments } = await supa.from("investments").select("id, project_id").in("investor_id", ids);
          const invIds = (investments ?? []).map((i: any) => i.id);
          const { data } = invIds.length
            ? await supa.from("distributions").select("*").in("investment_id", invIds).order("distribution_date", { ascending: false })
            : { data: [] };
          return { distributions: data };
        },
      }),
    };

    const systemPrompt = `Eres el Asistente Financiero de Core, una plataforma inmobiliaria.
Rol del usuario actual: **${role}**.
ID del usuario: ${user.id}.

Reglas:
- Toda consulta a datos respeta automáticamente RLS: solo verás lo que el usuario puede ver.
- Cuando el usuario pregunte sobre números (ROI, pagos, distribuciones), USA las tools y cita los datos exactos.
- Para preguntas sobre contratos, planos o documentos, USA search_documents y cita el contenido encontrado.
- Si una tool devuelve vacío o el usuario no tiene rol, dilo claramente y sugiere contactar al equipo Core.
- Responde en español, en formato markdown claro, con tablas cuando aplique.
- Nunca inventes números: si no los tienes, dilo.`;

    const result = streamText({
      model: lovable("openai/gpt-5-mini"),
      system: systemPrompt,
      messages: convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(6),
    });

    return result.toUIMessageStreamResponse({
      headers: corsHeaders,
    });
  } catch (e: any) {
    console.error("rag-agent error:", e);
    const msg = String(e?.message ?? e);
    const status = msg.includes("429") ? 429 : msg.includes("402") ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
