/**
 * Estado do dashboard configurável — visão fornecedor (persistência separada do operacional)
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DashboardWidgetConfig, DerivedMetric, ActiveFilter, GlobalSlicers } from '@nucleo/dashboard'
import type { DashboardPainel } from '../shared/api'

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

  paineis: DashboardPainel[]
  painelAtualId: string | null
  widgetsByPainel: Record<string, DashboardWidgetConfig[]>
  setPaineis: (paineis: DashboardPainel[]) => void
  setPainelAtual: (id: string) => void
  salvarWidgetsPainelAtual: (painelId: string, widgets: DashboardWidgetConfig[]) => void
}

export const DEFAULT_WIDGETS_FORNECEDOR: DashboardWidgetConfig[] = [
  {
    id: 'kpi_pendentes_fornecedor',
    title: 'Aguardando resposta',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'cotacoes_pendentes_visao_fornecedor', operation: 'COUNT' }],
      filters: { period: '30d' },
    },
    position: { x: 0, y: 0, w: 3, h: 3 },
  },
  {
    id: 'kpi_propostas_enviadas_fornecedor',
    title: 'Propostas enviadas',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'propostas_enviadas_visao_fornecedor', operation: 'COUNT' }],
      filters: { period: '30d' },
    },
    position: { x: 3, y: 0, w: 3, h: 3 },
  },
  {
    id: 'kpi_taxa_resposta_fornecedor',
    title: 'Taxa de resposta',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'taxa_resposta_visao_fornecedor', operation: 'AVG' }],
      filters: { period: '30d' },
    },
    position: { x: 6, y: 0, w: 3, h: 3 },
  },
  {
    id: 'kpi_taxa_aprovacao_fornecedor',
    title: 'Taxa de aprovação',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'taxa_aprovacao_visao_fornecedor', operation: 'AVG' }],
      filters: { period: '30d' },
    },
    position: { x: 9, y: 0, w: 3, h: 3 },
  },
  {
    id: 'gabi_insights_fornecedor',
    title: 'GABI AI · Insights',
    chart_type: 'GABI_INSIGHTS',
    query_spec: { fields: [], filters: { period: '30d' } },
    position: { x: 0, y: 3, w: 6, h: 4 },
  },
  {
    id: 'volume_mensal_fornecedor',
    title: 'Volume mensal de propostas',
    chart_type: 'LINE',
    query_spec: {
      fields: [{ key: 'volume_mensal', operation: 'COUNT' }],
      filters: { period: '12m' },
    },
    position: { x: 6, y: 3, w: 6, h: 4 },
  },
  {
    id: 'section_funil_fornecedor',
    title: 'Funil e resultados',
    chart_type: 'SECTION_LABEL',
    query_spec: { fields: [], filters: { period: '30d' } },
    position: { x: 0, y: 7, w: 12, h: 1 },
  },
  {
    id: 'kpi_em_analise_fornecedor',
    title: 'Em análise',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'propostas_em_analise_visao_fornecedor', operation: 'COUNT' }],
      filters: { period: '30d' },
    },
    position: { x: 0, y: 8, w: 4, h: 2 },
  },
  {
    id: 'kpi_aprovadas_fornecedor',
    title: 'Aprovadas',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'propostas_aprovadas_visao_fornecedor', operation: 'COUNT' }],
      filters: { period: '30d' },
    },
    position: { x: 4, y: 8, w: 4, h: 2 },
  },
  {
    id: 'kpi_reprovadas_fornecedor',
    title: 'Reprovadas',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'propostas_reprovadas_visao_fornecedor', operation: 'COUNT' }],
      filters: { period: '30d' },
    },
    position: { x: 8, y: 8, w: 4, h: 2 },
  },
  {
    id: 'funil_dist_fornecedor',
    title: 'Funil das propostas',
    chart_type: 'DISTRIBUTION',
    query_spec: {
      fields: [{ key: 'cotacoes_status', operation: 'COUNT' }],
      filters: { period: '30d' },
    },
    position: { x: 0, y: 10, w: 12, h: 4 },
  },
]

export const useDashboardStoreFornecedor = create<DashboardState>()(
  persist(
    (set) => ({
      widgets: DEFAULT_WIDGETS_FORNECEDOR,
      setWidgets: (widgets) => set({ widgets }),
      addWidget: (widget) => set(s => ({ widgets: [...s.widgets, widget] })),
      removeWidget: (widgetId) => set(s => ({ widgets: s.widgets.filter(w => w.id !== widgetId) })),
      updateWidget: (widgetId, patch) => set(s => ({
        widgets: s.widgets.map(w => (w.id === widgetId ? { ...w, ...patch } : w)),
      })),
      updateLayout: (updates) => set(s => {
        const map = new Map(updates.map(u => [u.id, u.position]))
        return { widgets: s.widgets.map(w => (map.has(w.id) ? { ...w, position: map.get(w.id)! } : w)) }
      }),

      activeFilters: [],
      addFilter: (filter) => set(s => ({ activeFilters: [...s.activeFilters, filter] })),
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

      editMode: true,
      setEditMode: (editMode) => set({ editMode }),
      queryBuilderOpen: false,
      setQueryBuilderOpen: (queryBuilderOpen) => set({ queryBuilderOpen }),

      paineis: [],
      painelAtualId: null,
      widgetsByPainel: {},

      salvarWidgetsPainelAtual: (painelId, widgets) => set(s => ({
        widgetsByPainel: { ...s.widgetsByPainel, [painelId]: widgets },
      })),

      setPaineis: (paineis) => set((s) => {
        const painelAtualId = s.painelAtualId && paineis.some(p => p.id === s.painelAtualId)
          ? s.painelAtualId
          : (paineis.find(p => p.is_visivel)?.id ?? null)

        if (painelAtualId === s.painelAtualId) {
          if (s.widgets.length === 0 && s.widgetsByPainel[painelAtualId ?? ''] === undefined) {
            return { paineis, widgets: DEFAULT_WIDGETS_FORNECEDOR }
          }
          return { paineis }
        }

        const saved = s.widgetsByPainel[painelAtualId ?? '']
        const widgets = saved !== undefined ? saved : DEFAULT_WIDGETS_FORNECEDOR
        return { paineis, painelAtualId, widgets }
      }),

      setPainelAtual: (id) => set((s) => {
        const saved = s.widgetsByPainel[id]
        const widgets = saved !== undefined ? saved : DEFAULT_WIDGETS_FORNECEDOR
        return { painelAtualId: id, widgets }
      }),
    }),
    {
      name: 'gravity:bid-frete-internacional:dashboard:fornecedor',
      version: 1,
      partialize: (s) => ({
        widgets: s.widgets,
        slicers: s.slicers,
        userDerivedMetrics: s.userDerivedMetrics,
        painelAtualId: s.painelAtualId,
        widgetsByPainel: s.widgetsByPainel,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.painelAtualId) {
          const saved = state.widgetsByPainel?.[state.painelAtualId]
          if (saved === undefined && (!state.widgets || state.widgets.length === 0)) {
            state.widgets = DEFAULT_WIDGETS_FORNECEDOR
          }
        }
      },
    },
  ),
)
