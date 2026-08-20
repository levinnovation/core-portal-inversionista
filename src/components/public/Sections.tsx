import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, Quote } from "lucide-react";
import { useLeadDialog } from "./LeadDialog";
import type { Opportunity } from "@/content/site";

export const SectionHeading = ({
  eyebrow,
  title,
  subtitle,
  center = true,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) => (
  <div className={`mb-12 ${center ? "text-center mx-auto max-w-2xl" : "max-w-2xl"}`}>
    {eyebrow && <div className="text-accent text-xs tracking-[0.3em] uppercase mb-3">{eyebrow}</div>}
    <h2 className="font-display text-3xl md:text-4xl leading-tight">{title}</h2>
    {subtitle && <p className="text-muted-foreground mt-4 leading-relaxed">{subtitle}</p>}
  </div>
);

export const StatsBar = ({ items }: { items: { value: string; label: string }[] }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border border border-border rounded-lg bg-card shadow-card overflow-hidden">
    {items.map((s) => (
      <div key={s.label} className="p-6 text-center min-w-0">
        <div className="font-display text-3xl md:text-4xl text-primary truncate">{s.value}</div>
        <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground mt-2">{s.label}</div>
      </div>
    ))}
  </div>
);

export const OpportunityCard = ({ o }: { o: Opportunity }) => (
  <article className="bg-card border border-border rounded-lg overflow-hidden shadow-card hover:shadow-elegant transition-shadow flex flex-col">
    <div className="relative h-52 overflow-hidden">
      <img src={o.image} alt={`${o.name}, ${o.location}`} loading="lazy" width={1280} height={860} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent" />
      <span className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs px-3 py-1 rounded-full">{o.stage}</span>
      <img src={o.logo} alt={`Logo ${o.name}`} loading="lazy" className="absolute bottom-3 left-4 h-8 w-auto max-w-[55%] object-contain brightness-0 invert" />
    </div>
    <div className="p-6 flex-1 flex flex-col">
      <div className="text-xs uppercase tracking-[0.2em] text-accent mb-2">{o.tagline}</div>
      <h3 className="font-display text-2xl mb-1">{o.name}</h3>
      <div className="text-sm text-muted-foreground mb-4">{o.location} · {o.type}</div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">{o.summary}</p>

      <dl className="space-y-2 pt-4 border-t border-border text-sm">
        <div className="flex gap-3 justify-between">
          <dt className="text-muted-foreground shrink-0">Modelo</dt>
          <dd className="text-right min-w-0">{o.model}</dd>
        </div>
        {o.units && (
          <div className="flex gap-3 justify-between">
            <dt className="text-muted-foreground shrink-0">Unidades</dt>
            <dd className="text-right min-w-0">{o.units}</dd>
          </div>
        )}
      </dl>
    </div>
  </article>
);


export const HowItWorks = ({ steps }: { steps: { step: string; title: string; body: string }[] }) => (
  <div className="grid md:grid-cols-4 gap-6">
    {steps.map((s) => (
      <div key={s.step} className="relative pl-4 border-l-2 border-accent/40">
        <div className="font-display text-4xl text-accent/50 mb-2">{s.step}</div>
        <h3 className="font-display text-xl mb-2">{s.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
      </div>
    ))}
  </div>
);

export const Testimonials = ({ items }: { items: { quote: string; name: string; role: string }[] }) => (
  <div className="grid md:grid-cols-3 gap-6">
    {items.map((t) => (
      <figure key={t.name} className="bg-card border border-border rounded-lg p-7 shadow-card flex flex-col">
        <Quote className="h-6 w-6 text-accent mb-4" />
        <blockquote className="text-sm leading-relaxed text-foreground/90 flex-1">{t.quote}</blockquote>
        <figcaption className="mt-5 pt-4 border-t border-border">
          <div className="font-medium text-sm">{t.name}</div>
          <div className="text-xs text-muted-foreground">{t.role}</div>
        </figcaption>
      </figure>
    ))}
  </div>
);

export const FaqAccordion = ({ items }: { items: { q: string; a: string }[] }) => (
  <Accordion type="single" collapsible className="w-full">
    {items.map((f) => (
      <AccordionItem key={f.q} value={f.q}>
        <AccordionTrigger className="text-left font-display text-lg">{f.q}</AccordionTrigger>
        <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);

export const CtaBand = ({
  title = "Empieza a invertir con visibilidad total",
  body = "Solicita acceso al portal Core y conoce las oportunidades disponibles en este trimestre.",
  source = "cta",
}: { title?: string; body?: string; source?: string }) => {
  const { open } = useLeadDialog();
  return (
    <section className="bg-hero">
      <div className="max-w-7xl mx-auto px-6 py-20 text-center text-primary-foreground">
        <h2 className="font-display text-3xl md:text-4xl mb-4">{title}</h2>
        <p className="text-primary-foreground/75 max-w-xl mx-auto mb-8 leading-relaxed">{body}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" onClick={() => open(source)} className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-gold">
            Solicitar acceso <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Link to="/auth">
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              Ya soy inversionista
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
