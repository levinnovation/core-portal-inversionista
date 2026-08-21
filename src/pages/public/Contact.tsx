import { useSeo } from "@/components/public/PublicLayout";
import { LeadForm } from "@/components/public/LeadDialog";
import { contactInfo } from "@/content/site";
import { MapPin, Mail, Globe, Clock } from "lucide-react";

const Contact = () => {
  useSeo(
    "Contacto | Core",
    "Contacta al equipo de Core para conocer los proyectos disponibles y el acceso a PortalCore."
  );

  const info = [
    { icon: MapPin, label: "Oficina", value: contactInfo.address },
    { icon: Mail, label: "Email", value: contactInfo.email },
    { icon: Globe, label: "Sitio de marca", value: contactInfo.site },
    { icon: Clock, label: "Horario", value: contactInfo.hours },
  ];


  return (
    <>
      <section className="bg-hero text-primary-foreground">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-accent text-xs tracking-[0.3em] uppercase mb-4">Contacto</div>
          <h1 className="font-display text-4xl md:text-5xl">Hablemos de tu portafolio</h1>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_1.2fr] gap-12">
          <div className="space-y-6">
            {info.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-md bg-accent/15 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">{label}</div>
                  <div className="text-sm break-words">{value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-lg p-8 shadow-card">
            <h2 className="font-display text-2xl mb-1">Envíanos un mensaje</h2>
            <p className="text-sm text-muted-foreground mb-6">Respondemos en menos de 48 horas hábiles.</p>
            <LeadForm source="contacto" />
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
