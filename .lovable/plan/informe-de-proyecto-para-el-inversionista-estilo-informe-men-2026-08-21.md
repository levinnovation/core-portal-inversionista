# Informe de proyecto para el inversionista (estilo informe mensual de socios)

Objetivo: que el inversionista abra un proyecto y vea el mismo set de indicadores que Core usa en su informe mensual de socios (URBN/SIIX Nunciatura), y además su lectura personal prorrateada por su aporte.

## 1. Qué verá el inversionista

Nueva página de detalle: `/inversionistas/proyectos/:id`. La lista actual queda como resumen con acceso al detalle.

Secciones del detalle, tomadas del informe real:

1. **Encabezado** — mes de etapa constructiva, avance de obra, fecha del informe, estado general.
2. **Semáforo ejecutivo** — avance de obra, unidades prevendidas, % ventas totales, utilidad (real vs proforma), % costos ejecutados, % financiamiento desembolsado, TIR proyecto, morosidad. Cada indicador con color verde/naranja/rojo según su meta.
3. **Indicadores de rentabilidad** — tabla Proforma vs Real vs Diferencia para Utilidad, TIR y COC (multiplicador), con barras comparativas.
4. **Mi inversión en este proyecto** (bloque destacado):
   - Mi capital, mi participación = capital ÷ aportes totales de socios.
   - Mi utilidad proyectada = utilidad del proyecto × participación (proforma vs actual).
   - Mi COC proyectado y mi capital al múltiplo actual (capital × COC).
   - TIR del proyecto vs mi TIR realizada a hoy (XIRR con mis flujos y capital no devuelto a costo).
   - ROI acumulado y cash-on-cash de mis distribuciones (ya implementados) en la misma fila comparativa.
   - Prometido vs proyectado: retorno prometido de mi contrato vs TIR del proyecto y mi TIR realizada.
5. **Ventas y colocación** — por torre/segmento: unidades totales, vendidas, % vendido, ingresos proyectados, ventas colocadas, cumplimiento y estado. Más el detalle real vs proyectado (absorción mensual, precio por m² habitable y total, unidades por colocar).
6. **Cobranza de primas** — primas depositadas, proyectadas, brecha, ingresos por recesiones y morosidad.
7. **Ejecución de costos y gastos** — partidas con ejecutado / por ejecutar / total / % ejecución, con barras y alerta en partidas sobre-ejecutadas.
8. **Avance de construcción** — hitos con fecha plan, fecha real y estado (completo / en curso / futuro).
9. **Financiamiento** — monto pactado, desembolsado, avance obra vs desembolso, tasa y plazo.
10. **Aportes de socios** — total de aportes y mi posición dentro del cap table (sin exponer nombres de otros socios; solo total y mi %).
11. **Riesgos y mitigaciones** — nivel, impacto, probabilidad, mitigación activa, con chips de color.
12. **Escenarios de sensibilidad** — pesimista / real / optimista para ingresos, utilidad, TIR y COC, incluyendo mi utilidad prorrateada en cada escenario.
13. **Flujo de caja proyectado** — gráfico de flujo del proyecto y mi flujo prorrateado.
14. **Exportar** — el PDF/CSV existente se amplía con estos indicadores del proyecto y mi prorrateo.

Todo con la misma estética navy + gold, responsive, y con tooltips que expliquen cada fórmula (se amplía el panel de metodología con TIR de proyecto, COC como multiplicador y prorrateo).

## 2. Cómo entran los datos

- **Ahora (demo):** se carga el informe de julio 2026 de Cielo Nunciatura (URBN + SIIX) con las cifras reales del PDF, y se generan informes coherentes para los demás proyectos activos, de modo que la vista nunca quede vacía.
- **Admin:** formulario "Informe mensual" por proyecto para capturar/editar todos los bloques (semáforo, rentabilidad, ventas, costos, hitos, financiamiento, riesgos, escenarios, flujo). Se puede versionar por mes y ver el histórico.
- **Siguiente paso:** carga del informe en Excel/PDF con extracción asistida y revisión manual antes de publicar. Queda planteado y no se implementa en esta entrega.

## 3. Detalles técnicos

Nuevas tablas (con GRANT y RLS):

- `project_reports` — un registro por proyecto y mes: `report_date`, `construction_month`, `progress_pct`, `status_note`, `units_total`, `units_sold`, `sales_pct`, `revenue_projected`, `sales_placed`, `profit_actual`, `profit_proforma`, `irr_actual`, `irr_proforma`, `coc_actual`, `coc_proforma`, `delinquency_pct`, `cost_budget_total`, `cost_executed_pct`, `expense_executed_pct`, `financing_total`, `financing_disbursed`, `interest_rate`, `loan_term`, `equity_total`, `published`.
- `project_report_items` — filas de las secciones tabulares: `report_id`, `section` (`sales_by_tower`, `sales_detail`, `collections`, `cost_execution`, `milestones`, `risks`, `scenarios`, `cash_flow`), `order_index`, `label`, `values jsonb`.

RLS: lectura para inversionistas con inversión activa en el proyecto (vía `investments` → `investors.user_id`) y para admins; escritura solo admin. `equity_total` alimenta el prorrateo: `mi participación = mi capital ÷ equity_total`, con respaldo al `%` de participación registrado si `equity_total` está vacío.

Frontend:
- `src/lib/projectReport.ts` — carga del informe más reciente, agrupación por sección y cálculo de las métricas prorrateadas.
- `src/pages/investor/InvestorProjectDetail.tsx` + componentes por sección en `src/components/investor/report/`.
- Ruta anidada en `InvestorPortal.tsx`; la lista enlaza al detalle y conserva las métricas ya existentes.
- Admin: `ProjectDetail` gana una pestaña "Informe mensual" con el formulario de captura.
- La impersonación de admin sigue funcionando en el detalle.
