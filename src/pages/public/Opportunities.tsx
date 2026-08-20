import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSeo } from "@/components/public/PublicLayout";
import { useLeadDialog } from "@/components/public/LeadDialog";
import { SectionHeading, CtaBand } from "@/components/public/Sections";
import { opportunities, soldProjects } from "@/content/site";
import { Check, ExternalLink } from "lucide-react";

const ALL = "Todos";

const Opportunities = () => {
  useSeo(
    "Proyectos de inversión Core | Babylon, SIIX, URBN, SECRT y SLVA",
    "Conocé los proyectos de Core abiertos hoy: Babylon apart-hotel, SIIX Nunciatura, URBN Nunciatura, SECRT Escalante y las últimas unidades de SLVA Guachipelín."
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
          <div className="text-accent text-xs tracking-[0.3em] uppercase mb-4">Proyectos</div>
          <h1 className="font-display text-4xl md:text-5xl max-w-2xl leading-tight">
            Hábitat urbano abierto a inversión
          </h1>
          <p className="text-primary-foreground/75 max-w-2xl mt-5 leading-relaxed">
            Residencial urbano y hospitality en San José y Escazú. Las condiciones económicas y la
            disponibilidad por tipología se conversan con el equipo comercial de Core y quedan en el
            expediente de tu inversión dentro del portal.
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
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="bg-accent-soft text-accent-foreground text-xs px-3 py-1 rounded-full">{o.stage}</span>
                    <span className="text-xs text-muted-foreground">{o.type}</span>
                  </div>
                  <img src={o.logo} alt={`Logo ${o.name}`} loading="lazy" className="h-8 w-auto object-contain mb-3" />
                  <h2 className="font-display text-3xl mb-1">{o.name}</h2>
                  <div className="text-sm text-muted-foreground mb-1">{o.location}</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-accent mb-4">{o.tagline}</div>
                  <p className="text-muted-foreground leading-relaxed mb-6">{o.summary}</p>

                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="min-w-0">
                      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Modelo</dt>
                      <dd className="text-sm">{o.model}</dd>
                    </div>
                    {o.units && (
                      <div className="min-w-0">
                        <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Unidades</dt>
                        <dd className="text-sm">{o.units}</dd>
                      </div>
                    )}
                  </dl>

                  <ul className="grid sm:grid-cols-2 gap-2 mb-6">
                    {o.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{h}</span>
                      </li>
                    ))}
                  </ul>

                  {o.publishedFigures && (
                    <div className="rounded-lg bg-subtle border border-border p-5 mb-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {o.publishedFigures.map((f) => (
                          <div key={f.label} className="min-w-0">
                            <div className="font-display text-2xl text-primary">{f.value}</div>
                            <div className="text-xs text-muted-foreground leading-snug mt-1">{f.label}</div>
                          </div>
                        ))}
                      </div>
                      {o.figuresNote && (
                        <p className="text-[11px] text-muted-foreground leading-relaxed mt-4">{o.figuresNote}</p>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => open(`oportunidad:${o.slug}`)} className="bg-primary text-primary-foreground hover:bg-primary-glow">
                      Solicitar información
                    </Button>
                    {o.site && (
                      <a href={o.site} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline">
                          Sitio del proyecto <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="py-16 px-6 bg-subtle">
        <div className="max-w-7xl mx-auto">
          <SectionHeading eyebrow="Track record" title="Proyectos vendidos" />
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {soldProjects.map((c) => (
              <article key={c.slug} className="bg-card border border-border rounded-lg overflow-hidden shadow-card">
                <img src={c.image} alt={`${c.name}, ${c.location}`} loading="lazy" className="w-full h-40 object-cover" />
                <div className="p-6">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{c.location}</div>
                  <h3 className="font-display text-xl mb-2">{c.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="¿Querés el expediente completo de un proyecto?"
        body="Solicitá acceso y un ejecutivo de Core te comparte planos, tipologías, modelo de operación y condiciones."
        source="oportunidades"
      />
    </>
  );
};

export default Opportunities;
