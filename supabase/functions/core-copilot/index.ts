// Core Copilot — asistente global (burbuja) con permisos por rol.
// - Invitado (landing pública): sólo información publicada por Core + captura de lead.
// - Inversionista / Cliente / Admin: tools sobre sus propios datos, ejecutadas con su JWT (RLS).

import { createOpenAICompatible } from "npm:@ai-sdk/openai-compatible@2.0.70";
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

const gateway = createOpenAICompatible({
  name: "lovable",
  baseURL: "https://ai.gateway.lovable.dev/v1",
  headers: {
    "Lovable-API-Key": LOVABLE_API_KEY,
    "X-Lovable-AIG-SDK": "vercel-ai-sdk",
  },
});

/** Catálogo público — sólo información que Core publica en sus sitios. */
const PUBLIC_CATALOG = [
  { name: "Babylon", zona: "Nunciatura, San José", etapa: "En comercialización", tipo: "Apart-hotel", modelo: "Renta corta administrada por Core", detalle: "Unidades de 41.70 m² a 67.70 m². A 12 km del Aeropuerto Juan Santamaría." },
  { name: "SIIX Nunciatura", zona: "Nunciatura, San José", etapa: "En comercialización", tipo: "Residencial urbano", modelo: "Habitar o rentar", detalle: "Torre residencial en el clúster urbano de Nunciatura." },
  { name: "URBN Nunciatura", zona: "Nunciatura, San José", etapa: "En comercialización", tipo: "Residencial urbano", modelo: "Habitar o rentar", detalle: "Estilo de vida urbano, inspirado en ciudades cosmopolitas." },
  { name: "SECRT Escalante", zona: "Barrio Escalante, San José", etapa: "En comercialización", tipo: "Residencial urbano", modelo: "Habitar o rentar", detalle: "Vida de barrio en el distrito gastronómico de Escalante." },
  { name: "SLVA Guachipelín", zona: "Guachipelín, Escazú", etapa: "Últimas unidades", tipo: "Hospitality / residencial", modelo: "Renta administrada", detalle: "Proyecto entregado, en cierre de inventario." },
  { name: "URBN Escalante", zona: "Barrio Escalante, San José", etapa: "Vendido", tipo: "Residencial urbano", modelo: "—", detalle: "Proyecto Core ya vendido." },
  { name: "Cosmopolitan Tower", zona: "San José", etapa: "Vendido", tipo: "Residencial urbano", modelo: "—", detalle: "Proyecto Core ya vendido." },
  { name: "SECRT Sabana", zona: "Sabana, San José", etapa: "Vendido", tipo: "Residencial urbano", modelo: "—", detalle: "Proyecto Core ya vendido." },
  { name: "Metropolitan Tower", zona: "San José", etapa: "Vendido", tipo: "Residencial urbano", modelo: "—", detalle: "Proyecto Core ya vendido." },
];

