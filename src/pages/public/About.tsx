import { useSeo } from "@/components/public/PublicLayout";
import { SectionHeading, StatsBar, CtaBand } from "@/components/public/Sections";
import { stats, team, differentiators, soldProjects } from "@/content/site";

const About = () => {
  useSeo(
    "Sobre Core | Desarrollo e inversión inmobiliaria institucional",
    "Core desarrolla y administra proyectos inmobiliarios con estándar institucional, ofreciendo a sus inversionistas visibilidad completa de capital, obra y distribuciones."
  );

  return (
    <>
      <section className="bg-hero text-primary-foreground">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-accent text-xs tracking-[0.3em] uppercase mb-4">Nosotros</div>
          <h1 className="font-display text-4xl md:text-5xl max-w-2xl leading-tight">
            Creadores de hábitat urbano
          </h1>
          <p className="text-primary-foreground/75 max-w-2xl mt-5 leading-relaxed">
            Core desarrolla, opera y administra proyectos residenciales y de hospitality en las zonas
            más urbanas de San José. No vendemos metros cuadrados: construimos comunidad.
          </p>
        </div>
      </section>

      <section className="py-16 px-6 max-w-7xl mx-auto">
        <StatsBar items={stats} />
      </section>

      <section className="py-16 px-6 bg-subtle">
        <div className="max-w-3xl mx-auto space-y-5 text-muted-foreground leading-relaxed">
          <h2 className="font-display text-3xl text-foreground">Cómo pensamos los proyectos</h2>
          <p>
            Cada marca de Core responde a una forma de habitar la ciudad: URBN glorifica el estilo de
            vida cosmopolita y caminable; SECRT lleva la escala boutique a Escalante y Sabana; SLVA y
            Babylon están concebidos desde el mundo hospitality, con operación a cargo del mismo
            equipo que los desarrolla.
          </p>
          <p>
            Esa integración —desarrollo, construcción y operación bajo el mismo techo— es la razón por
            la que podemos mostrarle a cada inversionista el estado real de su proyecto sin esperar el
            reporte del trimestre.
          </p>
          <p>
            PortalCore es la consecuencia: si una cifra no se puede auditar en el portal, no se publica.
          </p>
        </div>
      </section>


      <section className="py-20 px-6 max-w-7xl mx-auto">
        <SectionHeading eyebrow="Principios" title="Cómo trabajamos" />
        <div className="grid md:grid-cols-3 gap-6">
          {differentiators.map((d) => (
            <div key={d.title} className="bg-card border border-border rounded-lg p-7 shadow-card">
              <h3 className="font-display text-xl mb-2">{d.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{d.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="equipo" className="py-20 px-6 bg-subtle scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <SectionHeading eyebrow="Equipo" title="Quienes responden por tu inversión" />
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((m) => (
              <div key={m.name} className="bg-card border border-border rounded-lg p-7 shadow-card text-center">
                <div className="w-16 h-16 rounded-full bg-accent/15 mx-auto mb-4 flex items-center justify-center font-display text-xl text-foreground">
                  {m.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="font-display text-lg">{m.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{m.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 max-w-7xl mx-auto text-center">
        <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-8">Proyectos entregados</div>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
          {soldProjects.map((p) => (
            <img key={p.slug} src={p.logo} alt={`Logo ${p.name}`} loading="lazy" className="h-8 w-auto object-contain brightness-0 opacity-40" />
          ))}
        </div>
      </section>


      <CtaBand source="nosotros" />
    </>
  );
};

export default About;
