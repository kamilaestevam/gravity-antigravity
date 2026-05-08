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
import type { DashboardWidgetConfig, WidgetQuerySpec, FieldQuerySpec, DerivedMetric, ActiveFilter, GlobalSlicers } from '@nucleo/dashboard'
import type { DashboardPainel } from '../shared/api'

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

// ActiveFilter e GlobalSlicers movidos para @nucleo/dashboard — re-exportados
export type { ActiveFilter, GlobalSlicers } from '@nucleo/dashboard'

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
  widgetsByPainel: Record<string, DashboardWidgetConfig[]>  // widgets por painel (localStorage)
  setPaineis: (paineis: DashboardPainel[]) => void
  setPainelAtual: (id: string) => void
  salvarWidgetsPainelAtual: (painelId: string, widgets: DashboardWidgetConfig[]) => void
}

// ── Widgets padrão ────────────────────────────────────────────────────────────

export const DEFAULT_WIDGETS: DashboardWidgetConfig[] = [
  // ── Linha 1 — KPIs Operacionais (largura total, 4 colunas iguais) ─────────
  {
    id: 'kpi_total_pedidos',
    title: 'Total de Pedidos',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'total_pedidos', operation: 'COUNT' }],
      filters: { period: '30d' },
    },
    position: { x: 0, y: 0, w: 3, h: 3 },
  },
  {
    id: 'kpi_pedidos_abertos',
    title: 'Pedidos em Aberto',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'pedidos_abertos', operation: 'COUNT' }],
      filters: { period: '30d' },
    },
    position: { x: 3, y: 0, w: 3, h: 3 },
  },
  {
    id: 'kpi_saldo_total',
    title: 'Saldo Total (Qtd)',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'qtd_atual_total', operation: 'SUM' }],
      filters: { period: '30d' },
    },
    position: { x: 6, y: 0, w: 3, h: 3 },
  },
  {
    id: 'kpi_valor_total',
    title: 'Valor Total (BRL)',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'valor_total_brl', operation: 'SUM' }],
      filters: { period: '30d' },
    },
    position: { x: 9, y: 0, w: 3, h: 3 },
  },

  // ── Linha 2 — GABI AI Insights (linha própria, largura total) ─────────────
  {
    id: 'gabi_insights',
    title: 'GABI AI · Insights',
    chart_type: 'GABI_INSIGHTS',
    query_spec: { fields: [], filters: { period: '30d' } },
    position: { x: 0, y: 3, w: 6, h: 4 },
  },

  // ── Linha 3 — Séries temporais ────────────────────────────────────────────
  {
    id: 'pedidos_por_mes',
    title: 'Pedidos por Mês',
    chart_type: 'LINE',
    query_spec: {
      fields: [{ key: 'total_pedidos', operation: 'COUNT' }],
      filters: { period: '12m' },
    },
    position: { x: 0, y: 6, w: 6, h: 4 },
  },
  {
    id: 'valor_total_trend',
    title: 'Evolução do Valor Total',
    chart_type: 'LINE',
    query_spec: {
      fields: [{ key: 'valor_total', operation: 'SUM' }],
      filters: { period: '12m' },
    },
    position: { x: 6, y: 6, w: 6, h: 4 },
  },

  // ── Divisor — Alertas Operacionais ───────────────────────────────────────
  {
    id: 'section_alertas',
    title: 'Alertas Operacionais',
    chart_type: 'SECTION_LABEL',
    query_spec: { fields: [], filters: { period: '30d' } },
    position: { x: 0, y: 10, w: 12, h: 1 },
  },

  // ── Linha 4 — Alertas Operacionais ───────────────────────────────────────
  {
    id: 'kpi_pedidos_atrasados',
    title: 'Pedidos Atrasados',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'pedidos_atrasados', operation: 'COUNT' }],
      filters: { period: '30d' },
    },
    position: { x: 0, y: 11, w: 4, h: 2 },
  },
  {
    id: 'kpi_sem_exportador',
    title: 'Sem Exportador',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'pedidos_sem_exportador', operation: 'COUNT' }],
      filters: { period: '30d' },
    },
    position: { x: 4, y: 11, w: 4, h: 2 },
  },
  {
    id: 'kpi_qtd_pronta',
    title: 'Qtd. Pronta',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'qtd_pronta_total', operation: 'SUM' }],
      filters: { period: '30d' },
    },
    position: { x: 8, y: 11, w: 4, h: 2 },
  },

  // ── Linha 5 — Distribuição por Status e Tipo ──────────────────────────────
  {
    id: 'status_dist',
    title: 'Distribuição por Status',
    chart_type: 'DISTRIBUTION',
    query_spec: {
      fields: [
        { key: 'pedidos_abertos',      operation: 'COUNT' },
        { key: 'pedidos_em_andamento', operation: 'COUNT' },
        { key: 'pedidos_consolidados', operation: 'COUNT' },
        { key: 'pedidos_cancelados',   operation: 'COUNT' },
        { key: 'pedidos_rascunho',     operation: 'COUNT' },
      ],
      filters: { period: '30d' },
    },
    position: { x: 0, y: 13, w: 6, h: 4 },
  },
  {
    id: 'tipo_operacao_dist',
    title: 'Importação vs Exportação',
    chart_type: 'DISTRIBUTION',
    query_spec: {
      fields: [
        { key: 'pedidos_importacao', operation: 'COUNT' },
        { key: 'pedidos_exportacao', operation: 'COUNT' },
      ],
      filters: { period: '30d' },
    },
    position: { x: 6, y: 13, w: 6, h: 4 },
  },

  // ── Linha 6 — KPIs de Quantidade ──────────────────────────────────────────
  {
    id: 'kpi_qtd_inicial',
    title: 'Qtd. Inicial Total',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'qtd_inicial_total', operation: 'SUM' }],
      filters: { period: '30d' },
    },
    position: { x: 0, y: 17, w: 4, h: 2 },
  },
  {
    id: 'kpi_qtd_transferida',
    title: 'Qtd. Transferida',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'qtd_transferida_total', operation: 'SUM' }],
      filters: { period: '30d' },
    },
    position: { x: 4, y: 17, w: 4, h: 2 },
  },
  {
    id: 'kpi_valor_itens',
    title: 'Valor Total dos Itens',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'valor_itens_total', operation: 'SUM' }],
      filters: { period: '30d' },
    },
    position: { x: 8, y: 17, w: 4, h: 2 },
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
          // Recovery: widgets ficou [] por estar em outro painel ao recarregar a página.
          // undefined em widgetsByPainel = "nunca salvo explicitamente" → DEFAULT_WIDGETS.
          // [] = "painel novo vazio" → mantém [].
          if (s.widgets.length === 0 && s.widgetsByPainel[painelAtualId ?? ''] === undefined) {
            return { paineis, widgets: DEFAULT_WIDGETS }
          }
          return { paineis }
        }

        // Troca de painel: undefined → DEFAULT_WIDGETS; [] → [] (vazio explícito)
        const saved = s.widgetsByPainel[painelAtualId ?? '']
        const widgets = saved !== undefined ? saved : DEFAULT_WIDGETS
        return { paineis, painelAtualId, widgets }
      }),

      setPainelAtual: (id) => set((s) => {
        // undefined = painel nunca salvo → DEFAULT_WIDGETS; [] = novo painel vazio → []
        const saved = s.widgetsByPainel[id]
        const widgets = saved !== undefined ? saved : DEFAULT_WIDGETS
        return { painelAtualId: id, widgets }
      }),
    }),
    {
      name: 'gravity:pedido:dashboard',
      version: 17, // bump: undefined vs [] — semantics de widgetsByPainel corrigida
      partialize: (s) => ({
        widgets: s.widgets,
        slicers: s.slicers,
        userDerivedMetrics: s.userDerivedMetrics,
        painelAtualId: s.painelAtualId,
        widgetsByPainel: s.widgetsByPainel,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.widgets) {
          state.widgets = state.widgets.map(migrateWidget)
        }
        // Recovery pós-hidratação: se widgets está vazio mas o painel não tem save explícito,
        // significa que o localStorage ficou stale (usuário estava em outro painel).
        // undefined = nunca salvo → recupera DEFAULT_WIDGETS.
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
