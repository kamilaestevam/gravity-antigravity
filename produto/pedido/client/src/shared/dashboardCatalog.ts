/**
 * dashboardCatalog.ts — Mapeamento do CARDS_CATALOGO para CatalogField[]
 *
 * Enriquece cada métrica com:
 * - semanticType: semântica para o motor de sugestão
 * - domain: entidade de origem (pedido | item)
 * - complementaryFields: campos que fazem sentido combinados
 * - chartTypes: visualizações compatíveis
 */

import type { CatalogField } from '@nucleo/dashboard'

export type SemanticType = 'count' | 'sum_currency' | 'sum_qty' | 'ratio' | 'date'
export type FieldDomain  = 'pedido' | 'item'

export interface EnrichedCatalogField extends CatalogField {
  semanticType: SemanticType
  domain: FieldDomain
  complementaryFields: string[]
}

export const DASHBOARD_CATALOG: EnrichedCatalogField[] = [

  // ── Pedido — Contagens ──────────────────────────────────────────────────────
  {
    key: 'total_pedidos',
    label: 'Total de Pedidos',
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
    productId: 'pedido',
    type: 'number',
    aggregations: ['COUNT'],
    permission: 'pedido.read',
    chartTypes: ['KPI_CARD', 'LINE', 'DONUT'],
    semanticType: 'count',
    domain: 'pedido',
    complementaryFields: ['total_pedidos', 'pedidos_em_andamento', 'pedidos_atrasados'],
  },
  {
    key: 'pedidos_em_andamento',
    label: 'Em Andamento',
    productId: 'pedido',
    type: 'number',
    aggregations: ['COUNT'],
    permission: 'pedido.read',
    chartTypes: ['KPI_CARD', 'LINE', 'DONUT'],
    semanticType: 'count',
    domain: 'pedido',
    complementaryFields: ['total_pedidos', 'pedidos_abertos', 'pedidos_atrasados'],
  },
  {
    key: 'pedidos_atrasados',
    label: 'Pedidos Atrasados',
    productId: 'pedido',
    type: 'number',
    aggregations: ['COUNT'],
    permission: 'pedido.read',
    chartTypes: ['KPI_CARD', 'LINE', 'BAR'],
    semanticType: 'count',
    domain: 'pedido',
    complementaryFields: ['total_pedidos', 'pedidos_abertos'],
  },

  // ── Pedido — Financeiro ─────────────────────────────────────────────────────
  {
    key: 'valor_total',
    label: 'Valor Total dos Pedidos',
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
    key: 'cobertura_pendente',
    label: 'Cobertura Pendente',
    productId: 'pedido',
    type: 'currency',
    aggregations: ['SUM'],
    permission: 'pedido.read',
    chartTypes: ['KPI_CARD', 'LINE'],
    semanticType: 'sum_currency',
    domain: 'pedido',
    complementaryFields: ['valor_total', 'valor_itens_total'],
  },
  {
    key: 'valor_itens_total',
    label: 'Valor Total dos Itens',
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
    productId: 'pedido',
    type: 'number',
    aggregations: ['SUM'],
    permission: 'pedido.read',
    chartTypes: ['KPI_CARD', 'LINE', 'BAR'],
    semanticType: 'sum_qty',
    domain: 'item',
    complementaryFields: ['qtd_inicial_total', 'qtd_atual_total', 'qtd_transferida_total'],
  },
  {
    key: 'qtd_atual_total',
    label: 'Qtd. Atual (Itens)',
    productId: 'pedido',
    type: 'number',
    aggregations: ['SUM'],
    permission: 'pedido.read',
    chartTypes: ['KPI_CARD', 'LINE', 'BAR'],
    semanticType: 'sum_qty',
    domain: 'item',
    complementaryFields: ['qtd_inicial_total', 'itens_prontos', 'qtd_transferida_total'],
  },
  {
    key: 'qtd_transferida_total',
    label: 'Qtd. Transferida',
    productId: 'pedido',
    type: 'number',
    aggregations: ['SUM'],
    permission: 'pedido.read',
    chartTypes: ['KPI_CARD', 'LINE', 'BAR'],
    semanticType: 'sum_qty',
    domain: 'item',
    complementaryFields: ['qtd_inicial_total', 'qtd_atual_total', 'itens_prontos'],
  },
  {
    key: 'qtd_inicial_total',
    label: 'Qtd. Inicial (Itens)',
    productId: 'pedido',
    type: 'number',
    aggregations: ['SUM'],
    permission: 'pedido.read',
    chartTypes: ['KPI_CARD', 'LINE', 'BAR'],
    semanticType: 'sum_qty',
    domain: 'item',
    complementaryFields: ['qtd_atual_total', 'itens_prontos', 'qtd_transferida_total'],
  },
]

export const CATALOG_BY_KEY = Object.fromEntries(
  DASHBOARD_CATALOG.map(f => [f.key, f]),
)
