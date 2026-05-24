/**
 * dashboardCatalog.ts — Catálogo de campos do Dashboard Pedido
 *
 * Cada campo é um CatalogField enriquecido com:
 * - semanticType: semântica para o motor de sugestão
 * - domain: entidade de origem (pedido | item)
 * - complementaryFields: campos que fazem sentido combinados
 * - chartTypes: visualizações compatíveis
 * - dimension?: agrupamento para futura rota GROUP BY (Option B)
 *
 * i18n — 2026-05-22:
 * - Cada entrada possui agora um `labelKey` (i18n) referenciando `pedido.dashboard_widgets.*`.
 * - O array estático `DASHBOARD_CATALOG` continua exportado em PT-BR para compat retroativa
 *   (build-time consumers, snapshots de testes, etc.).
 * - Use `buildDashboardCatalog(t)` para obter a versão traduzida em tempo de render.
 */

import type { TFunction } from 'i18next'
import type { EnrichedCatalogField } from '@nucleo/dashboard'

export type { EnrichedCatalogField } from '@nucleo/dashboard'

/**
 * Definição interna: catálogo + chaves i18n por campo (label) e dimensão (dimensionLabel).
 * O `label` e `dimensionLabel` em PT-BR funcionam como fallback caso a chave i18n
 * não esteja carregada (ex.: tela usada em script Node fora do React).
 */
type CatalogEntryWithKeys = EnrichedCatalogField & {
  labelKey: string
  dimensionLabelKey?: string
}

