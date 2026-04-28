import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Usuario inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();

    // Load investor portfolio context (scoped to user)
    const { data: investors } = await supabase.from("investors").select("*").eq("user_id", user.id);
    const investorIds = (investors ?? []).map((i: any) => i.id);

    let investments: any[] = [];
    let distributions: any[] = [];
    let projects: any[] = [];

    if (investorIds.length) {
      const { data: invs } = await supabase.from("investments").select("*").in("investor_id", investorIds);
      investments = invs ?? [];
      const invIds = investments.map((i) => i.id);
      const projectIds = Array.from(new Set(investments.map((i) => i.project_id)));
      if (invIds.length) {
        const { data: dist } = await supabase.from("distributions").select("*").in("investment_id", invIds);
        distributions = dist ?? [];
      }
      if (projectIds.length) {
        const { data: pjs } = await supabase.from("projects").select("*").in("id", projectIds);
        projects = pjs ?? [];
      }
    }

    const totalInvested = investments.reduce((s, i) => s + Number(i.amount_invested || 0), 0);
    const totalDist = distributions.reduce((s, d) => s + Number(d.amount || 0), 0);

    const context = `
Eres el Agente Financiero de Core, una firma de inversión inmobiliaria.
Respondes con tono profesional, claro y conciso. Usa formato Markdown cuando ayude.
Sólo puedes hablar de la información del inversionista autenticado. Si te preguntan algo fuera de scope, decláralo.

DATOS DEL INVERSIONISTA:
- Inversionistas vinculados: ${investors?.length ?? 0}
- Capital total invertido: $${totalInvested.toLocaleString()}
- Distribuciones recibidas: $${totalDist.toLocaleString()}
- ROI acumulado: ${totalInvested > 0 ? ((totalDist / totalInvested) * 100).toFixed(2) : 0}%

INVERSIONES:
${JSON.stringify(investments.map((i) => ({
  proyecto: projects.find((p) => p.id === i.project_id)?.name,
  tipo: i.investment_type,
  monto: i.amount_invested,
  participacion_pct: i.ownership_percentage,
  fecha: i.investment_date,
  estado: i.status,
})), null, 2)}

PROYECTOS:
${JSON.stringify(projects.map((p) => ({
  nombre: p.name, ubicacion: p.location, estado: p.status, entrega: p.estimated_delivery,
})), null, 2)}

DISTRIBUCIONES (últimas):
${JSON.stringify(distributions.slice(-10).map((d) => ({
  fecha: d.distribution_date, tipo: d.type, monto: d.amount, descripcion: d.description,
})), null, 2)}
`.trim();

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY no configurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        stream: true,
        messages: [
          { role: "system", content: context },
          ...messages,
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Intenta de nuevo en un momento." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Crédito de IA agotado. Contacta al equipo Core." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const txt = await aiResponse.text();
      return new Response(JSON.stringify({ error: txt }), {
        status: aiResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(aiResponse.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