const PUBLIC_FAQ = [
  { q: "¿Quién puede invertir con Core?", a: "Cualquier persona interesada que complete la verificación de identidad y cumplimiento. El equipo revisa cada solicitud de acceso." },
  { q: "¿Publican retornos objetivo?", a: "No públicamente. Las condiciones económicas de cada proyecto se conversan con el equipo comercial y quedan en el expediente dentro del portal." },
  { q: "¿Qué es PortalCore?", a: "La plataforma privada donde cada inversionista y comprador da seguimiento a su inversión, sus pagos y el avance de obra. core.cr es el sitio de marca." },
  { q: "¿Cómo se calculan las métricas del portal?", a: "TIR con XIRR sobre flujos reales fechados; Cash-on-Cash, Equity Multiple y NOI según el panel de metodología del portal." },
  { q: "Contacto", a: "inversiones@portalcore.app · San José, Costa Rica · Lunes a viernes 8:00–17:00 (GMT-6)." },
];

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
    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    let supa = anonClient;
    let user: { id: string; email?: string } | null = null;

    if (auth.startsWith("Bearer ") && auth.slice(7).split(".").length === 3) {
      const authed = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: auth } },
      });
      const { data } = await authed.auth.getUser();
      if (data?.user) {
        supa = authed;
        user = { id: data.user.id, email: data.user.email ?? undefined };
      }
    }

    let role: "admin" | "investor" | "customer" | "guest" = "guest";
    if (user) {
      const { data: roleRows } = await supa.from("user_roles").select("role").eq("user_id", user.id);
      const roles = (roleRows ?? []).map((r: any) => r.role);
      role = roles.includes("admin") ? "admin" : roles.includes("investor") ? "investor" : roles.includes("customer") ? "customer" : "guest";
    }

    const { messages } = await req.json();

    // ---------- Tools públicas (todos los roles, incl. invitado) ----------
    const publicTools: Record<string, any> = {
      list_public_projects: tool({
        description: "Catálogo público de proyectos Core (nombre, zona, etapa, tipo y modelo). Información publicada por Core, sin cifras de rendimiento.",
        inputSchema: z.object({ query: z.string().nullable().describe("Filtro opcional por nombre, zona o tipo") }),
        execute: async ({ query }) => {
          const q = (query ?? "").toLowerCase().trim();
          const items = q
            ? PUBLIC_CATALOG.filter((p) => `${p.name} ${p.zona} ${p.tipo} ${p.etapa}`.toLowerCase().includes(q))
            : PUBLIC_CATALOG;
          return { projects: items };
        },
      }),
      get_public_faq: tool({
        description: "Preguntas frecuentes públicas sobre Core, el proceso de acceso y la plataforma.",
        inputSchema: z.object({}),
        execute: async () => ({ faq: PUBLIC_FAQ }),
      }),
    };

    const guestTools: Record<string, any> = {
      ...publicTools,
      request_access: tool({
        description: "Registra una solicitud de acceso / contacto de un interesado. Pide siempre nombre y correo antes de usarla.",
        inputSchema: z.object({
          full_name: z.string(),
          email: z.string(),
          phone: z.string().nullable(),
          project_interest: z.string().nullable(),
          message: z.string().nullable(),
        }),
        needsApproval: false,
        execute: async ({ full_name, email, phone, project_interest, message }) => {
          const { error } = await anonClient.from("leads").insert({
            full_name: full_name.slice(0, 120),
            email: email.slice(0, 255),
            phone: phone?.slice(0, 40) ?? null,
            project_interest: project_interest?.slice(0, 120) ?? null,
            message: message?.slice(0, 1000) ?? null,
            source: "copilot",
          });
          if (error) return { ok: false, error: error.message };
          return { ok: true, message: "Solicitud registrada. Un ejecutivo de Core te contactará." };
        },
      }),
    };

    // ---------- Tools con datos privados (respetan RLS del usuario) ----------
    const searchDocs = tool({
      description: "Búsqueda semántica en los documentos a los que el usuario tiene acceso (contratos, informes, planos).",
      inputSchema: z.object({ query: z.string(), k: z.number().int().nullable() }),
      execute: async ({ query, k }) => {
        const embedding = await embedQuery(query);
        const { data, error } = await supa.rpc("match_document_chunks", {
          query_embedding: embedding as any,
          match_count: Math.min(Math.max(k ?? 5, 1), 10),
        });
        if (error) return { error: error.message };
        return { matches: data ?? [] };
      },
    });

    const investorTools: Record<string, any> = {
      ...publicTools,
      search_documents: searchDocs,
      get_my_portfolio: tool({
        description: "Portafolio del inversionista autenticado: capital invertido, distribuciones, ROI y proyectos.",
        inputSchema: z.object({}),
        execute: async () => {
          const { data: investors } = await supa.from("investors").select("id, full_name").eq("user_id", user!.id);
          const ids = (investors ?? []).map((i: any) => i.id);
          if (!ids.length) return { message: "El usuario no está registrado como inversionista." };
          const { data: investments } = await supa
            .from("investments")
            .select("id, project_id, amount_invested, investment_date, ownership_percentage, target_return_pct, projects(name)")
            .in("investor_id", ids);
          const invIds = (investments ?? []).map((i: any) => i.id);
          const { data: distributions } = invIds.length
            ? await supa.from("distributions").select("investment_id, amount, distribution_date, distribution_type").in("investment_id", invIds)
            : { data: [] as any[] };
          const totalInvested = (investments ?? []).reduce((s: number, r: any) => s + Number(r.amount_invested || 0), 0);
          const totalDist = (distributions ?? []).reduce((s: number, r: any) => s + Number(r.amount || 0), 0);
          return {
            totalInvested,
            totalDistributions: totalDist,
            roiPercent: totalInvested > 0 ? (totalDist / totalInvested) * 100 : 0,
            investments,
            distributions,
          };
        },
      }),
      get_project_report: tool({
        description: "Informe mensual de un proyecto donde el usuario es socio: proforma vs real, TIR, COC, ventas, avance de obra, hitos y riesgos.",
        inputSchema: z.object({ projectName: z.string() }),
        execute: async ({ projectName }) => {
          const { data: projects } = await supa.from("projects").select("id, name").ilike("name", `%${projectName}%`);
          if (!projects?.length) return { message: "No se encontró un proyecto con ese nombre entre los accesibles." };
          const ids = projects.map((p: any) => p.id);
          const { data: reports } = await supa
            .from("project_reports")
            .select("*, project_report_items(*)")
            .in("project_id", ids)
            .order("report_date", { ascending: false })
            .limit(1);
          return { project: projects[0], report: reports?.[0] ?? null };
        },
      }),
      get_project_progress: tool({
        description: "Avance de obra por fases de los proyectos accesibles al usuario.",
        inputSchema: z.object({ projectName: z.string().nullable() }),
        execute: async ({ projectName }) => {
          let q = supa.from("projects").select("id, name, status, estimated_delivery, project_phases(phase_name, completion_percentage, estimated_end, actual_end)");
          if (projectName) q = q.ilike("name", `%${projectName}%`);
          const { data, error } = await q;
          if (error) return { error: error.message };
          return { projects: data };
        },
      }),
    };

    const customerTools: Record<string, any> = {
      ...publicTools,
      search_documents: searchDocs,
      get_my_unit: tool({
        description: "Datos de la unidad comprada por el cliente: proyecto, número, área, precio acordado y estado de la venta.",
        inputSchema: z.object({}),
        execute: async () => {
          const { data: customers } = await supa.from("customers").select("id").eq("user_id", user!.id);
          const cIds = (customers ?? []).map((c: any) => c.id);
          if (!cIds.length) return { message: "El usuario no está registrado como cliente." };
          const { data } = await supa
            .from("sales")
            .select("id, price_agreed, status, sale_date, units(unit_number, area_m2, floor, status, projects(name, location, estimated_delivery))")
            .in("customer_id", cIds);
          return { sales: data };
        },
      }),
      get_my_payments: tool({
        description: "Plan de pagos del cliente: cuotas, fechas, montos, estado y próximo pago.",
        inputSchema: z.object({}),
        execute: async () => {
          const { data: customers } = await supa.from("customers").select("id").eq("user_id", user!.id);
          const cIds = (customers ?? []).map((c: any) => c.id);
          if (!cIds.length) return { message: "El usuario no está registrado como cliente." };
          const { data: sales } = await supa.from("sales").select("id").in("customer_id", cIds);
          const sIds = (sales ?? []).map((s: any) => s.id);
          const { data: payments } = sIds.length
            ? await supa.from("payments").select("*").in("sale_id", sIds).order("due_date")
            : { data: [] as any[] };
          const today = new Date().toISOString().slice(0, 10);
          const next = (payments ?? []).find((p: any) => p.status !== "paid" && p.due_date >= today);
          const overdue = (payments ?? []).filter((p: any) => p.status !== "paid" && p.due_date < today);
          return { payments, nextPayment: next ?? null, overdue };
        },
      }),
      get_construction_progress: tool({
        description: "Avance de obra del proyecto donde el cliente compró su unidad.",
        inputSchema: z.object({}),
        execute: async () => {
          const { data } = await supa
            .from("projects")
            .select("id, name, status, estimated_delivery, project_phases(phase_name, completion_percentage, estimated_end, actual_end)");
          return { projects: data };
        },
      }),
    };

    const adminTools: Record<string, any> = {
      ...publicTools,
      search_documents: searchDocs,
      get_portfolio_kpis: tool({
        description: "KPIs globales de Core: proyectos, capital comprometido, distribuciones pagadas, ventas y cobranza.",
        inputSchema: z.object({}),
        execute: async () => {
          const [projects, investments, distributions, sales, payments] = await Promise.all([
            supa.from("projects").select("id, name, status, total_budget, total_units"),
            supa.from("investments").select("amount_invested, project_id"),
            supa.from("distributions").select("amount"),
            supa.from("sales").select("price_agreed, status"),
            supa.from("payments").select("amount, status, due_date"),
          ]);
          const sum = (rows: any[] | null, k: string) => (rows ?? []).reduce((s, r) => s + Number(r[k] || 0), 0);
          const today = new Date().toISOString().slice(0, 10);
          return {
            projects: projects.data,
            capitalCommitted: sum(investments.data, "amount_invested"),
            distributionsPaid: sum(distributions.data, "amount"),
            salesValue: sum(sales.data, "price_agreed"),
            collected: sum((payments.data ?? []).filter((p: any) => p.status === "paid"), "amount"),
            overdue: sum((payments.data ?? []).filter((p: any) => p.status !== "paid" && p.due_date < today), "amount"),
          };
        },
      }),
      lookup_entity: tool({
        description: "Busca inversionistas, clientes o leads por nombre o correo y devuelve su información y posición.",
        inputSchema: z.object({
          kind: z.enum(["investor", "customer", "lead"]),
          query: z.string(),
        }),
        execute: async ({ kind, query }) => {
          if (kind === "investor") {
            const { data } = await supa
              .from("investors")
              .select("id, full_name, email, phone, investments(amount_invested, investment_date, target_return_pct, projects(name))")
              .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`);
            return { investors: data };
          }
          if (kind === "customer") {
            const { data } = await supa
              .from("customers")
              .select("id, full_name, email, phone, sales(price_agreed, status, units(unit_number, projects(name)))")
              .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`);
            return { customers: data };
          }
          const { data } = await supa
            .from("leads")
            .select("id, full_name, email, phone, project_interest, status, created_at")
            .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
            .order("created_at", { ascending: false })
            .limit(20);
          return { leads: data };
        },
      }),
      get_project_report: investorTools.get_project_report,
      get_project_progress: investorTools.get_project_progress,
    };

    const toolsByRole = { guest: guestTools, investor: investorTools, customer: customerTools, admin: adminTools } as const;
    const tools = toolsByRole[role];

    const scopeByRole: Record<typeof role, string> = {
      guest:
        "Es un visitante público. SOLO podés hablar de información publicada por Core (proyectos, zonas, modelo de negocio, proceso de acceso, FAQ). NUNCA compartas ni inventes retornos, TIR, precios internos, nombres de inversionistas ni datos de clientes. Si preguntan por cifras de rendimiento o disponibilidad exacta, explicá que eso se conversa con el equipo comercial y ofrecé registrar su solicitud de acceso con request_access (pedí nombre y correo primero).",
      investor:
        "Es un inversionista de Core. Podés consultar su portafolio, distribuciones, informes mensuales de sus proyectos y sus documentos. Explicá las métricas (TIR/XIRR, Cash-on-Cash, Equity Multiple, múltiplo de capital) con sus números reales y en lenguaje claro.",
      customer:
        "Es un cliente comprador. Podés consultar su unidad, su plan de pagos, el avance de obra de su proyecto y sus documentos. Sé claro con fechas, montos y estados de pago.",
      admin:
        "Es parte del equipo interno de Core con acceso total. Podés consultar KPIs globales, buscar inversionistas, clientes y leads, ver informes de proyecto y documentos. Sé preciso y ejecutivo.",
    };

    const systemPrompt = `Eres **Core Copilot**, el asistente de Core / PortalCore (desarrolladora inmobiliaria en Costa Rica).

Rol del usuario actual: **${role}**.
${scopeByRole[role]}

Reglas:
- Toda consulta a datos pasa por las tools y respeta el control de acceso (RLS): sólo ves lo que este usuario puede ver. Nunca intentes deducir datos de otros usuarios.
- Usá siempre las tools antes de dar cifras. Nunca inventes números; si una tool viene vacía, decilo y sugerí contactar al equipo Core.
- Respondé en español, breve y claro, en markdown, con tablas o viñetas cuando ayude. Montos en USD con separador de miles.
- Si te piden algo fuera de tu alcance para este rol, explicá con amabilidad qué sí podés hacer.`;

    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: gateway("google/gemini-3.7-flash"),
      system: systemPrompt,
      messages: modelMessages,
      tools,
      stopWhen: stepCountIs(8),
    });

    return result.toUIMessageStreamResponse({ headers: corsHeaders });
  } catch (e: any) {
    console.error("core-copilot error:", e);
    const msg = String(e?.message ?? e);
    const status = msg.includes("429") ? 429 : msg.includes("402") ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
