/**
 * dashboardSuggestions.ts — Wrapper de sugestões para o produto Pedido
 *
 * Delega toda a lógica ao motor genérico do nucleo-global,
 * passando o catálogo específico do produto.
 *
 * Para criar sugestões em outro produto, basta copiar este arquivo,
 * trocar o DASHBOARD_CATALOG e os BUILT_IN_DERIVED.
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
