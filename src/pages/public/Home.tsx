import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import hero from "@/assets/projects/fachadas.png";
import { useSeo } from "@/components/public/PublicLayout";
import { useLeadDialog } from "@/components/public/LeadDialog";
import { PortalMock } from "@/components/public/PortalMock";
import {
  SectionHeading, StatsBar, OpportunityCard, HowItWorks, FaqAccordion, CtaBand,
} from "@/components/public/Sections";
import {
  stats, opportunities, soldProjects, platformFeatures, differentiators, howItWorks, aiExamples, faqs,
} from "@/content/site";

const Home = () => {
  useSeo(
    "Core · Hábitat urbano e inversión inmobiliaria en Costa Rica",
    "Conocé los proyectos de Core —Babylon, SIIX, URBN, SECRT y SLVA— e invertí con seguimiento detallado de tu inversión, tu obra y tus documentos desde PortalCore."
  );
  const { open } = useLeadDialog();
  const homeFaqs = faqs.flatMap((c) => c.items).slice(0, 6);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Core",
            url: "https://portalcore.app",
            description: "Desarrolladora de hábitat urbano en Costa Rica y plataforma de seguimiento de inversión PortalCore.",
          }),
        }}
      />

      {/* Hero */}
      <section className="relative">
        <div className="relative min-h-[560px] md:min-h-[640px] overflow-hidden">
          <img src={hero} alt="Fachadas de los proyectos urbanos desarrollados por Core en San José" width={1600} height={1024} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-hero opacity-90" />
          <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32">
            <div className="max-w-2xl">
              <div className="text-accent text-xs tracking-[0.3em] uppercase mb-6">Creadores de hábitat urbano</div>
              <h1 className="font-display text-4xl md:text-6xl text-primary-foreground leading-[1.05] mb-6">
                Invertí en los proyectos de Core.<br />
                <span className="text-accent italic">Seguilos al detalle.</span>
              </h1>
              <p className="text-lg text-primary-foreground/75 max-w-xl mb-9 leading-relaxed">
                Babylon, SIIX, URBN, SECRT y SLVA: desarrollos urbanos y de hospitality en San José.
                Y detrás de cada inversión, PortalCore: tu posición, tus pagos, el avance de la obra y
                tus documentos, con un asistente de IA que responde sobre tu propia información.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" variant="premium" onClick={() => open("hero")}>
                  Solicitar acceso <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Link to="/oportunidades">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 hover:text-foreground">
                    Ver proyectos
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
          <StatsBar items={stats} />
        </div>
      </section>

      {/* Marcas Core */}
      <section className="py-14 px-6 bg-primary mt-14">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-xs uppercase tracking-[0.25em] text-accent mb-8">
            Las marcas de Core
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
            {[...opportunities, ...soldProjects].map((p) => (
              <img
                key={p.slug}
                src={p.logo}
                alt={`Logo ${p.name}`}
                loading="lazy"
                className="h-7 md:h-8 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
              />
            ))}
          </div>
        </div>
      </section>


      {/* Proyectos */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Proyectos"
          title="Desarrollos Core abiertos hoy"
          subtitle="Residencial urbano y hospitality en las zonas más caminables de San José. Cada proyecto tiene su propio expediente, tipologías y modelo de operación."
        />
        <div className="grid md:grid-cols-3 gap-6">
          {opportunities.slice(0, 3).map((o) => <OpportunityCard key={o.slug} o={o} />)}
        </div>
        <div className="text-center mt-10">
          <Link to="/oportunidades">
            <Button variant="outline" size="lg">Ver todos los proyectos <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
        </div>
      </section>

      {/* Plataforma (zigzag) */}
      <section className="py-20 px-6 bg-subtle">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            eyebrow="PortalCore"
            title="Así se ve tu inversión desde adentro"
            subtitle="Cada cifra del portal proviene del sistema operativo de Core: la misma fuente que usa el equipo de proyecto y de operación."
          />
          <div className="space-y-12">
            {platformFeatures.map((f, i) => (
              <div key={f.title} className={`grid md:grid-cols-2 gap-8 items-center ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
                <div>
                  <h3 className="font-display text-2xl md:text-3xl mb-3">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-5">{f.body}</p>
                  <ul className="space-y-2">
                    {f.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <PortalMock variant={i as 0 | 1 | 2} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Asistente IA */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Asistente con IA"
          title="Preguntá por tu inversión en tus palabras"
          subtitle="El asistente solo accede a la información que te corresponde y cita la fuente de cada dato que devuelve."
        />
        <div className="grid md:grid-cols-2 gap-4">
          {aiExamples.map((e) => (
            <div key={e.q} className="bg-card border border-border rounded-lg p-6 shadow-card">
              <div className="flex items-start gap-3 mb-3">
                <Sparkles className="h-4 w-4 text-accent mt-1 shrink-0" />
                <p className="font-display text-lg leading-snug">{e.q}</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-7">{e.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-20 px-6 bg-subtle">
        <div className="max-w-7xl mx-auto">
          <SectionHeading eyebrow="Proceso" title="Cómo funciona" />
          <HowItWorks steps={howItWorks} />
        </div>
      </section>

      {/* Diferenciadores */}
      <section id="diferenciadores" className="py-20 px-6 max-w-7xl mx-auto scroll-mt-20">
        <SectionHeading eyebrow="Por qué Core" title="Desarrollamos, operamos y rendimos cuentas" />
        <div className="grid md:grid-cols-3 gap-6">
          {differentiators.map((d) => (
            <div key={d.title} className="bg-card border border-border rounded-lg p-7 shadow-card hover:shadow-elegant transition-shadow">
              <h3 className="font-display text-xl mb-2">{d.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{d.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vendidos */}
      <section id="casos" className="py-20 px-6 bg-subtle scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <SectionHeading eyebrow="Track record" title="Proyectos vendidos" subtitle="Desarrollos Core colocados en su totalidad." />
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

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <SectionHeading eyebrow="Preguntas frecuentes" title="Antes de invertir" />
          <FaqAccordion items={homeFaqs} />
          <div className="text-center mt-8">
            <Link to="/faq" className="text-sm text-accent hover:text-accent underline underline-offset-4">
              Ver todas las preguntas
            </Link>
          </div>
        </div>
      </section>

      <CtaBand source="landing-final" />
    </>
  );
};

export default Home;
