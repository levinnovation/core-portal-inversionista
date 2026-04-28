
# Análisis de brechas vs. plan original

## ✅ Lo que YA está construido (Fases A, B, C)

**Fundación (A):** schema completo de 11 tablas + `user_roles`, RLS por rol, autenticación email/password, hook `useAuth`, `ProtectedRoute`, design system Core (navy + gold), shells de los 3 portales.

**Admin Panel (B):** dashboard con KPIs, CRUD de proyectos con fases y unidades, gestión de inversionistas con registro de inversiones, gestión de clientes con ventas, uploader Excel para proyectos/pagos/distribuciones con validación y `sync_logs`.

**Portal Inversionistas (C):** dashboard con KPIs (capital, distribuciones, ROI, proyectos), gráfico de tendencia de distribuciones acumuladas, pie de asignación, tabla de inversiones, vista de proyectos con avance por fase, histórico de distribuciones, documentos, agente financiero conversacional con streaming (Lovable AI / Gemini).

## ❌ Lo que FALTA según el plan original

### Portal de Inversionistas — refinamientos
- Métricas financieras avanzadas: **IRR, Cash-on-Cash, Equity Multiple, NOI** (hoy solo hay ROI simple)
- **Waterfall visual** de distribuciones (preferred return → catch-up → carried interest)
- **Proyección de próximos pagos** basada en milestones
- Timeline visual de fases con **fotos del sitio** (campo `photos` ya existe en `project_phases` pero no se usa)
- **Descarga masiva** de documentos fiscales (ZIP)

### Portal de Clientes — está vacío (placeholder)
Esta es la mayor brecha. Faltan **todas** las vistas:
- Resumen "Mi Apartamento" (unidad, proyecto, m², precio, fecha entrega)
- **Plan de pagos visual** (timeline, pagos hechos vs pendientes, próximo pago destacado)
- Estado de financiamiento (banco, monto, tasa, plazo)
- **Avance de construcción** (galería mensual, % avance, checklist de fases)
- Documentación (contrato, planos, reglamento, actas)
- **Notificaciones automáticas** (próximos pagos, nuevas fotos, cambios de fecha)

### Admin Panel — funcionalidades pendientes
- **Almacenamiento de archivos** (storage buckets) para subir documentos, fotos de avance y avatares
- **Reportes & Analytics** (página placeholder hoy): ROI por proyecto, capital comprometido vs desembolsado, pipeline de ventas, tasa de pagos al día — con gráficos
- **Supervisión de Agentes AI** (página placeholder hoy): logs de conversaciones, feedback thumbs up/down, consumo de tokens
- **Onboarding KYC/AML** digital para inversionistas (hoy solo existe el campo de status)
- Vista de **historial de cargas Excel** (la tabla `sync_logs` se llena pero no se muestra)
- Detección de duplicados en uploader Excel

### Seguridad
- **MFA opcional** para usuarios admin
- Activar **password leaked check (HIBP)**
- **Audit log** de cambios sensibles
- Trigger para auto-asignar rol "investor" o "customer" según onboarding (hoy se asigna manual)

### Integración
- **Conector QuickBase** (postpuesto explícitamente, queda como placeholder)
- AI Agents adicionales para clientes (no solo inversionistas)

---

# Plan recomendado: 3 fases para cerrar todo

Propongo agruparlo en lo que tiene **mayor impacto visible** primero.

## 🎯 FASE D — Portal de Clientes completo + Storage
Prioridad alta porque hoy está vacío.

**Backend:**
- Crear storage buckets: `project-photos` (público), `documents` (privado), `avatars` (público)
- Políticas de storage por rol
- Trigger para autoasignar rol al completar onboarding (cliente vs inversionista)

**Frontend cliente:**
1. **Resumen** — datos de unidad, proyecto, próximo pago destacado, % avance, KPIs
2. **Mi unidad** — ficha completa (m², precio, piso, financiamiento, fecha entrega)
3. **Plan de pagos visual** — timeline con pagos hechos/pendientes/vencidos, total pagado vs pendiente, próximo pago grande
4. **Avance de obra** — galería de fotos por fase + barra de progreso global + checklist de fases
5. **Documentos** — listado descargable

**Admin (mejoras relacionadas):**
- Subida de fotos de avance a `project_phases.photos` (modal con upload)
- Subida de documentos vinculados a entidades (proyecto/unidad/sale/investor)

## 🎯 FASE E — Métricas financieras avanzadas + AI supervision + Reportes

**Inversionistas (refinamiento):**
- Calcular **IRR, Cash-on-Cash, Equity Multiple** con fórmulas reales (XIRR aproximado en JS)
- **Waterfall visual** de distribuciones por proyecto
- Galería de fotos en timeline de fases del proyecto
- Botón de descarga ZIP de documentos fiscales

**Admin — Reportes & Analytics:**
- Dashboard con gráficos: ROI por proyecto, capital comprometido vs desembolsado, pipeline de ventas (unidades vendidas/disponibles/reservadas), tasa de pagos al día
- Vista de **historial de sync_logs** con detalles de errores

**Admin — Supervisión AI:**
- Tabla `chat_messages` para persistir conversaciones del agente con feedback (thumbs up/down) y tokens
- Vista admin con métricas de uso, conversaciones recientes, feedback

**Notificaciones:**
- Tabla `notifications` + componente bell en header con realtime
- Triggers para crear notificaciones automáticas (próximo pago, nuevas fotos)

## 🎯 FASE F — Seguridad, polish, mobile & onboarding

- Activar **HIBP** (password check)
- **Onboarding KYC** mejorado para inversionistas (formulario multi-paso con upload de identificación)
- **Audit log** (tabla + trigger genérico para cambios en tablas sensibles)
- Responsive mobile en los 3 portales (sidebars colapsables)
- Refinamiento de branding (landing más pulida, logos, hero)
- Configuración de MFA opcional

---

# Detalles técnicos clave

**Storage buckets a crear:**
```
project-photos   public    # fotos de avance de obra
documents        private   # contratos, K-1s, reportes
avatars          public    # fotos de perfil
```

**Tablas nuevas necesarias:**
- `chat_messages` (conversation_id, user_id, role, content, feedback, tokens, created_at)
- `notifications` (user_id, type, title, body, link, read_at, created_at)
- `audit_logs` (user_id, action, entity_type, entity_id, before, after, created_at)

**Trigger autoasignación de rol:**
- Al insertar en `customers` con `user_id` → insertar `user_roles(role='customer')`
- Al insertar en `investors` con `user_id` → insertar `user_roles(role='investor')`

**Cálculos financieros (cliente):**
- IRR vía Newton-Raphson sobre flujos de caja (inversión negativa + distribuciones positivas)
- Cash-on-Cash = distribuciones anuales / capital invertido
- Equity Multiple = (capital + distribuciones) / capital

---

# 🤔 Pregunta para ti antes de seguir

¿Cómo quieres avanzar?

1. **Fase D primero** (Portal Clientes completo + Storage) — recomendado, es la mayor brecha visible
2. **Las 3 fases en orden D → E → F** — completamos todo el plan secuencialmente
3. **Otra prioridad** — dime cuál de los bullets te interesa más y empiezo por ahí

Una vez confirmes, implemento la fase elegida en una sola pasada.
