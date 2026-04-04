/**
 * dashboardStore.ts — Estado global do Dashboard
 *
 * v3 — 2026-04-03
 * - WidgetQuerySpec agora usa FieldQuerySpec[] (operação por campo)
 * - migrateQuerySpec: converte dados salvos no formato antigo (string[])
 * - DEFAULT_WIDGETS atualizados: status_dist usa chart_type DISTRIBUTION
 * - version bump para 3 força migração de localStorage
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DashboardWidgetConfig, WidgetQuerySpec, FieldQuerySpec } from '@nucleo/dashboard'
import type { DerivedMetric } from '../shared/derivedMetrics'

// ── Migração de formato legado ────────────────────────────────────────────────

/**
 * Converte query_spec do formato antigo (fields: string[]) para o novo (fields: FieldQuerySpec[]).
 * Chamado no onRehydrateStorage para migrar dados salvos em localStorage.
 */
export function migrateQuerySpec(spec: WidgetQuerySpec): WidgetQuerySpec {
  if (!spec?.fields || spec.fields.length === 0) return spec
  // Detecta formato legado: primeiro elemento é string
  if (typeof spec.fields[0] === 'string') {
    const legacyFields = spec.fields as unknown as string[]
    const legacyOp = (spec as unknown as Record<string, string>).operation ?? 'SUM'
    return {
      ...spec,
      fields: legacyFields.map((key): FieldQuerySpec => ({ key, operation: legacyOp })),
    }
  }
  return spec
}

function migrateWidget(w: DashboardWidgetConfig): DashboardWidgetConfig {
  return { ...w, query_spec: migrateQuerySpec(w.query_spec) }
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface ActiveFilter {
  field: string
  value: string | number
  label: string
  sourceWidgetId: string
}

export interface GlobalSlicers {
  period: string
  status: string[]
  dateRange: { from: string; to: string } | null
}

interface DashboardState {
  widgets: DashboardWidgetConfig[]
  setWidgets: (widgets: DashboardWidgetConfig[]) => void
  addWidget: (widget: DashboardWidgetConfig) => void
  removeWidget: (widgetId: string) => void
  updateWidget: (widgetId: string, patch: Partial<DashboardWidgetConfig>) => void
  updateLayout: (updates: Array<{ id: string; position: DashboardWidgetConfig['position'] }>) => void

  activeFilters: ActiveFilter[]
  addFilter: (filter: ActiveFilter) => void
  removeFilter: (field: string, sourceWidgetId: string) => void
  clearFilters: () => void

  slicers: GlobalSlicers
  setPeriod: (period: string) => void
  setStatusFilter: (status: string[]) => void
  setDateRange: (range: GlobalSlicers['dateRange']) => void

  userDerivedMetrics: DerivedMetric[]
  addDerivedMetric: (metric: DerivedMetric) => void
  removeDerivedMetric: (metricId: string) => void

  editMode: boolean
  setEditMode: (v: boolean) => void
  queryBuilderOpen: boolean
  setQueryBuilderOpen: (v: boolean) => void
}

// ── Widgets padrão ────────────────────────────────────────────────────────────

export const DEFAULT_WIDGETS: DashboardWidgetConfig[] = [
  {
    id: 'pedidos_por_mes',
    title: 'Pedidos por Mês',
    chart_type: 'LINE',
    query_spec: {
      fields: [{ key: 'total_pedidos', operation: 'COUNT' }],
      filters: { period: '12m' },
    },
    position: { x: 0, y: 0, w: 6, h: 3 },
  },
  {
    id: 'cobertura_trend',
    title: 'Evolução da Cobertura',
    chart_type: 'LINE',
    query_spec: {
      fields: [{ key: 'cobertura_pendente', operation: 'SUM' }],
      filters: { period: '12m' },
    },
    position: { x: 6, y: 0, w: 6, h: 3 },
  },
  {
    id: 'valor_total_trend',
    title: 'Evolução do Valor Total',
    chart_type: 'LINE',
    query_spec: {
      fields: [{ key: 'valor_total', operation: 'SUM' }],
      filters: { period: '12m' },
    },
    position: { x: 0, y: 3, w: 8, h: 3 },
  },
  {
    // Substituído: era DONUT com hack status_dist → agora DISTRIBUTION real
    id: 'status_dist',
    title: 'Distribuição por Status',
    chart_type: 'DISTRIBUTION',
    query_spec: {
      fields: [
        { key: 'pedidos_abertos',       operation: 'COUNT' },
        { key: 'pedidos_em_andamento',  operation: 'COUNT' },
        { key: 'pedidos_atrasados',     operation: 'COUNT' },
      ],
      filters: { period: '30d' },
    },
    position: { x: 8, y: 3, w: 4, h: 3 },
  },
]

// ── Store ─────────────────────────────────────────────────────────────────────

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      widgets: DEFAULT_WIDGETS,
      setWidgets: (widgets) => set({ widgets }),
      addWidget: (widget) => set(s => ({ widgets: [...s.widgets, widget] })),
      removeWidget: (id) => set(s => ({ widgets: s.widgets.filter(w => w.id !== id) })),
      updateWidget: (id, patch) => set(s => ({
        widgets: s.widgets.map(w => w.id === id ? { ...w, ...patch } : w),
      })),
      updateLayout: (updates) => set(s => ({
        widgets: s.widgets.map(w => {
          const upd = updates.find(u => u.id === w.id)
          return upd ? { ...w, position: upd.position } : w
        }),
      })),

      activeFilters: [],
      addFilter: (filter) => set(s => ({
        activeFilters: [
          ...s.activeFilters.filter(f => !(f.field === filter.field && f.sourceWidgetId === filter.sourceWidgetId)),
          filter,
        ],
      })),
      removeFilter: (field, sourceWidgetId) => set(s => ({
        activeFilters: s.activeFilters.filter(
          f => !(f.field === field && f.sourceWidgetId === sourceWidgetId),
        ),
      })),
      clearFilters: () => set({ activeFilters: [] }),

      slicers: { period: '30d', status: [], dateRange: null },
      setPeriod: (period) => set(s => ({ slicers: { ...s.slicers, period } })),
      setStatusFilter: (status) => set(s => ({ slicers: { ...s.slicers, status } })),
      setDateRange: (dateRange) => set(s => ({ slicers: { ...s.slicers, dateRange } })),

      userDerivedMetrics: [],
      addDerivedMetric: (metric) => set(s => ({
        userDerivedMetrics: [...s.userDerivedMetrics, { ...metric, userDefined: true }],
      })),
      removeDerivedMetric: (id) => set(s => ({
        userDerivedMetrics: s.userDerivedMetrics.filter(m => m.id !== id),
      })),

      editMode: false,
      setEditMode: (editMode) => set({ editMode }),
      queryBuilderOpen: false,
      setQueryBuilderOpen: (queryBuilderOpen) => set({ queryBuilderOpen }),
    }),
    {
      name: 'gravity:pedido:dashboard',
      version: 3,  // bump: migra string[] → FieldQuerySpec[]
      partialize: (s) => ({
        widgets: s.widgets,
        slicers: s.slicers,
        userDerivedMetrics: s.userDerivedMetrics,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.widgets = state.widgets.map(migrateWidget)
        }
      },
    },
  ),
)
