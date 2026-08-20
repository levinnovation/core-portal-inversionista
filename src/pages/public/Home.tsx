import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import hero from "@/assets/hero-tower.jpg";
import { useSeo } from "@/components/public/PublicLayout";
import { useLeadDialog } from "@/components/public/LeadDialog";
import {
  SectionHeading, StatsBar, OpportunityCard, HowItWorks, Testimonials, FaqAccordion, CtaBand,
} from "@/components/public/Sections";
import {
  stats, opportunities, platformFeatures, differentiators, howItWorks, successCases, testimonials, faqs, partners,
} from "@/content/site";

const Home = () => {
  useSeo(
    "Core · Inversión inmobiliaria con transparencia total",
    "Invierte en desarrollos inmobiliarios institucionales y sigue tu portafolio, distribuciones y avance de obra en tiempo real desde el portal Core."
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
            description: "Plataforma de inversión inmobiliaria institucional.",
          }),
        }}
      />

      {/* Hero */}
      <section className="relative">
        <div className="relative min-h-[560px] md:min-h-[640px] overflow-hidden">
          <img src={hero} alt="Torre residencial desarrollada por Core" width={1600} height={1024} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-hero opacity-90" />
          <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32">
            <div className="max-w-2xl">
              <div className="text-accent text-xs tracking-[0.3em] uppercase mb-6">Real Estate · Investment Platform</div>
              <h1 className="font-display text-4xl md:text-6xl text-primary-foreground leading-[1.05] mb-6">
                Invierte en ladrillo.<br />
                <span className="text-accent italic">Mide como fondo.</span>
              </h1>
              <p className="text-lg text-primary-foreground/75 max-w-xl mb-9 leading-relaxed">
                Acceso a desarrollos inmobiliarios seleccionados por Core, con tu portafolio, tus
                distribuciones y el avance de cada obra auditables desde un solo portal.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" onClick={() => open("hero")} className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-gold">
                  Solicitar acceso <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Link to="/oportunidades">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10">
                    Ver oportunidades
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

      {/* Aliados */}
      <section className="py-14 px-6 max-w-7xl mx-auto">
        <div className="text-center text-xs uppercase tracking-[0.25em] text-muted-foreground mb-7">
          Aliados institucionales y financieros
        </div>
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
          {partners.map((p) => (
            <span key={p} className="font-display text-lg text-muted-foreground/70">{p}</span>
          ))}
        </div>
      </section>

      {/* Plataforma (zigzag) */}
      <section className="py-20 px-6 bg-subtle">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            eyebrow="La plataforma"
            title="Todo lo que necesitas para decidir, en un solo lugar"
            subtitle="Cada cifra del portal proviene del sistema operativo de Core: la misma fuente que usa nuestro equipo de inversión."
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
                <div className="bg-card border border-border rounded-lg shadow-card p-8 h-56 flex items-center justify-center">
                  <span className="font-display text-5xl text-accent/25">0{i + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Oportunidades */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Oportunidades"
          title="Proyectos abiertos a inversión"
          subtitle="Cada oportunidad pasa por comité de inversión, due diligence legal y validación financiera antes de publicarse."
        />
        <div className="grid md:grid-cols-3 gap-6">
          {opportunities.map((o) => <OpportunityCard key={o.slug} o={o} />)}
        </div>
        <div className="text-center mt-10">
          <Link to="/oportunidades">
            <Button variant="outline" size="lg">Ver todas las oportunidades <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
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
        <SectionHeading eyebrow="Por qué Core" title="Estándar institucional, sin la caja negra" />
        <div className="grid md:grid-cols-3 gap-6">
          {differentiators.map((d) => (
            <div key={d.title} className="bg-card border border-border rounded-lg p-7 shadow-card hover:shadow-elegant transition-shadow">
              <h3 className="font-display text-xl mb-2">{d.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{d.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Casos de éxito */}
      <section id="casos" className="py-20 px-6 bg-subtle scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <SectionHeading eyebrow="Track record" title="Proyectos entregados" />
          <div className="grid md:grid-cols-3 gap-6">
            {successCases.map((c) => (
              <div key={c.name} className="bg-card border border-border rounded-lg p-7 shadow-card">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{c.location}</div>
                <h3 className="font-display text-2xl mb-3">{c.name}</h3>
                <div className="font-display text-3xl text-accent mb-2 truncate">{c.result}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <SectionHeading eyebrow="Inversionistas" title="Lo que dicen quienes ya invierten" />
        <Testimonials items={testimonials} />
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-subtle">
        <div className="max-w-3xl mx-auto">
          <SectionHeading eyebrow="Preguntas frecuentes" title="Antes de invertir" />
          <FaqAccordion items={homeFaqs} />
          <div className="text-center mt-8">
            <Link to="/faq" className="text-sm text-primary hover:text-accent underline underline-offset-4">
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
