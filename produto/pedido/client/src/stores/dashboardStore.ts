/**
 * dashboardStore.ts — Estado global do Dashboard
 *
 * Responsabilidades:
 * - Widgets configurados pelo usuário (persistidos em localStorage → API futura)
 * - Filtros ativos para cross-filtering entre widgets
 * - Slicers globais (período, status, etc.)
 * - Métricas derivadas user-defined
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DashboardWidgetConfig } from '@nucleo/dashboard'
import type { DerivedMetric } from '../shared/derivedMetrics'

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface ActiveFilter {
  field: string
  value: string | number
  label: string
  /** origem: qual widget gerou o filtro */
  sourceWidgetId: string
}

export interface GlobalSlicers {
  period: string
  status: string[]     // ex: ['abertos', 'atrasados'] — vazio = todos
  dateRange: { from: string; to: string } | null
}

interface DashboardState {
  // Widgets
  widgets: DashboardWidgetConfig[]
  setWidgets: (widgets: DashboardWidgetConfig[]) => void
  addWidget: (widget: DashboardWidgetConfig) => void
  removeWidget: (widgetId: string) => void
  updateWidget: (widgetId: string, patch: Partial<DashboardWidgetConfig>) => void
  updateLayout: (updates: Array<{ id: string; position: DashboardWidgetConfig['position'] }>) => void

  // Filtros de cross-filtering
  activeFilters: ActiveFilter[]
  addFilter: (filter: ActiveFilter) => void
  removeFilter: (field: string, sourceWidgetId: string) => void
  clearFilters: () => void

  // Slicers globais
  slicers: GlobalSlicers
  setPeriod: (period: string) => void
  setStatusFilter: (status: string[]) => void
  setDateRange: (range: GlobalSlicers['dateRange']) => void

  // Métricas derivadas user-defined
  userDerivedMetrics: DerivedMetric[]
  addDerivedMetric: (metric: DerivedMetric) => void
  removeDerivedMetric: (metricId: string) => void

  // UI
  editMode: boolean
  setEditMode: (v: boolean) => void
  queryBuilderOpen: boolean
  setQueryBuilderOpen: (v: boolean) => void
}

// ── Widgets padrão ────────────────────────────────────────────────────────────

export const DEFAULT_WIDGETS: DashboardWidgetConfig[] = [
  { id: 'pedidos_por_mes',   title: 'Pedidos por Mês',         chart_type: 'LINE',  query_spec: { fields: ['total_pedidos'],      operation: 'COUNT', filters: { period: '12m' } }, position: { x: 0, y: 0, w: 6, h: 3 } },
  { id: 'cobertura_trend',   title: 'Evolução da Cobertura',   chart_type: 'LINE',  query_spec: { fields: ['cobertura_pendente'], operation: 'SUM',   filters: { period: '12m' } }, position: { x: 6, y: 0, w: 6, h: 3 } },
  { id: 'valor_total_trend', title: 'Evolução do Valor Total', chart_type: 'LINE',  query_spec: { fields: ['valor_total'],        operation: 'SUM',   filters: { period: '12m' } }, position: { x: 0, y: 3, w: 8, h: 3 } },
  { id: 'status_dist',       title: 'Distribuição por Status', chart_type: 'DONUT', query_spec: { fields: ['pedidos_abertos', 'pedidos_em_andamento', 'pedidos_atrasados'], operation: 'COUNT', filters: { period: '30d' } }, position: { x: 8, y: 3, w: 4, h: 3 } },
]

// ── Store ─────────────────────────────────────────────────────────────────────

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      // Widgets
      widgets: DEFAULT_WIDGETS,
      setWidgets: (widgets) => set({ widgets }),
      addWidget: (widget) => set(s => ({ widgets: [...s.widgets, widget] })),
      removeWidget: (id) => set(s => ({ widgets: s.widgets.filter(w => w.id !== id) })),
      updateWidget: (id, patch) => set(s => ({ widgets: s.widgets.map(w => w.id === id ? { ...w, ...patch } : w) })),
      updateLayout: (updates) => set(s => ({
        widgets: s.widgets.map(w => {
          const upd = updates.find(u => u.id === w.id)
          return upd ? { ...w, position: upd.position } : w
        }),
      })),

      // Filtros
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

      // Slicers
      slicers: { period: '30d', status: [], dateRange: null },
      setPeriod: (period) => set(s => ({ slicers: { ...s.slicers, period } })),
      setStatusFilter: (status) => set(s => ({ slicers: { ...s.slicers, status } })),
      setDateRange: (dateRange) => set(s => ({ slicers: { ...s.slicers, dateRange } })),

      // Métricas derivadas
      userDerivedMetrics: [],
      addDerivedMetric: (metric) => set(s => ({
        userDerivedMetrics: [...s.userDerivedMetrics, { ...metric, userDefined: true }],
      })),
      removeDerivedMetric: (id) => set(s => ({
        userDerivedMetrics: s.userDerivedMetrics.filter(m => m.id !== id),
      })),

      // UI
      editMode: false,
      setEditMode: (editMode) => set({ editMode }),
      queryBuilderOpen: false,
      setQueryBuilderOpen: (queryBuilderOpen) => set({ queryBuilderOpen }),
    }),
    {
      name: 'gravity:pedido:dashboard',
      version: 2,
      partialize: (s) => ({
        widgets: s.widgets,
        slicers: s.slicers,
        userDerivedMetrics: s.userDerivedMetrics,
      }),
    },
  ),
)
