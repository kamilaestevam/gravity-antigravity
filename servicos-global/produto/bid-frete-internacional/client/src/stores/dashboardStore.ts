/**
 * dashboardStore.ts — Estado global do Dashboard do BID Frete Internacional
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

  // ── Painéis ──────────────────────────────────────────────────────────────────
  paineis: DashboardPainel[]
  painelAtualId: string | null
  widgetsByPainel: Record<string, DashboardWidgetConfig[]>  // widgets por painel
  setPaineis: (paineis: DashboardPainel[]) => void
  setPainelAtual: (id: string) => void
  salvarWidgetsPainelAtual: (painelId: string, widgets: DashboardWidgetConfig[]) => void
}

export const DEFAULT_WIDGETS: DashboardWidgetConfig[] = [
  // ── Linha 1 — KPIs Operacionais (largura total, 4 colunas iguais) ─────────
  {
    id: 'kpi_saving_total',
    title: 'Saving Total',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'saving_total', operation: 'SUM' }],
      filters: { period: '30d' },
    },
    position: { x: 0, y: 0, w: 3, h: 3 },
  },
  {
    id: 'kpi_valor_medio',
    title: 'Valor Médio Ganho',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'valor_medio_ganho_bid_frete_internacional', operation: 'AVG' }],
      filters: { period: '30d' },
    },
    position: { x: 3, y: 0, w: 3, h: 3 },
  },
  {
    id: 'kpi_transit_time',
    title: 'Transit Time Médio',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'transit_time', operation: 'AVG' }],
      filters: { period: '30d' },
    },
    position: { x: 6, y: 0, w: 3, h: 3 },
  },
  {
    id: 'kpi_ganho_percentual',
    title: 'Ganho Percentual',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'ganho_percentual_ganho_bid_frete_internacional', operation: 'AVG' }],
      filters: { period: '30d' },
    },
    position: { x: 9, y: 0, w: 3, h: 3 },
  },

  // ── Linha 2 — GABI AI Insights e Gráficos Principais ─────────────────────
  {
    id: 'gabi_insights',
    title: 'GABI AI · Insights',
    chart_type: 'GABI_INSIGHTS',
    query_spec: { fields: [], filters: { period: '30d' } },
    position: { x: 0, y: 3, w: 6, h: 4 },
  },
  {
    id: 'volume_mensal_chart',
    title: 'Volume Mensal de Cotações',
    chart_type: 'LINE',
    query_spec: {
      fields: [{ key: 'volume_mensal', operation: 'COUNT' }],
      filters: { period: '12m' },
    },
    position: { x: 6, y: 3, w: 6, h: 4 },
  },

  // ── Divisor — Alertas Operacionais ───────────────────────────────────────
  {
    id: 'section_alertas',
    title: 'Alertas e Fluxos Operacionais',
    chart_type: 'SECTION_LABEL',
    query_spec: { fields: [], filters: { period: '30d' } },
    position: { x: 0, y: 7, w: 12, h: 1 },
  },

  // ── Linha 3 — Cotações Detalhadas ────────────────────────────────────────
  {
    id: 'kpi_cotacoes_andamento',
    title: 'Cotações em Andamento',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'cotacoes_andamento', operation: 'COUNT' }],
      filters: { period: '30d' },
    },
    position: { x: 0, y: 8, w: 4, h: 2 },
  },
  {
    id: 'kpi_cotacoes_passadas',
    title: 'Cotações Passadas',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'cotacoes_passadas', operation: 'COUNT' }],
      filters: { period: '30d' },
    },
    position: { x: 4, y: 8, w: 4, h: 2 },
  },
  {
    id: 'kpi_valor_aprovado',
    title: 'Valor Total Aprovado',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'valor_aprovado_usd', operation: 'SUM' }],
      filters: { period: '30d' },
    },
    position: { x: 8, y: 8, w: 4, h: 2 },
  },

  // Gráfico de distribuição
  {
    id: 'status_dist_chart',
    title: 'Cotações por Status',
    chart_type: 'DISTRIBUTION',
    query_spec: {
      fields: [{ key: 'cotacoes_status', operation: 'COUNT' }],
      filters: { period: '30d' },
    },
    position: { x: 0, y: 10, w: 12, h: 4 },
  },
]

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

      editMode: true,
      setEditMode: (editMode) => set({ editMode }),
      queryBuilderOpen: false,
      setQueryBuilderOpen: (queryBuilderOpen) => set({ queryBuilderOpen }),

      // ── Painéis ──────────────────────────────────────────────────────────
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
            return { paineis, widgets: DEFAULT_WIDGETS }
          }
          return { paineis }
        }

        const saved = s.widgetsByPainel[painelAtualId ?? '']
        const widgets = saved !== undefined ? saved : DEFAULT_WIDGETS
        return { paineis, painelAtualId, widgets }
      }),

      setPainelAtual: (id) => set((s) => {
        const saved = s.widgetsByPainel[id]
        const widgets = saved !== undefined ? saved : DEFAULT_WIDGETS
        return { painelAtualId: id, widgets }
      }),
    }),
    {
      name: 'gravity:bid-frete-internacional:dashboard',
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
            state.widgets = DEFAULT_WIDGETS
          }
        }
      },
    },
  ),
)
