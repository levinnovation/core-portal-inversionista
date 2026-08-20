# Sitio público Core — estilo Core, funcionalidad tipo OurCrowd

Rehacer la landing actual (hero + 3 tarjetas + footer) como un sitio público de captación de inversionistas, con la estructura y las secciones que usa OurCrowd, pero con el lenguaje visual Core ya definido (navy + gold, tipografía display, tarjetas con sombra suave). Contenido de proyectos curado en código; nada sale de la base de datos.

## Estructura del sitio

Barra de navegación fija con menús desplegables (patrón OurCrowd) y footer completo, compartidos por todas las páginas públicas:

```text
Invertir      -> Oportunidades | Cómo invertir | Temas de inversión (ancla)
Portafolio    -> Proyectos | Casos de éxito (ancla)
Nosotros      -> Sobre Core | Equipo | FAQ | Contacto
[Solicitar acceso]  [Iniciar sesión]
```

Páginas:

| Ruta | Contenido |
|---|---|
| `/` | Landing larga (detalle abajo) |
| `/oportunidades` | Grid de proyectos curados con filtros (ubicación, etapa, tipo) y ficha ampliada por proyecto |
| `/como-invertir` | Proceso en 4 pasos, requisitos, mínimos, cronograma, preguntas frecuentes cortas |
| `/nosotros` | Historia de Core, cifras, equipo, aliados |
| `/faq` | Preguntas agrupadas por categoría en acordeón |
| `/contacto` | Formulario de contacto + datos de oficina |

## Landing (`/`)

Secciones en orden, todas responsive:

1. **Hero** — imagen de torre con overlay navy, titular grande, subtítulo, doble CTA ("Solicitar acceso" gold / "Iniciar sesión" outline) y franja de métricas debajo (capital gestionado, proyectos, unidades entregadas, inversionistas).
2. **Barra de confianza** — logos de aliados/constructoras en escala de grises.
3. **"Todo lo que necesitas para decidir"** — bloque alterno texto/imagen (zigzag) con capturas reales del portal: portafolio, IRR y métricas, avance de obra.
4. **Oportunidades destacadas** — 3 tarjetas de proyecto con imagen, ubicación, etapa, ticket mínimo, retorno objetivo y barra de avance; enlace a `/oportunidades`.
5. **Cómo funciona** — 4 pasos numerados (Solicita acceso → Verificación → Elige tu proyecto → Sigue tu inversión).
6. **Por qué Core** — 6 diferenciadores en grid (transparencia, reportes trimestrales, obra fotografiada, documentos legales, asistente IA, equipo dedicado).
7. **Casos de éxito** — proyectos entregados con cifras de retorno.
8. **Testimonios** — 3 citas de inversionistas con foto y rol.
9. **FAQ** — 6 preguntas en acordeón, con enlace a `/faq`.
10. **CTA final** — banda navy con "Solicitar acceso" y "Ya soy inversionista".
11. **Footer** — 4 columnas de enlaces, aviso legal/disclaimer de inversión, redes.

## Captación de leads

- CTA primario en toda la navegación: **Solicitar acceso** → abre un modal con formulario (nombre, email, teléfono, monto de interés, proyecto de interés, mensaje).
- CTA secundario: **Ya soy inversionista → Iniciar sesión** hacia `/auth`.
- El formulario guarda el prospecto en una tabla nueva `leads` en el backend y notifica al equipo Core: los leads aparecen en el panel de administración en una vista nueva "Prospectos" con estado (nuevo / contactado / calificado / descartado) y notas.
- El formulario de `/contacto` usa la misma tabla con un campo de origen distinto.

## Diseño

Se conserva el sistema actual (navy `--primary`, gold `--accent`, tipografía display, `shadow-card` / `shadow-elegant`). Se agregan solo tokens derivados que hagan falta para las bandas nuevas (overlay de hero, franja de métricas, banda CTA), siempre en `index.css` y `tailwind.config.ts`, sin colores fijos en los componentes. Animaciones sobrias: aparición al hacer scroll y hover elevado en tarjetas.

## Detalles técnicos

- Nuevas páginas en `src/pages/public/` y secciones reutilizables en `src/components/public/` (`PublicNav`, `PublicFooter`, `HeroSection`, `StatsBar`, `OpportunityCard`, `HowItWorks`, `Testimonials`, `FaqAccordion`, `CtaBand`, `LeadDialog`).
- `PublicLayout` con nav + footer; rutas nuevas registradas en `src/App.tsx` como públicas (fuera de `ProtectedRoute`).
- Contenido curado centralizado en `src/content/` (proyectos, testimonios, FAQ, equipo, estadísticas) para que el equipo Core lo edite en un solo lugar.
- Tabla `leads` con RLS: inserción permitida a visitantes anónimos, lectura y actualización solo para administradores; grants explícitos para `anon`, `authenticated` y `service_role`.
- Validación del formulario con `zod` (longitudes máximas, email válido) antes de insertar.
- Menús desplegables y acordeones con los componentes shadcn ya presentes (`navigation-menu`, `accordion`, `dialog`).
- SEO por página: título y descripción propios, encabezado H1 único, texto alternativo en imágenes, JSON-LD de organización en la landing.
- Imágenes de secciones nuevas generadas con el estilo arquitectónico de la imagen de hero existente.
