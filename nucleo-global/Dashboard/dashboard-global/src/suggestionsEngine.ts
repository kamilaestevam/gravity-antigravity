/**
 * suggestionsEngine.ts — Motor genérico de sugestões de widgets
 *
 * Recebe o catálogo enriquecido de qualquer produto e gera sugestões
 * automaticamente usando regras semânticas.
 *
 * Nenhuma referência a produto específico. Qualquer produto que exporte
 * seus campos como EnrichedCatalogField[] recebe sugestões de graça.
 *
 * Regras semânticas:
 *   count[] com dimension (mesmo domain)     → DISTRIBUTION por dimensão
 *   count sem dimension                      → LINE de tendência total
 *   sum_currency[]                           → LINE de evolução por campo
 *   sum_qty[] mesmo domain (≥ 2)             → BAR comparativo
 *   derivedMetric[]                          → KPI_CARD
 */

import type {
  DashboardWidgetConfig,
  EnrichedCatalogField,
  FieldQuerySpec,
} from './tipos.js'

// ── Tipos públicos ─────────────────────────────────────────────────────────────

export interface SuggestedWidget {
  id: string
  title: string
  description: string
  config: DashboardWidgetConfig
  confidence: 'high' | 'medium' | 'low'
  fields: string[]
}

/**
 * Interface mínima que o motor consome de uma métrica derivada.
 * O produto pode ter uma interface mais rica (ex: com formula),
 * desde que satisfaça este contrato.
 */
export interface SuggestionDerivedMetric {
  id: string
  label: string
  description: string
  inputFields: string[]
  operation: string
}

// ── Posicionamento em grid ─────────────────────────────────────────────────────

function makeGrid(startY: number) {
  let posX = 0
  let posY = startY

  return function nextPos(w: number, h: number) {
    if (posX + w > 12) { posX = 0; posY += 3 }
    const pos = { x: posX, y: posY, w, h }
    posX += w
    return pos
  }
}

// ── Motor principal ────────────────────────────────────────────────────────────

