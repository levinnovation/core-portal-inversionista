import torre from "@/assets/project-torre.jpg";
import residencial from "@/assets/project-residencial.jpg";
import comercial from "@/assets/project-comercial.jpg";

export const stats = [
  { value: "$1.2B", label: "Capital gestionado" },
  { value: "24", label: "Proyectos desarrollados" },
  { value: "3,400+", label: "Unidades entregadas" },
  { value: "580", label: "Inversionistas activos" },
];

export type Opportunity = {
  slug: string;
  name: string;
  location: string;
  city: string;
  stage: string;
  type: string;
  image: string;
  minTicket: string;
  targetReturn: string;
  term: string;
  progress: number;
  summary: string;
  highlights: string[];
};

export const opportunities: Opportunity[] = [
  {
    slug: "torre-central",
    name: "Torre Central",
    location: "Escazú, San José",
    city: "San José",
    stage: "En construcción",
    type: "Residencial vertical",
    image: torre,
    minTicket: "$50,000",
    targetReturn: "18% TIR objetivo",
    term: "36 meses",
    progress: 62,
    summary:
      "Torre residencial de 28 niveles con amenidades de servicio completo en el corredor financiero de Escazú. Preventa colocada al 71%.",
    highlights: [
      "180 unidades de 1 a 3 dormitorios",
      "Preventa 71% colocada",
      "Entrega estimada Q4 2027",
      "Financiamiento bancario aprobado",
    ],
  },
  {
    slug: "altavista-residences",
    name: "Altavista Residences",
    location: "Santa Ana, San José",
    city: "San José",
    stage: "Preconstrucción",
    type: "Condominio boutique",
    image: residencial,
    minTicket: "$35,000",
    targetReturn: "15% TIR objetivo",
    term: "30 meses",
    progress: 18,
    summary:
      "Condominio boutique de baja densidad con 48 residencias, piscina y club house, en una de las zonas de mayor plusvalía del Valle Central.",
    highlights: [
      "48 residencias de baja densidad",
      "Terreno adquirido y permisos en trámite",
      "Ticket de entrada accesible",
      "Salida por venta de unidades",
    ],
  },
  {
    slug: "distrito-comercial",
    name: "Distrito Comercial Norte",
    location: "Heredia",
    city: "Heredia",
    stage: "Estabilizado",
    type: "Comercial y oficinas",
    image: comercial,
    minTicket: "$100,000",
    targetReturn: "9% flujo anual",
    term: "Renta indefinida",
    progress: 100,
    summary:
      "Complejo de uso mixto con locales comerciales y oficinas corporativas arrendados a inquilinos ancla, con flujo de caja distribuido trimestralmente.",
    highlights: [
      "Ocupación 94%",
      "Contratos de arrendamiento a 5 y 10 años",
      "Distribuciones trimestrales",
      "NOI estabilizado desde 2024",
    ],
  },
];

export const platformFeatures = [
  {
    title: "Tu portafolio, siempre actualizado",
    body:
      "Capital invertido, valor actual, distribuciones recibidas y participación por proyecto en una sola vista. Sin esperar el correo del trimestre.",
    points: ["Posición consolidada", "Distribuciones históricas", "Documentos legales por inversión"],
  },
  {
    title: "Métricas que sí puedes auditar",
    body:
      "TIR (XIRR), Cash-on-Cash, Equity Multiple y NOI calculados sobre tus flujos reales, con el detalle de fechas y montos usados y la metodología a la vista.",
    points: ["Exportación a PDF y CSV", "Panel de metodología", "Flujos de caja detallados"],
  },
  {
    title: "La obra, fotografiada",
    body:
      "Avance por fase con porcentajes, fechas estimadas contra reales y galería fotográfica actualizada por el equipo de campo.",
    points: ["Avance por fase", "Galería de obra", "Alertas de hitos"],
  },
];

export const differentiators = [
  { title: "Transparencia total", body: "Cada cifra del portal proviene del sistema operativo de Core, no de una presentación." },
  { title: "Reportes trimestrales", body: "Estados de resultados, avance y proyecciones entregados en el portal y por correo." },
  { title: "Obra documentada", body: "Fotografía y bitácora de cada fase constructiva, actualizada por el equipo de proyecto." },
  { title: "Expediente legal", body: "Contratos, escrituras y adendas disponibles para descarga desde tu portafolio." },
  { title: "Asistente con IA", body: "Pregunta en lenguaje natural por tu posición, pagos o documentos y obtén respuestas con fuente." },
  { title: "Equipo dedicado", body: "Un ejecutivo de relación asignado a cada inversionista, con contacto directo." },
];

