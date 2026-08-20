import siix from "@/assets/projects/siix.jpg";
import urbnNunciatura from "@/assets/projects/urbn-nunciatura.jpg";
import secrtEscalante from "@/assets/projects/secrt-escalante.jpg";
import babylon from "@/assets/projects/babylon.jpg";
import slva from "@/assets/projects/slva.jpg";
import urbnEscalante from "@/assets/projects/urbn-escalante.jpg";
import cosmopolitan from "@/assets/projects/cosmopolitan.jpg";
import secrtSabana from "@/assets/projects/secrt-sabana.jpg";
import metro from "@/assets/projects/metro.jpg";

import siixLogo from "@/assets/projects/logos/siix.png";
import urbnNunciaturaLogo from "@/assets/projects/logos/urbn-nunciatura.png";
import secrtEscalanteLogo from "@/assets/projects/logos/secrt-escalante.png";
import babylonLogo from "@/assets/projects/logos/babylon.png";
import slvaLogo from "@/assets/projects/logos/slva.png";
import urbnEscalanteLogo from "@/assets/projects/logos/urbn-escalante.png";
import cosmopolitanLogo from "@/assets/projects/logos/cosmopolitan.png";
import secrtSabanaLogo from "@/assets/projects/logos/secrt-sabana.png";
import metroLogo from "@/assets/projects/logos/metro.png";

/**
 * Contenido público del sitio.
 * Regla: solo información publicada por Core (core.cr / coredesarrolladora.com).
 * No se incluyen retornos, TIR, tickets mínimos ni cifras de portafolio que Core no publique.
 */

export const stats = [
  { value: "9", label: "Proyectos de marca Core" },
  { value: "4", label: "Proyectos vendidos" },
  { value: "5", label: "Zonas urbanas de San José" },
  { value: "100%", label: "Hábitat urbano" },
];

export type Opportunity = {
  slug: string;
  name: string;
  location: string;
  city: string;
  stage: string;
  type: string;
  image: string;
  logo: string;
  tagline: string;
  summary: string;
  highlights: string[];
  model: string;
  units?: string;
  site?: string;
  sold?: boolean;
  /** Datos publicados por Core para este proyecto en particular. */
  publishedFigures?: { value: string; label: string }[];
  figuresNote?: string;
};

