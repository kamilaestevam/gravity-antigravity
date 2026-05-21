/**
 * dashboardSuggestions.ts — Wrapper de sugestões para o produto BID Frete Internacional
 */
import { generateSuggestions as _generateSuggestions, getComplementaryFields as _getComplementaryFields, suggestChartType, } from '@nucleo/dashboard';
import { DASHBOARD_CATALOG } from './dashboardCatalog';
export { suggestChartType };
export function generateSuggestions(existingWidgetIds, derivedMetrics = [], startY = 0, existingFieldKeys = []) {
    return _generateSuggestions(DASHBOARD_CATALOG, existingWidgetIds, derivedMetrics, startY, existingFieldKeys);
}
export function getComplementaryFields(selectedKeys) {
    return _getComplementaryFields(DASHBOARD_CATALOG, selectedKeys);
}
//# sourceMappingURL=dashboardSuggestions.js.map