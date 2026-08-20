import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSeo } from "@/components/public/PublicLayout";
import { useLeadDialog } from "@/components/public/LeadDialog";
import { SectionHeading, CtaBand } from "@/components/public/Sections";
import { opportunities } from "@/content/site";
import { Check } from "lucide-react";

const ALL = "Todos";

const Opportunities = () => {
  useSeo(
    "Oportunidades de inversión inmobiliaria | Core",
    "Conoce los desarrollos inmobiliarios abiertos a inversión con Core: ticket mínimo, retorno objetivo, plazo y avance de obra de cada proyecto."
  );
  const { open } = useLeadDialog();
  const [city, setCity] = useState(ALL);
  const [stage, setStage] = useState(ALL);
  const [type, setType] = useState(ALL);

  const cities = [ALL, ...new Set(opportunities.map((o) => o.city))];
  const stages = [ALL, ...new Set(opportunities.map((o) => o.stage))];
  const types = [ALL, ...new Set(opportunities.map((o) => o.type))];

  const filtered = useMemo(
    () => opportunities.filter((o) =>
      (city === ALL || o.city === city) &&
      (stage === ALL || o.stage === stage) &&
      (type === ALL || o.type === type)),
    [city, stage, type]
  );

  const Filter = ({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) => (
    <div className="min-w-0">
      <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
              value === o ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-accent"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <section className="bg-hero text-primary-foreground">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-accent text-xs tracking-[0.3em] uppercase mb-4">Oportunidades</div>
          <h1 className="font-display text-4xl md:text-5xl max-w-2xl leading-tight">
            Desarrollos abiertos a inversión
          </h1>
          <p className="text-primary-foreground/75 max-w-2xl mt-5 leading-relaxed">
            Cada proyecto pasa por comité de inversión, due diligence legal y validación financiera.
            El expediente completo está disponible dentro del portal para inversionistas verificados.
          </p>
        </div>
      </section>

      <section className="py-14 px-6 max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-6 mb-10 pb-8 border-b border-border">
          <Filter label="Ubicación" value={city} options={cities} onChange={setCity} />
          <Filter label="Etapa" value={stage} options={stages} onChange={setStage} />
          <Filter label="Tipo" value={type} options={types} onChange={setType} />
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No hay proyectos con esos filtros.</p>
        ) : (
          <div className="space-y-8">
            {filtered.map((o) => (
              <article key={o.slug} className="grid md:grid-cols-[380px_1fr] gap-0 bg-card border border-border rounded-lg overflow-hidden shadow-card">
                <img src={o.image} alt={`${o.name}, ${o.location}`} loading="lazy" width={1280} height={860} className="w-full h-56 md:h-full object-cover" />
                <div className="p-7 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="bg-accent-soft text-accent-foreground text-xs px-3 py-1 rounded-full">{o.stage}</span>
                    <span className="text-xs text-muted-foreground">{o.type}</span>
                  </div>
                  <h2 className="font-display text-3xl mb-1">{o.name}</h2>
                  <div className="text-sm text-muted-foreground mb-4">{o.location}</div>
                  <p className="text-muted-foreground leading-relaxed mb-6">{o.summary}</p>

                  <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {[
                      { k: "Ticket mínimo", v: o.minTicket },
                      { k: "Retorno objetivo", v: o.targetReturn },
                      { k: "Plazo", v: o.term },
                      { k: "Avance", v: `${o.progress}%` },
                    ].map((m) => (
                      <div key={m.k} className="min-w-0">
                        <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.k}</dt>
                        <dd className="font-display text-lg truncate">{m.v}</dd>
                      </div>
                    ))}
                  </dl>

                  <ul className="grid sm:grid-cols-2 gap-2 mb-6">
                    {o.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{h}</span>
                      </li>
                    ))}
                  </ul>

                  <Button onClick={() => open(`oportunidad:${o.slug}`)} className="bg-primary text-primary-foreground hover:bg-primary-glow">
                    Solicitar información
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <CtaBand
        title="¿Listo para revisar el expediente completo?"
        body="Los inversionistas verificados acceden a financieros, permisos y proyecciones de cada proyecto."
        source="oportunidades"
      />
    </>
  );
};

export default Opportunities;
