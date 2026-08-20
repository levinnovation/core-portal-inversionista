import { useSeo } from "@/components/public/PublicLayout";
import { FaqAccordion, CtaBand } from "@/components/public/Sections";
import { faqs } from "@/content/site";

const Faq = () => {
  useSeo(
    "Preguntas frecuentes | Core",
    "Resolvemos las dudas más comunes sobre acceso, montos mínimos, estructura de las inversiones, distribuciones y seguridad de la información en el portal Core."
  );

  return (
    <>
      <section className="bg-hero text-primary-foreground">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-accent text-xs tracking-[0.3em] uppercase mb-4">Soporte</div>
          <h1 className="font-display text-4xl md:text-5xl">Preguntas frecuentes</h1>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto space-y-14">
          {faqs.map((cat) => (
            <div key={cat.category}>
              <h2 className="font-display text-2xl mb-4 text-accent-foreground">{cat.category}</h2>
              <FaqAccordion items={cat.items} />
            </div>
          ))}
        </div>
      </section>

      <CtaBand
        title="¿Tu pregunta no está aquí?"
        body="Escríbenos y un ejecutivo de relación con inversionistas te responde directamente."
        source="faq"
      />
    </>
  );
};

export default Faq;
