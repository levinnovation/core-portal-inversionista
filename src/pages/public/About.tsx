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
            Construimos, administramos y rendimos cuentas
          </h1>
          <p className="text-primary-foreground/75 max-w-2xl mt-5 leading-relaxed">
            Core nació en 2012 como desarrolladora inmobiliaria y hoy administra un portafolio
            diversificado de proyectos residenciales, comerciales y de renta en Costa Rica.
          </p>
        </div>
      </section>

      <section className="py-16 px-6 max-w-7xl mx-auto">
        <StatsBar items={stats} />
      </section>

      <section className="py-16 px-6 bg-subtle">
        <div className="max-w-3xl mx-auto space-y-5 text-muted-foreground leading-relaxed">
          <h2 className="font-display text-3xl text-foreground">Nuestra historia</h2>
          <p>
            Empezamos desarrollando condominios de baja densidad en el Valle Central. Con cada proyecto
            entregado, un patrón se repetía: los inversionistas no tenían forma de saber en qué estado
            estaba realmente su capital hasta el reporte anual.
          </p>
          <p>
            En 2021 decidimos resolverlo desde adentro: conectamos nuestro sistema operativo de obra,
            ventas y tesorería a un portal donde cada inversionista y cada comprador ve exactamente lo
            mismo que ve nuestro comité de inversión.
          </p>
          <p>
            Hoy operamos con esa regla: si una cifra no se puede auditar en el portal, no se publica.
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
                <div className="w-16 h-16 rounded-full bg-accent-soft mx-auto mb-4 flex items-center justify-center font-display text-xl text-accent-foreground">
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
        <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-7">Aliados</div>
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
          {partners.map((p) => (
            <span key={p} className="font-display text-lg text-muted-foreground/70">{p}</span>
          ))}
        </div>
      </section>

      <CtaBand source="nosotros" />
    </>
  );
};

export default About;