export const opportunities: Opportunity[] = [
  {
    slug: "babylon",
    name: "Babylon",
    location: "Nunciatura, San José",
    city: "San José",
    stage: "En comercialización",
    type: "Apart-hotel",
    image: babylon,
    logo: babylonLogo,
    tagline: "El único apart-hotel de Nunciatura",
    summary:
      "Proyecto con visión hotelera, diseñado y conceptualizado para inversionistas del mundo hospitality. Ubicado en Nunciatura, a 12 km del aeropuerto y en uno de los sectores de mejor plusvalía del Área Metropolitana.",
    model: "Renta corta administrada por Core",
    units: "Unidades de 41.70 m² a 67.70 m²",
    site: "https://www.coredesarrolladora.com/babylon/",
    highlights: [
      "Tipologías A, C, D y E — varias ya vendidas",
      "A 12 km del Aeropuerto Juan Santamaría",
      "Operación y administración a cargo de Core",
      "Amenidades pensadas para estadías cortas",
    ],
    publishedFigures: [
      { value: "2.6 M", label: "Turistas ingresados al país por vía aérea en 2024" },
      { value: "$62 – $95", label: "Tarifas diarias promedio de referencia" },
      { value: "95%", label: "Tasa de ocupación de referencia" },
    ],
    figuresNote:
      "Cifras de mercado publicadas por Core en el sitio del proyecto Babylon. Son referencias de mercado, no una proyección de rendimiento ni una garantía.",
  },
  {
    slug: "siix-nunciatura",
    name: "SIIX Nunciatura",
    location: "Nunciatura, San José",
    city: "San José",
    stage: "En comercialización",
    type: "Residencial urbano",
    image: siix,
    logo: siixLogo,
    tagline: "Realmente espectacular",
    summary:
      "Torre residencial en el corazón de Nunciatura, dentro del clúster urbano donde Core concentra su hábitat: cercanía a oficinas, comercio y vida de barrio.",
    model: "Residencial para habitar o rentar",
    site: "https://www.coredesarrolladora.com/",
    highlights: [
      "Zona consolidada de Nunciatura, San José",
      "Diseño y operación bajo estándar Core",
      "Comunidad y amenidades de hábitat urbano",
      "Disponibilidad y tipologías con el equipo comercial",
    ],
  },
  {
    slug: "urbn-nunciatura",
    name: "URBN Nunciatura",
    location: "Nunciatura, San José",
    city: "San José",
    stage: "En comercialización",
    type: "Residencial urbano",
    image: urbnNunciatura,
    logo: urbnNunciaturaLogo,
    tagline: "Redefiní Nunciatura",
    summary:
      "Inspirado en el desarrollo de las grandes ciudades cosmopolitas, URBN Nunciatura glorifica el estilo de vida urbano: caminar, encontrarse y vivir la ciudad.",
    model: "Residencial para habitar o rentar",
    site: "https://www.urbnnunciaturacr.com/",
    highlights: [
      "Concepto cosmopolita de la línea URBN",
      "Segunda generación después de URBN Escalante",
      "Ubicación caminable en Nunciatura",
      "Disponibilidad y tipologías con el equipo comercial",
    ],
  },
  {
    slug: "secrt-escalante",
    name: "SECRT Escalante",
    location: "Barrio Escalante, San José",
    city: "San José",
    stage: "En comercialización",
    type: "Boutique",
    image: secrtEscalante,
    logo: secrtEscalanteLogo,
    tagline: "Tu historia, nuestra magia",
    summary:
      "Proyecto boutique en Barrio Escalante, el distrito gastronómico y cultural de San José. Diseñado, operado y pensado para quienes aman el mundo del hospitality.",
    model: "Hospitality y residencia boutique",
    site: "https://www.coredesarrolladora.com/secrtescalante/",
    highlights: [
      "Barrio Escalante: gastronomía, café y cultura",
      "Escala boutique, pocas unidades",
      "Segunda generación de la línea SECRT",
      "Disponibilidad y tipologías con el equipo comercial",
    ],
  },
  {
    slug: "slva-guachipelin",
    name: "SLVA Guachipelín",
    location: "Guachipelín, Escazú",
    city: "Escazú",
    stage: "Últimas unidades",
    type: "Hospitality",
    image: slva,
    logo: slvaLogo,
    tagline: "Sé dueño de la última SLVA de Guachipelín",
    summary:
      "Diseñado, operado y pensado 100% para inversionistas que aman el mundo del hospitality. Es la última SLVA disponible en Guachipelín.",
    model: "Renta administrada por Core",
    site: "https://www.coredesarrolladora.com/slva/",
    highlights: [
      "Últimas unidades disponibles",
      "Guachipelín, Escazú: corredor corporativo",
      "Operación hotelera bajo estándar Core",
      "Disponibilidad con el equipo comercial",
    ],
  },
];

