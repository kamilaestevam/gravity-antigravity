import {
  generateSuggestions as _generateSuggestions,
  getComplementaryFields as _getComplementaryFields,
} from '@nucleo/dashboard'
import type { EnrichedCatalogField } from '@nucleo/dashboard'
import { DASHBOARD_CATALOG_FORNECEDOR } from './dashboard-fornecedor-catalog'
import type { DerivedMetric } from './derivedMetrics'

export type { SuggestedWidget } from '@nucleo/dashboard'

export function generateSuggestionsFornecedor(
  existingWidgetIds: string[],
  derivedMetrics: DerivedMetric[] = [],
  startY = 0,
  existingFieldKeys: string[] = [],
) {
  return _generateSuggestions(
    DASHBOARD_CATALOG_FORNECEDOR,
    existingWidgetIds,
    derivedMetrics,
    startY,
    existingFieldKeys,
  )
}

export function getComplementaryFieldsFornecedor(selectedKeys: string[]): EnrichedCatalogField[] {
  return _getComplementaryFields(DASHBOARD_CATALOG_FORNECEDOR, selectedKeys)
}
