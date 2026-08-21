import { Link } from "react-router-dom";
import { contactInfo } from "@/content/site";

const columns = [
  {
    title: "Invertir",
    links: [
      { to: "/oportunidades", label: "Oportunidades" },
      { to: "/como-invertir", label: "Cómo invertir" },
      { to: "/faq", label: "Preguntas frecuentes" },
    ],
  },
  {
    title: "Core",
    links: [
      { to: "/nosotros", label: "Sobre nosotros" },
      { to: "/nosotros#equipo", label: "Equipo" },
      { to: "/contacto", label: "Contacto" },
    ],
  },
  {
    title: "Portal",
    links: [
      { to: "/auth", label: "Iniciar sesión" },
      { to: "/reset-password", label: "Recuperar contraseña" },
    ],
  },
];

export const PublicFooter = () => (
  <footer className="bg-accent text-foreground">
    <div className="max-w-7xl mx-auto px-6 py-16 grid gap-10 md:grid-cols-4">
      <div>
        <div className="font-display text-2xl text-accent mb-3">CORE</div>
        <p className="text-sm text-primary-foreground/70 leading-relaxed">
          Plataforma de inversión inmobiliaria institucional. Transparencia real sobre tu capital,
          tus distribuciones y el avance de cada obra.
        </p>
      </div>

      {columns.map((col) => (
        <div key={col.title}>
          <div className="text-xs uppercase tracking-[0.2em] text-accent mb-4">{col.title}</div>
          <ul className="space-y-2">
            {col.links.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    <div className="max-w-7xl mx-auto px-6 pb-10 grid gap-6 md:grid-cols-2 text-sm text-primary-foreground/60">
      <div>
        <div>{contactInfo.address}</div>
        <div>{contactInfo.email} · {contactInfo.site}</div>
      </div>

      <p className="md:text-right leading-relaxed">
        Toda inversión inmobiliaria implica riesgo, incluida la pérdida de capital. Los retornos
        objetivo son proyecciones y no constituyen una garantía de rendimiento. La información de este
        sitio no es una oferta pública de valores.
      </p>
    </div>

    <div className="border-t border-primary-glow/40 py-6 text-center text-xs text-primary-foreground/50">
      © {new Date().getFullYear()} Core · Plataforma de inversión inmobiliaria
    </div>
  </footer>
);
