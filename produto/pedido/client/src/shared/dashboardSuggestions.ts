/**
 * dashboardSuggestions.ts — Motor de sugestão por cruzamento de campos
 *
 * Regras semânticas:
 *   count ÷ count (mesmo domain)          → KPI de taxa (%)
 *   múltiplos counts no mesmo instante    → DONUT de distribuição
 *   count[] + tempo                       → LINE
 *   sum_currency + tempo                  → LINE de evolução
 *   sum_qty[] mesmo domain                → BAR agrupado
 *   sum / sum (mesmo domain)              → KPI percentual derivado
 */

import type { DashboardWidgetConfig } from '@nucleo/dashboard'
import { DASHBOARD_CATALOG, type EnrichedCatalogField } from './dashboardCatalog'
import type { DerivedMetric } from './derivedMetrics'

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface SuggestedWidget {
  id: string
  title: string
  description: string
  config: DashboardWidgetConfig
  confidence: 'high' | 'medium' | 'low'
  fields: string[]
}

// ── Utilitários ───────────────────────────────────────────────────────────────

let _posY = 0
let _posX = 0

function nextPos(w: number, h: number): { x: number; y: number; w: number; h: number } {
  if (_posX + w > 12) { _posX = 0; _posY += 3 }
  const pos = { x: _posX, y: _posY, w, h }
  _posX += w
  return pos
}

function resetPos(startY = 0) { _posX = 0; _posY = startY }

// ── Motor de sugestão ─────────────────────────────────────────────────────────

export function generateSuggestions(
  existingWidgetIds: string[],
  derivedMetrics: DerivedMetric[] = [],
  startY = 0,
): SuggestedWidget[] {
  resetPos(startY)
  const suggestions: SuggestedWidget[] = []
  const used = new Set(existingWidgetIds)

  const counts   = DASHBOARD_CATALOG.filter(f => f.semanticType === 'count')
  const currency = DASHBOARD_CATALOG.filter(f => f.semanticType === 'sum_currency')
  const qtys     = DASHBOARD_CATALOG.filter(f => f.semanticType === 'sum_qty')

  // ── Regra 1: Distribuição de status (múltiplos counts, mesmo domain) ────────
  const pedidoCounts = counts.filter(f => f.domain === 'pedido')
  if (pedidoCounts.length >= 2 && !used.has('sug_status_donut')) {
    suggestions.push({
      id: 'sug_status_donut',
      title: 'Distribuição por Status',
      description: `Proporção entre ${pedidoCounts.map(f => f.label).join(', ')}`,
      confidence: 'high',
      fields: pedidoCounts.map(f => f.key),
      config: {
        id: 'sug_status_donut',
        title: 'Distribuição por Status',
        chart_type: 'DONUT',
        query_spec: { fields: pedidoCounts.map(f => f.key), operation: 'COUNT', filters: { period: '30d' } },
        position: nextPos(4, 3),
      },
    })
  }

  // ── Regra 2: Tendência temporal para cada campo sum_currency ────────────────
  for (const field of currency) {
    const sugId = `sug_trend_${field.key}`
    if (!used.has(sugId)) {
      suggestions.push({
        id: sugId,
        title: `Evolução — ${field.label}`,
        description: `Série temporal mensal de ${field.label}`,
        confidence: 'high',
        fields: [field.key],
        config: {
          id: sugId,
          title: `Evolução — ${field.label}`,
          chart_type: 'LINE',
          query_spec: { fields: [field.key], operation: 'SUM', filters: { period: '12m' } },
          position: nextPos(6, 3),
        },
      })
    }
  }

  // ── Regra 3: Comparativo de quantidades de itens (sum_qty, mesmo domain) ───
  const itemQtys = qtys.filter(f => f.domain === 'item')
  if (itemQtys.length >= 2 && !used.has('sug_qty_bar')) {
    suggestions.push({
      id: 'sug_qty_bar',
      title: 'Comparativo de Quantidades',
      description: `${itemQtys.map(f => f.label).slice(0, 3).join(' vs ')}`,
      confidence: 'medium',
      fields: itemQtys.slice(0, 3).map(f => f.key),
      config: {
        id: 'sug_qty_bar',
        title: 'Comparativo de Quantidades',
        chart_type: 'BAR',
        query_spec: { fields: itemQtys.slice(0, 3).map(f => f.key), operation: 'SUM', filters: { period: '30d' } },
        position: nextPos(6, 3),
      },
    })
  }

  // ── Regra 4: Tendência de contagem total ────────────────────────────────────
  const totalField = DASHBOARD_CATALOG.find(f => f.key === 'total_pedidos')
  if (totalField && !used.has('sug_trend_total')) {
    suggestions.push({
      id: 'sug_trend_total',
      title: 'Pedidos por Mês',
      description: 'Evolução do volume de pedidos nos últimos 12 meses',
      confidence: 'high',
      fields: ['total_pedidos'],
      config: {
        id: 'sug_trend_total',
        title: 'Pedidos por Mês',
        chart_type: 'LINE',
        query_spec: { fields: ['total_pedidos'], operation: 'COUNT', filters: { period: '12m' } },
        position: nextPos(6, 3),
      },
    })
  }

  // ── Regra 5: Métricas derivadas como KPI ────────────────────────────────────
  for (const dm of derivedMetrics) {
    const sugId = `sug_derived_${dm.id}`
    if (!used.has(sugId)) {
      suggestions.push({
        id: sugId,
        title: dm.label,
        description: dm.description,
        confidence: 'high',
        fields: dm.inputFields,
        config: {
          id: sugId,
          title: dm.label,
          chart_type: 'KPI_CARD',
          query_spec: { fields: dm.inputFields, operation: dm.operation, filters: { period: '30d' } },
          position: nextPos(3, 1),
          config: { derivedMetricId: dm.id },
        },
      })
    }
  }

  return suggestions
}

// ── Sugestões de campos complementares (para highlight no QueryBuilder) ────────

export function getComplementaryFields(selectedKeys: string[]): EnrichedCatalogField[] {
  const complementaryKeys = new Set<string>()

  for (const key of selectedKeys) {
    const field = DASHBOARD_CATALOG.find(f => f.key === key)
    if (!field) continue
    for (const comp of field.complementaryFields) {
      if (!selectedKeys.includes(comp)) {
        complementaryKeys.add(comp)
      }
    }
  }

  return DASHBOARD_CATALOG.filter(f => complementaryKeys.has(f.key))
}

// ── Sugestão de chart_type para uma combinação de campos ─────────────────────

export function suggestChartType(fields: EnrichedCatalogField[]): string[] {
  if (fields.length === 0) return []

  const semanticTypes = fields.map(f => f.semanticType)
  const domains = [...new Set(fields.map(f => f.domain))]
  const allCounts   = semanticTypes.every(t => t === 'count')
  const allCurrency = semanticTypes.every(t => t === 'sum_currency')
  const allQty      = semanticTypes.every(t => t === 'sum_qty')
  const sameDomain  = domains.length === 1

  if (fields.length === 1) {
    return fields[0].chartTypes as string[]
  }

  if (allCounts && sameDomain && fields.length >= 2) return ['DONUT', 'BAR', 'LINE']
  if (allCurrency)                                   return ['LINE', 'BAR']
  if (allQty && sameDomain)                          return ['BAR', 'LINE']
  if (semanticTypes.includes('count') && semanticTypes.includes('sum_currency')) return ['BAR', 'LINE']

  return ['BAR', 'LINE', 'TABLE']
}
