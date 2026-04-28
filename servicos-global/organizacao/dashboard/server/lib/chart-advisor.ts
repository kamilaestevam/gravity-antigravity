import type { CatalogField, AggregationType, ChartType } from './catalog.js'

/**
 * Sugere o tipo de gráfico mais adequado baseado nos campos e operação.
 * Retorna lista ordenada: [sugestão principal, ...alternativas]
 */
export function suggestChartTypes(
  fields: CatalogField[],
  operation: AggregationType
): ChartType[] {
  // Diferença entre datas → KPI com média + histograma
  if (fields.every(f => f.type === 'date') || operation === 'diff_days') {
    return ['KPI_CARD', 'HISTOGRAM', 'LINE']
  }

  // Distribuição / proporção do todo → Donut
  if (operation === 'distribution') {
    return ['DONUT', 'BAR', 'TABLE']
  }

  // Tendência ao longo do tempo → Linha
  if (operation === 'trend') {
    return ['LINE', 'AREA', 'BAR']
  }

  // Percentual / gauge → KPI + Gauge
  if (fields.some(f => f.type === 'percentage')) {
    return ['KPI_CARD', 'GAUGE', 'LINE']
  }

  // Valor monetário único → KPI
  if (fields.length === 1 && fields[0].type === 'currency') {
    if (operation === 'avg') return ['KPI_CARD', 'LINE', 'GAUGE']
    if (operation === 'sum') return ['KPI_CARD', 'LINE', 'BAR']
  }

  // Contagem → KPI
  if (operation === 'count') {
    return ['KPI_CARD', 'BAR', 'LINE']
  }

  // Comparação entre categorias → Barra
  if (fields.length > 1 && operation === 'avg') {
    return ['BAR', 'BAR_HORIZONTAL', 'LINE']
  }

  // Funnel → quando o campo sugere etapas/funil
  if (fields.some(f => f.chartTypes.includes('FUNNEL'))) {
    return ['FUNNEL', 'BAR', 'TABLE']
  }

  // Fallback: usar chartTypes do primeiro campo
  return fields[0]?.chartTypes ?? ['KPI_CARD']
}

/** Verifica se um ChartType é compatível com os campos */
export function isCompatibleChartType(
  chartType: ChartType,
  fields: CatalogField[]
): boolean {
  return fields.every(f => f.chartTypes.includes(chartType))
}
