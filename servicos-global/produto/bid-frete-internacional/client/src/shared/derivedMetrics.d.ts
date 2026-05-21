/**
 * derivedMetrics.ts — Métricas derivadas por cruzamento de campos para o BID Frete
 */
export type { DerivedOperation, DerivedMetric } from '@nucleo/dashboard';
import type { DerivedMetric } from '@nucleo/dashboard';
export declare const BUILT_IN_DERIVED: DerivedMetric[];
export declare function computeDerived(metric: DerivedMetric, values: Record<string, number>): number | null;
export declare function loadUserDerivedMetrics(): DerivedMetric[];
export declare function saveUserDerivedMetrics(metrics: DerivedMetric[]): void;
export declare function getAllDerivedMetrics(): DerivedMetric[];
//# sourceMappingURL=derivedMetrics.d.ts.map