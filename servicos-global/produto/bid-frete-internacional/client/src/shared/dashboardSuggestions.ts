/**
 * dashboardSuggestions.ts — Wrapper de sugestões para o produto BID Frete Internacional
 */

import {
  generateSuggestions as _generateSuggestions,
  getComplementaryFields as _getComplementaryFields,
  suggestChartType,
} from '@nucleo/dashboard'
import type { EnrichedCatalogField } from '@nucleo/dashboard'
import { DASHBOARD_CATALOG } from './dashboardCatalog'
import type { DerivedMetric } from './derivedMetrics'

export type { SuggestedWidget } from '@nucleo/dashboard'
export { suggestChartType }

export function generateSuggestions(
  existingWidgetIds: string[],
  derivedMetrics: DerivedMetric[] = [],
  startY = 0,
  existingFieldKeys: string[] = [],
) {
  return _generateSuggestions(DASHBOARD_CATALOG, existingWidgetIds, derivedMetrics, startY, existingFieldKeys)
}

export function getComplementaryFields(selectedKeys: string[]): EnrichedCatalogField[] {
  return _getComplementaryFields(DASHBOARD_CATALOG, selectedKeys)
}