export const howItWorks = [
  { step: "01", title: "Solicita acceso", body: "Cuéntanos tu perfil y el monto que te interesa colocar. Respondemos en menos de 48 horas." },
  { step: "02", title: "Verificación", body: "Completamos KYC y acreditación con el acompañamiento de nuestro equipo de cumplimiento." },
  { step: "03", title: "Elige tu proyecto", body: "Revisa el expediente completo de cada oportunidad: financieros, permisos y proyecciones." },
  { step: "04", title: "Sigue tu inversión", body: "Desde el portal: distribuciones, métricas, avance de obra y documentos, en tiempo real." },
];

export const successCases = [
  { name: "Vista Real", location: "Curridabat", result: "22.4% TIR realizada", detail: "96 unidades entregadas y vendidas en 34 meses." },
  { name: "Plaza Lindora", location: "Santa Ana", result: "2.1x Equity Multiple", detail: "Salida por venta institucional del activo en 2024." },
  { name: "Bosque Alto", location: "Alajuela", result: "11% flujo anual", detail: "Activo de renta estabilizado con ocupación del 97%." },
];

export const testimonials = [
  {
    quote:
      "Es la primera vez que veo mi inversión inmobiliaria con el mismo nivel de detalle que mi portafolio bursátil. La trazabilidad de los flujos cambia la conversación.",
    name: "Andrés Marín",
    role: "Family office · San José",
  },
  {
    quote:
      "El avance de obra con fotos y fechas reales nos ahorra las llamadas de seguimiento. Sabemos exactamente en qué fase está cada proyecto.",
    name: "Carolina Vega",
    role: "Inversionista desde 2019",
  },
  {
    quote:
      "Los reportes trimestrales y el expediente legal descargable nos permitieron pasar el comité de inversión sin fricción.",
    name: "Roberto Solís",
    role: "Director de inversiones",
  },
];

export const faqs = [
  {
    category: "Acceso",
    items: [
      { q: "¿Quién puede invertir con Core?", a: "Inversionistas calificados que completen nuestro proceso de verificación KYC y acreditación. El equipo revisa cada solicitud de acceso de forma individual." },
      { q: "¿Cuánto tarda la aprobación?", a: "Respondemos toda solicitud en menos de 48 horas hábiles. La verificación completa suele tomar entre 3 y 5 días." },
    ],
  },
  {
    category: "Inversión",
    items: [
      { q: "¿Cuál es el monto mínimo?", a: "Depende del proyecto: los tickets de entrada van desde $35,000 en proyectos de preconstrucción hasta $100,000 en activos de renta estabilizada." },
      { q: "¿Cómo se estructura cada inversión?", a: "Según el proyecto: equity, deuda o participación preferente. El expediente de cada oportunidad detalla la estructura, la prelación y la cascada de distribuciones." },
      { q: "¿Cada cuánto recibo distribuciones?", a: "Los activos de renta distribuyen trimestralmente. Los proyectos de desarrollo distribuyen conforme a los hitos definidos en el contrato de inversión." },
    ],
  },
  {
    category: "Plataforma",
    items: [
      { q: "¿Cómo se calculan las métricas?", a: "La TIR se calcula con XIRR sobre los flujos reales fechados; Cash-on-Cash, Equity Multiple y NOI siguen las fórmulas publicadas en el panel de metodología dentro del portal." },
      { q: "¿Puedo exportar mi información?", a: "Sí. Desde tu portafolio puedes descargar un PDF o CSV con las métricas y el detalle de flujos usados en el cálculo." },
      { q: "¿Mis datos están protegidos?", a: "Cada usuario solo puede ver la información asociada a su perfil, con control de acceso aplicado a nivel de base de datos y registro de auditoría de las operaciones sensibles." },
    ],
  },
];

export const team = [
  { name: "Moshe Rosenstock", role: "Socio director" },
  { name: "Laura Jiménez", role: "Directora de inversiones" },
  { name: "Diego Alfaro", role: "Director de desarrollo" },
  { name: "Paula Cordero", role: "Relación con inversionistas" },
];

export const partners = ["Banco Nacional", "Grupo Constructor JV", "Prisma Legal", "Deloitte CR", "Colliers", "BAC Credomatic"];

export const contactInfo = {
  address: "Plaza Tempo, Escazú, San José, Costa Rica",
  email: "inversiones@portalcore.app",
  phone: "+506 4000 0000",
  hours: "Lunes a viernes, 8:00 a 17:00 (GMT-6)",
};
