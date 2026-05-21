/**
 * dashboardStore.ts — Estado global do Dashboard do BID Frete Internacional
 */
import type { DashboardWidgetConfig, DerivedMetric, ActiveFilter, GlobalSlicers } from '@nucleo/dashboard';
import type { DashboardPainel } from '../shared/api';
interface DashboardState {
    widgets: DashboardWidgetConfig[];
    setWidgets: (widgets: DashboardWidgetConfig[]) => void;
    addWidget: (widget: DashboardWidgetConfig) => void;
    removeWidget: (widgetId: string) => void;
    updateWidget: (widgetId: string, patch: Partial<DashboardWidgetConfig>) => void;
    updateLayout: (updates: Array<{
        id: string;
        position: DashboardWidgetConfig['position'];
    }>) => void;
    activeFilters: ActiveFilter[];
    addFilter: (filter: ActiveFilter) => void;
    removeFilter: (field: string, sourceWidgetId: string) => void;
    clearFilters: () => void;
    slicers: GlobalSlicers;
    setPeriod: (period: string) => void;
    setStatusFilter: (status: string[]) => void;
    setDateRange: (range: GlobalSlicers['dateRange']) => void;
    userDerivedMetrics: DerivedMetric[];
    addDerivedMetric: (metric: DerivedMetric) => void;
    removeDerivedMetric: (metricId: string) => void;
    editMode: boolean;
    setEditMode: (v: boolean) => void;
    queryBuilderOpen: boolean;
    setQueryBuilderOpen: (v: boolean) => void;
    paineis: DashboardPainel[];
    painelAtualId: string | null;
    widgetsByPainel: Record<string, DashboardWidgetConfig[]>;
    setPaineis: (paineis: DashboardPainel[]) => void;
    setPainelAtual: (id: string) => void;
    salvarWidgetsPainelAtual: (painelId: string, widgets: DashboardWidgetConfig[]) => void;
}
export declare const DEFAULT_WIDGETS: DashboardWidgetConfig[];
export declare const useDashboardStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<DashboardState>, "setState" | "persist"> & {
    setState(partial: DashboardState | Partial<DashboardState> | ((state: DashboardState) => DashboardState | Partial<DashboardState>), replace?: false | undefined): unknown;
    setState(state: DashboardState | ((state: DashboardState) => DashboardState), replace: true): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<DashboardState, {
            widgets: DashboardWidgetConfig[];
            slicers: GlobalSlicers;
            userDerivedMetrics: DerivedMetric[];
            painelAtualId: string | null;
            widgetsByPainel: Record<string, DashboardWidgetConfig[]>;
        }, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: DashboardState) => void) => () => void;
        onFinishHydration: (fn: (state: DashboardState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<DashboardState, {
            widgets: DashboardWidgetConfig[];
            slicers: GlobalSlicers;
            userDerivedMetrics: DerivedMetric[];
            painelAtualId: string | null;
            widgetsByPainel: Record<string, DashboardWidgetConfig[]>;
        }, unknown>>;
    };
}>;
export {};
//# sourceMappingURL=dashboardStore.d.ts.map