# Identidad visual Core: negro + amarillo, logo real

Cambio puramente visual (colores, logo, un nombre de proyecto). Nada de lógica, datos ni base de datos.

## Paleta

Se reemplaza el navy institucional por la paleta real de core.cr:

| Rol | Antes | Ahora |
|---|---|---|
| Fondo principal | crema `#FAF8F5` | negro `#151515` |
| Superficies / tarjetas | blanco | `#1A1A1A` con borde `#303030` |
| Texto principal | navy | blanco `#FFFFFF` |
| Texto secundario | gris azulado | gris suave `#C9CACE` |
| Acento / CTA | dorado `#C9A84C` | amarillo Core `#EEFF00` (texto sobre amarillo en negro) |
| Bandas hero / franjas | degradado navy | negro puro `#000000` a `#171717` |

Todo se define como tokens HSL en `index.css` (`--background`, `--card`, `--primary`, `--accent`, `--muted`, `--border`, sidebar, gradientes y sombras) y en `tailwind.config.ts`. Ningún componente lleva color fijo: al cambiar los tokens, landing, portal de inversionistas, portal de clientes y admin adoptan el look nuevo de una vez.

Ajustes de contraste que sí requieren tocar componentes: los sitios donde hoy se asume fondo claro (texto navy sobre blanco, overlays del hero, `bg-hero`, badges de etapa, gráficos de recharts con ejes oscuros, y la variante `premium` del botón que hoy es degradado dorado). El botón premium pasa a amarillo Core sólido con texto negro.

## Logo

El logotipo real de Core (marca "C" amarilla + wordmark blanco) reemplaza el texto "CORE" en:

- Nav pública, footer público
- Pantallas de login y reset de contraseña
- Sidebar del portal (inversionista/cliente) y del admin
- Favicon del sitio

Se sube como asset y se usa el mismo archivo en todos lados, con `alt="Core"`. En superficies claras que queden (si alguna), se usa la versión adecuada para que el wordmark blanco no desaparezca.

## Corrección de nombre

En `src/content/site.ts`, el proyecto "Metro" pasa a llamarse **Metropolitan Tower**, incluyendo la mención dentro del bloque de track record.

## Detalles técnicos

- `src/index.css`: reescritura de las variables de `:root` con los HSL equivalentes a `#151515`, `#1A1A1A`, `#303030`, `#EEFF00`, `#FFFFFF`, `#C9CACE`; gradientes `--gradient-hero` y `--gradient-gold` y sombras (`--shadow-gold` pasa a un glow amarillo tenue). El bloque `.dark` se alinea al mismo esquema.
- `src/components/ui/button.tsx`: variante `premium` a amarillo sólido con hover más brillante.
- Barrido de clases que asumen fondo claro en `src/components/public/*` y páginas de portal (`bg-white`, `text-primary` sobre oscuro, overlays), sustituyéndolas por tokens semánticos.
- Logo: `lovable-assets` para el archivo usado en la app + copia cuadrada en `public/favicon.png` y `<link rel="icon">` actualizado.
- Sin cambios en rutas, consultas, edge functions ni esquema.