export const soldProjects: Opportunity[] = [
  {
    slug: "urbn-escalante",
    name: "URBN Escalante",
    location: "Barrio Escalante, San José",
    city: "San José",
    stage: "Vendido",
    type: "Residencial urbano",
    image: urbnEscalante,
    logo: urbnEscalanteLogo,
    tagline: "El origen de la línea URBN",
    summary: "Primer URBN de Core, en el distrito gastronómico de San José. Proyecto vendido en su totalidad.",
    model: "Residencial urbano",
    sold: true,
    highlights: [],
  },
  {
    slug: "cosmopolitan-tower",
    name: "Cosmopolitan Tower",
    location: "San José",
    city: "San José",
    stage: "Vendido",
    type: "Torre residencial",
    image: cosmopolitan,
    logo: cosmopolitanLogo,
    tagline: "Vida en altura",
    summary: "Torre de la primera etapa de Core, colocada por completo entre inversionistas y residentes.",
    model: "Torre residencial",
    sold: true,
    highlights: [],
  },
  {
    slug: "secrt-sabana",
    name: "SECRT Sabana",
    location: "Sabana, San José",
    city: "San José",
    stage: "Vendido",
    type: "Boutique",
    image: secrtSabana,
    logo: secrtSabanaLogo,
    tagline: "El primer SECRT",
    summary: "Proyecto boutique frente al pulmón verde de San José. Vendido en su totalidad.",
    model: "Hospitality boutique",
    sold: true,
    highlights: [],
  },
  {
    slug: "metro",
    name: "Metro",
    location: "San José",
    city: "San José",
    stage: "Vendido",
    type: "Residencial urbano",
    image: metro,
    logo: metroLogo,
    tagline: "Hábitat urbano de escala media",
    summary: "Desarrollo urbano de Core entregado y colocado en su totalidad.",
    model: "Residencial urbano",
    sold: true,
    highlights: [],
  },
];

export const platformFeatures = [
  {
    title: "Tu portafolio Core, siempre actualizado",
    body:
      "Capital colocado, participación por proyecto, distribuciones recibidas y documentos de cada inversión en una sola vista. Sin esperar el correo del trimestre.",
    points: ["Posición consolidada", "Historial de distribuciones", "Expediente legal por inversión"],
  },
  {
    title: "Métricas que sí podés auditar",
    body:
      "TIR (XIRR), Cash-on-Cash, Equity Multiple y NOI calculados sobre tus flujos reales, con las fechas y montos usados a la vista y la metodología publicada dentro del portal.",
    points: ["Exportación a PDF y CSV", "Panel de metodología", "Flujos de caja detallados"],
  },
  {
    title: "La obra, fotografiada",
    body:
      "Avance por fase con porcentajes, fechas estimadas contra reales y galería fotográfica actualizada por el equipo de proyecto de Core.",
    points: ["Avance por fase", "Galería de obra", "Alertas de hitos"],
  },
];

export const aiExamples = [
  {
    q: "¿Cuánto he recibido en distribuciones este año?",
    a: "Consulta tus distribuciones fechadas por proyecto y te devuelve el total del período con el detalle que lo compone.",
  },
  {
    q: "¿En qué fase va la obra de mi proyecto?",
    a: "Resume el avance por fase, las fechas reales contra las estimadas y las fotos más recientes del equipo de campo.",
  },
  {
    q: "¿Qué dice mi contrato sobre el retorno preferente?",
    a: "Busca dentro de tus propios documentos y cita el fragmento exacto del expediente donde aparece la cláusula.",
  },
  {
    q: "¿Cuál es mi próximo pago y por cuánto?",
    a: "Revisa tu plan de pagos, identifica la próxima cuota y te indica monto, fecha y estado.",
  },
];

export const differentiators = [
  { title: "Hábitat urbano", body: "Core no vende metros cuadrados: construye comunidad en zonas caminables de San José." },
  { title: "Operación propia", body: "Los proyectos hospitality son diseñados, operados y administrados por el mismo equipo que los desarrolla." },
  { title: "Track record entregado", body: "URBN Escalante, Cosmopolitan Tower, SECRT Sabana y Metro: proyectos colocados en su totalidad." },
  { title: "Obra documentada", body: "Fotografía y bitácora de cada fase constructiva, actualizada por el equipo de proyecto." },
  { title: "Expediente legal", body: "Contratos, escrituras y adendas disponibles para descarga desde tu portafolio." },
  { title: "Asistente con IA", body: "Preguntá en lenguaje natural por tu posición, tus pagos o tus documentos y obtené la respuesta con su fuente." },
];