export function generateSuggestions(
  catalog: EnrichedCatalogField[],
  existingWidgetIds: string[],
  derivedMetrics: SuggestionDerivedMetric[] = [],
  startY = 0,
  existingFieldKeys: string[] = [],
): SuggestedWidget[] {
  const next          = makeGrid(startY)
  const suggestions: SuggestedWidget[] = []
  const used          = new Set(existingWidgetIds)
  const coveredFields = new Set(existingFieldKeys)

  const counts   = catalog.filter(f => f.semanticType === 'count')
  const currency = catalog.filter(f => f.semanticType === 'sum_currency')
  const qtys     = catalog.filter(f => f.semanticType === 'sum_qty')

  // ── Regra 1: DISTRIBUTION por dimensão ──────────────────────────────────────
  // Agrupa campos count que possuem dimension → uma sugestão por dimensão única
  const dimensionGroups = new Map<string, EnrichedCatalogField[]>()
  for (const f of counts) {
    if (!f.dimension) continue
    const group = dimensionGroups.get(f.dimension) ?? []
    group.push(f)
    dimensionGroups.set(f.dimension, group)
  }

  for (const [dimension, fields] of dimensionGroups) {
    if (fields.length < 2) continue
    const sugId = `sug_dist_${dimension}`
    if (used.has(sugId)) continue

    const dimLabel   = fields[0].dimensionLabel ?? dimension.replace(/_/g, ' ')
    const fieldSpecs: FieldQuerySpec[] = fields.map(f => ({ key: f.key, operation: 'COUNT' }))

    suggestions.push({
      id: sugId,
      title: `Distribuição de ${dimLabel}`,
      description: `Proporção entre ${fields.map(f => f.label).join(', ')}`,
      confidence: 'high',
      fields: fields.map(f => f.key),
      config: {
        id: sugId,
        title: `Distribuição de ${dimLabel}`,
        chart_type: 'DISTRIBUTION',
        query_spec: { fields: fieldSpecs, filters: { period: '30d' } },
        position: next(4, 3),
      },
    })
  }

  // ── Regra 2: LINE de tendência para campos count sem dimension ───────────────
  const totalCounts = counts.filter(f => !f.dimension)
  for (const field of totalCounts) {
    const sugId = `sug_trend_count_${field.key}`
    if (used.has(sugId) || coveredFields.has(field.key)) continue

    suggestions.push({
      id: sugId,
      title: `${field.label} por Mês`,
      description: `Evolução do volume de ${field.label.toLowerCase()} nos últimos 12 meses`,
      confidence: 'high',
      fields: [field.key],
      config: {
        id: sugId,
        title: `${field.label} por Mês`,
        chart_type: 'LINE',
        query_spec: {
          fields: [{ key: field.key, operation: 'COUNT' }],
          filters: { period: '12m' },
        },
        position: next(6, 3),
      },
    })
  }

  // ── Regra 3: LINE de evolução para cada campo sum_currency ───────────────────
  for (const field of currency) {
    const sugId = `sug_trend_${field.key}`
    if (used.has(sugId) || coveredFields.has(field.key)) continue

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
        query_spec: {
          fields: [{ key: field.key, operation: 'SUM' }],
          filters: { period: '12m' },
        },
        position: next(6, 3),
      },
    })
  }

  // ── Regra 4: BAR comparativo para sum_qty no mesmo domain (≥ 2 campos) ───────
  const qtyByDomain = new Map<string, EnrichedCatalogField[]>()
  for (const f of qtys) {
    const group = qtyByDomain.get(f.domain) ?? []
    group.push(f)
    qtyByDomain.set(f.domain, group)
  }

  for (const [domain, fields] of qtyByDomain) {
    if (fields.length < 2) continue
    const sugId = `sug_qty_bar_${domain}`
    if (used.has(sugId)) continue

    const sliced     = fields.slice(0, 3)
    const fieldSpecs: FieldQuerySpec[] = sliced.map(f => ({ key: f.key, operation: 'SUM' }))

    const domainLabel = fields[0].domainDisplayLabel ?? domain
    const vsTitle     = sliced.map(f => f.label).join(' vs ')

    suggestions.push({
      id: sugId,
      title: `Comparativo de Quantidades — ${domainLabel}`,
      description: vsTitle,
      confidence: 'high',
      fields: sliced.map(f => f.key),
      config: {
        id: sugId,
        title: `Comparativo — ${domainLabel}`,
        chart_type: 'BAR',
        query_spec: { fields: fieldSpecs, filters: { period: '30d' } },
        position: next(6, 3),
      },
    })
  }

  // ── Regra 5: KPI_CARD para métricas derivadas ────────────────────────────────
  for (const dm of derivedMetrics) {
    const sugId = `sug_derived_${dm.id}`
    if (used.has(sugId)) continue

    const fieldSpecs: FieldQuerySpec[] = dm.inputFields.map(key => ({
      key,
      operation: dm.operation,
    }))

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
        query_spec: { fields: fieldSpecs, filters: { period: '30d' } },
        position: next(3, 1),
      },
    })
  }

  return suggestions
}

// ── Campos complementares (highlight no QueryBuilder) ─────────────────────────

export function getComplementaryFields(
  catalog: EnrichedCatalogField[],
  selectedKeys: string[],
): EnrichedCatalogField[] {
  const complementaryKeys = new Set<string>()

  for (const key of selectedKeys) {
    const field = catalog.find(f => f.key === key)
    if (!field) continue
    for (const comp of field.complementaryFields) {
      if (!selectedKeys.includes(comp)) {
        complementaryKeys.add(comp)
      }
    }
  }

  return catalog.filter(f => complementaryKeys.has(f.key))
}

// ── Sugestão de chart_type para uma combinação de campos ──────────────────────

export function suggestChartType(fields: EnrichedCatalogField[]): string[] {
  if (fields.length === 0) return []

  const semanticTypes = fields.map(f => f.semanticType)
  const domains       = [...new Set(fields.map(f => f.domain))]
  const allCounts     = semanticTypes.every(t => t === 'count')
  const allCurrency   = semanticTypes.every(t => t === 'sum_currency')
  const allQty        = semanticTypes.every(t => t === 'sum_qty')
  const sameDomain    = domains.length === 1

  if (fields.length === 1) return fields[0].chartTypes as string[]

  if (allCounts && sameDomain && fields.length >= 2) return ['DISTRIBUTION', 'BAR', 'LINE']
  if (allCurrency)                                   return ['LINE', 'BAR']
  if (allQty && sameDomain)                          return ['BAR', 'LINE']
  if (semanticTypes.includes('count') && semanticTypes.includes('sum_currency')) return ['BAR', 'LINE']

  return ['BAR', 'LINE', 'TABLE']
}
