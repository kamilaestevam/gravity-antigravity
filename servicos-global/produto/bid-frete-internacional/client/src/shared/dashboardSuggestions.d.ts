/**
 * dashboardSuggestions.ts — Wrapper de sugestões para o produto BID Frete Internacional
 */
import { suggestChartType } from '@nucleo/dashboard';
import type { EnrichedCatalogField } from '@nucleo/dashboard';
import type { DerivedMetric } from './derivedMetrics';
export type { SuggestedWidget } from '@nucleo/dashboard';
export { suggestChartType };
export declare function generateSuggestions(existingWidgetIds: string[], derivedMetrics?: DerivedMetric[], startY?: number, existingFieldKeys?: string[]): import("@nucleo/dashboard").SuggestedWidget[];
export declare function getComplementaryFields(selectedKeys: string[]): EnrichedCatalogField[];
//# sourceMappingURL=dashboardSuggestions.d.ts.map