export const howItWorks = [
  { step: "01", title: "Solicitá acceso", body: "Contanos tu perfil y qué proyecto Core te interesa. Un ejecutivo te contacta para conversar." },
  { step: "02", title: "Verificación", body: "Completamos la verificación de identidad y cumplimiento con el acompañamiento del equipo Core." },
  { step: "03", title: "Elegí tu unidad o participación", body: "Revisá el expediente del proyecto: planos, tipologías, modelo de operación y condiciones." },
  { step: "04", title: "Seguí tu inversión", body: "Desde PortalCore: pagos, distribuciones, métricas, avance de obra y documentos, en tiempo real." },
];

export const faqs = [
  {
    category: "Acceso",
    items: [
      { q: "¿Quién puede invertir con Core?", a: "Cualquier persona interesada en los proyectos Core que complete el proceso de verificación de identidad y cumplimiento. El equipo revisa cada solicitud de acceso de forma individual." },
      { q: "¿Cuánto tarda la aprobación?", a: "Un ejecutivo de Core te contacta tras recibir tu solicitud para conversar sobre el proyecto que te interesa y explicarte los pasos siguientes." },
      { q: "¿PortalCore es lo mismo que core.cr?", a: "No. core.cr es el sitio de marca de Core. PortalCore es la plataforma privada donde cada inversionista y cada comprador da seguimiento a su inversión, sus pagos y su obra." },
    ],
  },
  {
    category: "Proyectos",
    items: [
      { q: "¿Qué proyectos están disponibles hoy?", a: "Babylon, SIIX Nunciatura, URBN Nunciatura, SECRT Escalante y las últimas unidades de SLVA Guachipelín. La disponibilidad por tipología la confirma el equipo comercial." },
      { q: "¿Cuál es la diferencia entre los proyectos residenciales y los hospitality?", a: "Los proyectos hospitality como Babylon y SLVA están concebidos para renta corta administrada por Core. Los residenciales como SIIX y URBN están pensados para habitar o rentar de forma tradicional." },
      { q: "¿Publican retornos objetivo?", a: "En este sitio solo mostramos información publicada por Core. Las condiciones económicas de cada proyecto se conversan directamente con el equipo comercial y quedan en el expediente de tu inversión dentro del portal." },
    ],
  },
  {
    category: "Plataforma",
    items: [
      { q: "¿Cómo se calculan las métricas?", a: "La TIR se calcula con XIRR sobre tus flujos reales fechados; Cash-on-Cash, Equity Multiple y NOI siguen las fórmulas publicadas en el panel de metodología dentro del portal." },
      { q: "¿Puedo exportar mi información?", a: "Sí. Desde tu portafolio podés descargar un PDF o CSV con las métricas y el detalle de flujos usados en el cálculo." },
      { q: "¿Qué hace el asistente de IA?", a: "Responde preguntas sobre tu propia información: posición, distribuciones, pagos, avance de obra y contenido de tus documentos, citando la fuente de cada dato." },
      { q: "¿Mis datos están protegidos?", a: "Cada usuario solo puede ver la información asociada a su perfil, con control de acceso aplicado a nivel de base de datos y registro de auditoría de las operaciones sensibles." },
    ],
  },
];

export const team = [
  { name: "Equipo de desarrollo", role: "Diseño y construcción de cada proyecto Core" },
  { name: "Equipo de operación", role: "Administración hotelera y de renta" },
  { name: "Equipo comercial", role: "Acompañamiento a inversionistas y compradores" },
  { name: "Comunidad Core", role: "Experiencias, cultura y estilo de vida" },
];

export const contactInfo = {
  address: "San José, Costa Rica",
  email: "inversiones@portalcore.app",
  site: "core.cr",
  hours: "Lunes a viernes, 8:00 a 17:00 (GMT-6)",
};
