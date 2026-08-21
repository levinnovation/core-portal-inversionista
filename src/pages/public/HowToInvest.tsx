import { useSeo } from "@/components/public/PublicLayout";
import { SectionHeading, HowItWorks, FaqAccordion, CtaBand } from "@/components/public/Sections";
import { howItWorks, faqs, opportunities } from "@/content/site";
import { Check } from "lucide-react";

const requirements = [
  "Ser inversionista calificado y completar el proceso KYC.",
  "Documento de identidad vigente y comprobante de domicilio.",
  "Declaración de origen de fondos según normativa vigente.",
  "Firma del contrato de inversión y del acuerdo de confidencialidad.",
];

const timeline = [
  { when: "Día 0", what: "Envías tu solicitud de acceso desde el sitio." },
  { when: "48 horas", what: "Un ejecutivo de relación te contacta y agenda una llamada." },
  { when: "Día 3 a 5", what: "Verificación KYC y acreditación completadas." },
  { when: "Día 5+", what: "Acceso al portal, expedientes y suscripción al proyecto elegido." },
];

const HowToInvest = () => {
  useSeo(
    "Cómo invertir con Core | Proceso, requisitos y mínimos",
    "Conoce el proceso paso a paso para invertir con Core: solicitud de acceso, verificación KYC, selección de proyecto y seguimiento desde el portal."
  );

  return (
    <>
      <section className="bg-hero text-primary-foreground">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-accent text-xs tracking-[0.3em] uppercase mb-4">Cómo invertir</div>
          <h1 className="font-display text-4xl md:text-5xl max-w-2xl leading-tight">
            De la solicitud a tu primera distribución
          </h1>
          <p className="text-primary-foreground/75 max-w-2xl mt-5 leading-relaxed">
            Un proceso acompañado, con reglas claras y sin sorpresas: así funciona invertir con Core.
          </p>
        </div>
      </section>

      <section className="py-20 px-6 max-w-7xl mx-auto">
        <SectionHeading eyebrow="Proceso" title="Cuatro pasos" />
        <HowItWorks steps={howItWorks} />
      </section>

      <section className="py-20 px-6 bg-subtle">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display text-3xl mb-6">Requisitos</h2>
            <ul className="space-y-3">
              {requirements.map((r) => (
                <li key={r} className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-accent mt-1 shrink-0" />
                  <span className="text-muted-foreground leading-relaxed">{r}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-3xl mb-6">Cronograma típico</h2>
            <ol className="space-y-4">
              {timeline.map((t) => (
                <li key={t.when} className="bg-card border border-border rounded-lg p-5 shadow-card">
                  <div className="text-xs uppercase tracking-[0.2em] text-accent mb-1">{t.when}</div>
                  <div className="text-sm text-muted-foreground">{t.what}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 max-w-7xl mx-auto">
        <SectionHeading eyebrow="Proyectos" title="Modelos de inversión disponibles" />
        <div className="grid md:grid-cols-3 gap-6">
          {opportunities.slice(0, 3).map((o) => (
            <div key={o.slug} className="bg-card border border-border rounded-lg p-7 shadow-card text-center">
              <img src={o.logo} alt={`Logo ${o.name}`} loading="lazy" className="h-8 w-auto object-contain mx-auto mb-4 brightness-0 opacity-85" />
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{o.type}</div>
              <div className="font-display text-2xl text-accent mb-2">{o.model}</div>
              <div className="text-sm text-muted-foreground">{o.name} · {o.location}</div>
            </div>
          ))}
        </div>
      </section>


      <section className="py-20 px-6 bg-subtle">
        <div className="max-w-3xl mx-auto">
          <SectionHeading eyebrow="Dudas rápidas" title="Preguntas sobre el proceso" />
          <FaqAccordion items={faqs.flatMap((c) => c.items).slice(0, 5)} />
        </div>
      </section>

      <CtaBand source="como-invertir" />
    </>
  );
};

export default HowToInvest;