const DASHBOARD_CATALOG_ENTRIES: CatalogEntryWithKeys[] = [

  // ── Pedido — Contagens ──────────────────────────────────────────────────────
  {
    key: 'total_pedidos',
    label: 'Total de Pedidos',
    labelKey: 'pedido.dashboard_widgets.field_total_pedidos',
    productId: 'pedido',
    type: 'number',
    aggregations: ['COUNT'],
    permission: 'pedido.read',
    chartTypes: ['KPI_CARD', 'LINE', 'BAR'],
    semanticType: 'count',
    domain: 'pedido',
    complementaryFields: ['pedidos_atrasados', 'pedidos_abertos', 'pedidos_em_andamento'],
  },
  {
    key: 'pedidos_abertos',
    label: 'Pedidos Abertos',
    labelKey: 'pedido.dashboard_widgets.field_pedidos_abertos',
    productId: 'pedido',
    type: 'number',
    aggregations: ['COUNT'],
    permission: 'pedido.read',
    chartTypes: ['KPI_CARD', 'LINE', 'DISTRIBUTION'],
    semanticType: 'count',
    domain: 'pedido',
    complementaryFields: ['total_pedidos', 'pedidos_em_andamento', 'pedidos_atrasados'],
    dimension: 'status_pedido',
    dimensionLabel: 'Status dos Pedidos',
    dimensionLabelKey: 'pedido.dashboard_widgets.dim_status_pedidos',
  },
  {
    key: 'pedidos_em_andamento',
    label: 'Em Andamento',
    labelKey: 'pedido.dashboard_widgets.field_pedidos_em_andamento',
    productId: 'pedido',
    type: 'number',
    aggregations: ['COUNT'],
    permission: 'pedido.read',
    chartTypes: ['KPI_CARD', 'LINE', 'DISTRIBUTION'],
    semanticType: 'count',
    domain: 'pedido',
    complementaryFields: ['total_pedidos', 'pedidos_abertos', 'pedidos_atrasados'],
    dimension: 'status_pedido',
    dimensionLabel: 'Status dos Pedidos',
    dimensionLabelKey: 'pedido.dashboard_widgets.dim_status_pedidos',
  },
  {
    key: 'pedidos_atrasados',
    label: 'Pedidos Atrasados',
    labelKey: 'pedido.dashboard_widgets.field_pedidos_atrasados',
    productId: 'pedido',
    type: 'number',
    aggregations: ['COUNT'],
    permission: 'pedido.read',
    chartTypes: ['KPI_CARD', 'LINE', 'BAR', 'DISTRIBUTION'],
    semanticType: 'count',
    domain: 'pedido',
    complementaryFields: ['total_pedidos', 'pedidos_abertos'],
    dimension: 'status_pedido',
    dimensionLabel: 'Status dos Pedidos',
    dimensionLabelKey: 'pedido.dashboard_widgets.dim_status_pedidos',
  },
  {
    key: 'pedidos_consolidados',
    label: 'Consolidados',
    labelKey: 'pedido.dashboard_widgets.field_pedidos_consolidados',
    productId: 'pedido',
    type: 'number',
    aggregations: ['COUNT'],
    permission: 'pedido.read',
    chartTypes: ['KPI_CARD', 'LINE', 'DISTRIBUTION'],
    semanticType: 'count',
    domain: 'pedido',
    complementaryFields: ['total_pedidos', 'pedidos_abertos'],
    dimension: 'status_pedido',
    dimensionLabel: 'Status dos Pedidos',
    dimensionLabelKey: 'pedido.dashboard_widgets.dim_status_pedidos',
  },
  {
    key: 'pedidos_cancelados',
    label: 'Cancelados',
    labelKey: 'pedido.dashboard_widgets.field_pedidos_cancelados',
    productId: 'pedido',
    type: 'number',
    aggregations: ['COUNT'],
    permission: 'pedido.read',
    chartTypes: ['KPI_CARD', 'LINE', 'DISTRIBUTION'],
    semanticType: 'count',
    domain: 'pedido',
    complementaryFields: ['total_pedidos'],
    dimension: 'status_pedido',
    dimensionLabel: 'Status dos Pedidos',
    dimensionLabelKey: 'pedido.dashboard_widgets.dim_status_pedidos',
  },
  {
    key: 'pedidos_rascunho',
    label: 'Rascunhos',
    labelKey: 'pedido.dashboard_widgets.field_pedidos_rascunho',
    productId: 'pedido',
    type: 'number',
    aggregations: ['COUNT'],
    permission: 'pedido.read',
    chartTypes: ['KPI_CARD', 'LINE', 'DISTRIBUTION'],
    semanticType: 'count',
    domain: 'pedido',
    complementaryFields: ['total_pedidos', 'pedidos_abertos'],
    dimension: 'status_pedido',
    dimensionLabel: 'Status dos Pedidos',
    dimensionLabelKey: 'pedido.dashboard_widgets.dim_status_pedidos',
  },

  // ── Pedido — Financeiro ─────────────────────────────────────────────────────
  {
    key: 'valor_total',
    label: 'Valor Total dos Pedidos',
    labelKey: 'pedido.dashboard_widgets.field_valor_total',
    productId: 'pedido',
    type: 'currency',
    aggregations: ['SUM'],
    permission: 'pedido.read',
    chartTypes: ['KPI_CARD', 'LINE', 'BAR'],
    semanticType: 'sum_currency',
    domain: 'pedido',
    complementaryFields: ['cobertura_pendente', 'valor_itens_total', 'total_pedidos'],
  },
  {
    key: 'valor_total_brl',
    label: 'Exposição Cambial (BRL)',
    labelKey: 'pedido.dashboard_widgets.field_valor_total_brl',
    productId: 'pedido',
    type: 'currency',
    aggregations: ['SUM'],
    permission: 'pedido.read',
    chartTypes: ['KPI_CARD', 'LINE', 'BAR'],
    semanticType: 'sum_currency',
    domain: 'pedido',
    complementaryFields: ['valor_total', 'cobertura_pendente', 'total_pedidos'],
  },
  {
    key: 'cobertura_pendente',
    label: 'Cobertura Cambial a Contratar',
    labelKey: 'pedido.dashboard_widgets.field_cobertura_pendente',
    productId: 'pedido',
    type: 'currency',
    aggregations: ['SUM'],
    permission: 'pedido.read',
    chartTypes: ['KPI_CARD', 'LINE', 'DISTRIBUTION'],
    semanticType: 'sum_currency',
    domain: 'pedido',
    complementaryFields: ['valor_total', 'valor_itens_total'],
    dimension: 'cobertura_status',
  },
  {
    key: 'valor_itens_total',
    label: 'Valor dos Itens (FOB/CIF)',
    labelKey: 'pedido.dashboard_widgets.field_valor_itens_total',
    productId: 'pedido',
    type: 'currency',
    aggregations: ['SUM'],
    permission: 'pedido.read',
    chartTypes: ['KPI_CARD', 'LINE', 'BAR'],
    semanticType: 'sum_currency',
    domain: 'pedido',
    complementaryFields: ['valor_total', 'cobertura_pendente'],
  },

  // ── Pedido — Quantidade ────────────────────────────────────────────────────
  {
    key: 'qtd_total',
    label: 'Quantidade Total',
    labelKey: 'pedido.dashboard_widgets.field_qtd_total',
    productId: 'pedido',
    type: 'number',
    aggregations: ['SUM'],
    permission: 'pedido.read',
    chartTypes: ['KPI_CARD', 'LINE', 'BAR'],
    semanticType: 'sum_qty',
    domain: 'pedido',
    complementaryFields: ['qtd_inicial_total', 'qtd_atual_total'],
  },

  // ── Item — Quantidades ──────────────────────────────────────────────────────
  {
    key: 'itens_prontos',
    label: 'Itens Prontos',
    labelKey: 'pedido.dashboard_widgets.field_itens_prontos',
    productId: 'pedido',
    type: 'number',
    aggregations: ['SUM'],
    permission: 'pedido.read',
    chartTypes: ['KPI_CARD', 'LINE', 'BAR', 'DISTRIBUTION'],
    semanticType: 'sum_qty',
    domain: 'item',
    domainDisplayLabel: 'Itens',
    complementaryFields: ['qtd_inicial_total', 'qtd_atual_total', 'qtd_transferida_total'],
    dimension: 'status_item',
  },
  {
    key: 'qtd_atual_total',
    label: 'Qtd. Atual (Itens)',
    labelKey: 'pedido.dashboard_widgets.field_qtd_atual_total',
    productId: 'pedido',
    type: 'number',
    aggregations: ['SUM'],
    permission: 'pedido.read',
    chartTypes: ['KPI_CARD', 'LINE', 'BAR', 'DISTRIBUTION'],
    semanticType: 'sum_qty',
    domain: 'item',
    domainDisplayLabel: 'Itens',
    complementaryFields: ['qtd_inicial_total', 'itens_prontos', 'qtd_transferida_total'],
    dimension: 'status_item',
  },
  {
    key: 'qtd_transferida_total',
    label: 'Qtd. Transferida',
    labelKey: 'pedido.dashboard_widgets.field_qtd_transferida_total',
    productId: 'pedido',
    type: 'number',
    aggregations: ['SUM'],
    permission: 'pedido.read',
    chartTypes: ['KPI_CARD', 'LINE', 'BAR', 'DISTRIBUTION'],
    semanticType: 'sum_qty',
    domain: 'item',
    domainDisplayLabel: 'Itens',
    complementaryFields: ['qtd_inicial_total', 'qtd_atual_total', 'itens_prontos'],
    dimension: 'status_item',
  },
  {
    key: 'qtd_inicial_total',
    label: 'Qtd. Inicial (Itens)',
    labelKey: 'pedido.dashboard_widgets.field_qtd_inicial_total',
    productId: 'pedido',
    type: 'number',
    aggregations: ['SUM'],
    permission: 'pedido.read',
    chartTypes: ['KPI_CARD', 'LINE', 'BAR'],
    semanticType: 'sum_qty',
    domain: 'item',
    domainDisplayLabel: 'Itens',
    complementaryFields: ['qtd_atual_total', 'itens_prontos', 'qtd_transferida_total'],
  },
]

