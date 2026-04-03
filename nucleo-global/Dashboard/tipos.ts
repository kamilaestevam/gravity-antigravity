/**
 * @nucleo/dashboard — tipos compartilhados
 * Definições de tipos para todos os componentes do Dashboard BI.
 * Sem estado de servidor. Sem API calls.
 */

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
  query_spec: {
    fields: string[]
    operation: string
    filters: { period: string }
  }
  position: { x: number; y: number; w: number; h: number }
  config?: Record<string, unknown>
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

export interface WidgetQuerySpec {
  fields: string[]
  operation: string
  filters: { period: string }
  chartType?: ChartType
}
