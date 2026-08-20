# Landing Core con proyectos reales

Reemplazar el contenido ficticio del sitio público por los proyectos, el lenguaje y el modelo de negocio reales de Core (core.cr / coredesarrolladora.com), sin inventar cifras de rendimiento, y reforzar la promesa del portal: la experiencia premium del inversionista dentro de PortalCore, con asistente de IA.

## Proyectos reales (reemplazan los inventados)

En portafolio activo:

| Proyecto | Ubicación | Concepto |
|---|---|---|
| SIIX Nunciatura | Nunciatura, San José | Torre residencial urbana |
| URBN Nunciatura | Nunciatura, San José | Estilo de vida urbano cosmopolita |
| SECRT Escalante | Barrio Escalante, San José | Boutique, "tu historia, nuestra magia" |
| Babylon | Nunciatura, San José | Único apart-hotel de la zona, modelo hospitality |
| SLVA Guachipelín | Guachipelín, Escazú | Última SLVA, operación hotelera |

Entregados / vendidos: URBN Escalante, Cosmopolitan Tower, SECRT Sabana, Metro. Se muestran como track record con la etiqueta "Vendido", sin cifras de retorno.

Datos que sí se publican por proyecto: ubicación, concepto, etapa (preventa / construcción / operación / vendido), tipologías y metrajes cuando Core los publica (ej. Babylon: unidades de 41.70 m² a 67.70 m²), y el modelo de negocio (renta corta administrada vs. residencial). Las cifras de mercado de Babylon publicadas por Core (2.6 M de turistas en 2024, tarifas diarias promedio $62–$95, ocupación de referencia 95%) se muestran únicamente en la ficha de Babylon y con nota de fuente. Ningún proyecto lleva TIR, múltiplo ni ticket mínimo inventado; donde falte el dato se dice "a consultar con el equipo Core".

También se corrigen las secciones que hoy tienen números inventados: la franja de estadísticas del hero (capital gestionado, unidades, inversionistas) pasa a métricas verificables (proyectos desarrollados, zonas, años, torres entregadas — con los datos que confirmemos del sitio de Core), los "casos de éxito" con TIR ficticia pasan a proyectos vendidos sin cifras, y los testimonios inventados se retiran.

## Cambio de foco del mensaje

Voz Core: "hábitat urbano", "creadores de comunidad", tuteo costarricense ("viví", "conocé"). El sitio combina las dos audiencias reales de Core: quien quiere vivir ahí y quien quiere invertir, con el énfasis en invertir.

Bloque nuevo y central — **"Así se ve tu inversión en PortalCore"**: recorrido visual del portal del inversionista con mockups reales de la app (portafolio consolidado, métricas TIR/CoC/Equity Multiple con su metodología a la vista, distribuciones fechadas, avance de obra fotografiado por fase, expediente legal descargable) y una sección dedicada al **asistente de IA**, mostrando preguntas reales que puede responder sobre tu posición, tus pagos y tus documentos. Es la diferencia entre Core y cualquier otro desarrollador: no solo comprás una unidad, seguís tu inversión al detalle.

## Imágenes y logos

Se descargan las fotos y logotipos de cada proyecto desde el sitio público de Core, se guardan en el proyecto (`src/assets/projects/`) y se sirven desde ahí, para no depender de los servidores de Wix. Cada imagen con texto alternativo descriptivo. El hero usa la fachada principal de Core en lugar de la imagen genérica actual.

## Alcance de páginas

- `/` — landing reescrita con los proyectos reales, el bloque de experiencia PortalCore y el bloque de IA.
- `/oportunidades` — grid con los 5 proyectos activos + sección de vendidos; filtros por zona y etapa.
- `/nosotros`, `/como-invertir`, `/faq`, `/contacto` — textos alineados al lenguaje y al modelo real de Core (hospitality, administración de renta, garantías, SUGEF), sin cifras inventadas.

## Detalles técnicos

- `src/content/site.ts` se reescribe como fuente única: proyectos reales con campos opcionales (`targetReturn`, `minTicket` pasan a opcionales; las tarjetas ocultan lo que no exista en vez de mostrar un placeholder).
- Assets descargados a `src/assets/projects/` e importados con imports ES normales; logos como PNG con fondo transparente donde aplique.
- Nueva sección `PortalExperience` en `src/components/public/` que reutiliza y amplía `PortalMock`, más un bloque `AiAssistantShowcase` con ejemplos de conversación.
- Se retiran `testimonials` y `successCases` con datos ficticios del contenido y de `Home.tsx`; el track record se arma desde los proyectos con etapa "Vendido".
- SEO por página: título y descripción con los nombres reales de los proyectos, H1 único, JSON-LD de organización con los datos reales de Core.
- Sin cambios de base de datos: el formulario de leads y `/admin/prospectos` siguen igual.