/**
 * Catálogo estático em PT-BR — mantido para compat retroativa.
 * Preferir `buildDashboardCatalog(t)` em qualquer consumidor React.
 */
export const DASHBOARD_CATALOG: EnrichedCatalogField[] = DASHBOARD_CATALOG_ENTRIES

export const CATALOG_BY_KEY = Object.fromEntries(
  DASHBOARD_CATALOG.map(f => [f.key, f]),
)

/**
 * Mapa key → labelKey i18n. Útil para componentes que recebem só a key do campo
 * (ex.: WidgetEmptyGabi, DashboardPainelEditarModal via `fieldLabels`).
 */
export const CATALOG_LABEL_KEYS: Record<string, string> = Object.fromEntries(
  DASHBOARD_CATALOG_ENTRIES.map(f => [f.key, f.labelKey]),
)

/**
 * Constrói o catálogo com labels traduzidos via `t()`.
 * Use dentro de componentes React (após `const { t } = useTranslation()`).
 */
export function buildDashboardCatalog(t: TFunction): EnrichedCatalogField[] {
  return DASHBOARD_CATALOG_ENTRIES.map(entry => ({
    ...entry,
    label: t(entry.labelKey),
    dimensionLabel: entry.dimensionLabelKey ? t(entry.dimensionLabelKey) : entry.dimensionLabel,
  }))
}

/**
 * Constrói o índice CATALOG_BY_KEY traduzido.
 */
export function buildCatalogByKey(t: TFunction): Record<string, EnrichedCatalogField> {
  return Object.fromEntries(buildDashboardCatalog(t).map(f => [f.key, f]))
}
