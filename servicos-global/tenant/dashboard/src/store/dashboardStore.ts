import { create } from 'zustand'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type ChartType =
  | 'KPI_CARD'
  | 'LINE'
  | 'BAR'
  | 'BAR_HORIZONTAL'
  | 'DONUT'
  | 'HISTOGRAM'
  | 'FUNNEL'
  | 'GAUGE'
  | 'MAP'
  | 'TABLE'
  | 'AREA'

export type WidgetDataValue =
  | number
  | Record<string, number>
  | Array<{ label: string; value: number }>
  | Array<{ month: string; value: number }>

export interface WidgetResult {
  data: Record<string, WidgetDataValue>
  chartType: ChartType
  partial: boolean
  cached: boolean
  computed_at: string
}

export interface DashboardWidgetConfig {
  id: string
  title: string
  chart_type: ChartType
  widget_type: 'CATALOG' | 'CUSTOM' | 'GABI'
  widget_key: string
  query_spec: {
    fields: string[]
    operation: string
    filters: { period: string }
    chartType?: ChartType
  }
  position: { x: number; y: number; w: number; h: number }
  config?: Record<string, unknown>
}

export interface DashboardConfig {
  id: string
  name: string
  mode: 'PRODUCT' | 'GENERAL'
  product_id: string | null
  layout: unknown[]
  filters: Record<string, unknown> | null
  is_default: boolean
  widgets: DashboardWidgetConfig[]
}

export interface CatalogField {
  key: string
  label: string
  productId: string
  type: 'number' | 'currency' | 'date' | 'string' | 'percentage'
  aggregations: string[]
  permission: string
  chartTypes: ChartType[]
}

export interface CatalogWidget {
  id: string
  title: string
  description: string
  productId: string
  chartType: ChartType
  querySpec: {
    fields: string[]
    operation: string
    filters: { period: string }
  }
  size: 'sm' | 'md' | 'lg'
  category: string
}

// ─── Estado ───────────────────────────────────────────────────────────────────

interface DashboardState {
  // Config ativa
  activeConfig: DashboardConfig | null
  setActiveConfig: (config: DashboardConfig | null) => void

  // Dados dos widgets (widgetId → WidgetResult)
  widgetData: Record<string, WidgetResult>
  setWidgetData: (widgetId: string, result: WidgetResult) => void
  clearWidgetData: (widgetId: string) => void

  // Loading por widget
  widgetLoading: Record<string, boolean>
  setWidgetLoading: (widgetId: string, loading: boolean) => void

  // Erros por widget
  widgetErrors: Record<string, string>
  setWidgetError: (widgetId: string, error: string | null) => void

  // Modo de edição do grid
  editMode: boolean
  setEditMode: (editMode: boolean) => void

  // Layout pendente (antes de salvar)
  pendingLayout: Record<string, { x: number; y: number; w: number; h: number }>
  setPendingLayout: (
    widgetId: string,
    pos: { x: number; y: number; w: number; h: number },
  ) => void
  clearPendingLayout: () => void

  // Catálogo de campos
  catalogFields: CatalogField[]
  setCatalogFields: (fields: CatalogField[]) => void

  // Widgets pré-construídos
  catalogWidgets: CatalogWidget[]
  setCatalogWidgets: (widgets: CatalogWidget[]) => void

  // Estado da UI
  isQueryBuilderOpen: boolean
  setQueryBuilderOpen: (open: boolean) => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useDashboardStore = create<DashboardState>()((set) => ({
  // Config ativa
  activeConfig: null,
  setActiveConfig: (config) => set({ activeConfig: config }),

  // Dados dos widgets
  widgetData: {},
  setWidgetData: (widgetId, result) =>
    set((state) => ({
      widgetData: { ...state.widgetData, [widgetId]: result },
    })),
  clearWidgetData: (widgetId) =>
    set((state) => {
      const next = { ...state.widgetData }
      delete next[widgetId]
      return { widgetData: next }
    }),

  // Loading por widget
  widgetLoading: {},
  setWidgetLoading: (widgetId, loading) =>
    set((state) => ({
      widgetLoading: { ...state.widgetLoading, [widgetId]: loading },
    })),

  // Erros por widget
  widgetErrors: {},
  setWidgetError: (widgetId, error) =>
    set((state) => {
      const next = { ...state.widgetErrors }
      if (error === null) {
        delete next[widgetId]
      } else {
        next[widgetId] = error
      }
      return { widgetErrors: next }
    }),

  // Modo de edição
  editMode: false,
  setEditMode: (editMode) => set({ editMode }),

  // Layout pendente
  pendingLayout: {},
  setPendingLayout: (widgetId, pos) =>
    set((state) => ({
      pendingLayout: { ...state.pendingLayout, [widgetId]: pos },
    })),
  clearPendingLayout: () => set({ pendingLayout: {} }),

  // Catálogo de campos
  catalogFields: [],
  setCatalogFields: (fields) => set({ catalogFields: fields }),

  // Widgets pré-construídos
  catalogWidgets: [],
  setCatalogWidgets: (widgets) => set({ catalogWidgets: widgets }),

  // Estado da UI
  isQueryBuilderOpen: false,
  setQueryBuilderOpen: (open) => set({ isQueryBuilderOpen: open }),
}))
