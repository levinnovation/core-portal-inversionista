# Demo funcional con datos reales de Core

Objetivo: que los portales (Admin, Inversionistas, Clientes) muestren los proyectos reales de Core y que existan cuentas demo con credenciales conocidas para recorrer la experiencia completa.

## 1. Reemplazar los datos ficticios

Hoy la base tiene 3 proyectos inventados (Torre Polanco, Vista Marina, Bosques Reforma) con imágenes de stock. Se eliminan junto con sus unidades, fases, inversiones, ventas, distribuciones y pagos, y se cargan los proyectos reales:

- Babylon (Nunciatura) — apart-hotel, en comercialización
- SIIX Nunciatura — residencial urbano
- URBN Nunciatura — residencial urbano
- SECRT Escalante — boutique hospitality
- SLVA Guachipelín (Escazú) — últimas unidades
- Históricos vendidos: URBN Escalante, Cosmopolitan Tower, SECRT Sabana, Metro (para track record)

Cada proyecto usa la foto y el logo reales ya presentes en el proyecto, ubicación, tipología y estado coherentes con lo publicado por Core. Montos en USD, con precios de unidad realistas para San José/Escazú (rango aproximado $150k–$450k según metraje).

Se generan además: unidades por tipología con metrajes reales (ej. Babylon 41.70–67.70 m²), fases constructivas con avance y fechas, inversiones, distribuciones fechadas (para que IRR/XIRR y los gráficos tengan sentido), ventas y cronogramas de pago con casos al día, pendientes y vencidos.

## 2. Cuatro cuentas demo

| Cuenta | Perfil |
|---|---|
| inversionista1@demo.portalcore.app | Portafolio grande, 3 proyectos, distribuciones históricas |
| inversionista2@demo.portalcore.app | Ticket único en Babylon, primera distribución reciente |
| cliente1@demo.portalcore.app | Unidad en URBN Nunciatura, pagos al día |
| cliente2@demo.portalcore.app | Unidad en SIIX, una cuota vencida y financiamiento bancario |

Todas con la misma contraseña demo (te la entrego al terminar), correo confirmado, rol asignado y vinculadas a sus registros de `investors` / `customers` para que el RLS devuelva exactamente su información. El admin actual (`mosherosenstocks@gmail.com`) las verá en Prospectos/Inversionistas/Clientes y podrá usar "Impersonate" sobre cada una.

## 3. Coherencia del sitio público y los mockups

`src/content/site.ts` ya usa los proyectos reales; se alinean los mockups de la landing (`PortalMock.tsx`) y el dashboard demo para que los nombres, montos y avances coincidan con lo que está en la base, de modo que lo que promete el sitio sea lo que se ve al entrar.

## Detalles técnicos

- Borrado y carga vía la herramienta de datos (no migraciones de esquema); orden de borrado respetando llaves foráneas: payments → sales → distributions → investments → units/project_phases → projects.
- Creación de usuarios con Admin API (email confirmado), inserción en `user_roles` (`investor` / `customer`) y enlace `user_id` en `investors` / `customers`.
- Documentos demo: se registran entradas en `documents` apuntando a archivos de ejemplo en el bucket para que el asistente RAG y la pestaña Documentos no estén vacíos.
- No se toca el esquema ni las políticas RLS existentes.
