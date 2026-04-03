// @nucleo/dashboard — Gravity Design System
// Componentes de Dashboard BI com suporte a drag & drop, gráficos e query builder.

export { WidgetContainer } from './WidgetContainer/index.js'
export type { WidgetContainerProps } from './WidgetContainer/index.js'

export { DashboardGrid } from './DashboardGrid/index.js'
export type { DashboardGridProps } from './DashboardGrid/index.js'

export { KpiWidget } from './widgets/KpiWidget/index.js'
export type { KpiWidgetProps } from './widgets/KpiWidget/index.js'

export { LineChartWidget } from './widgets/LineChartWidget/index.js'
export type { LineChartWidgetProps } from './widgets/LineChartWidget/index.js'

export { BarChartWidget } from './widgets/BarChartWidget/index.js'
export type { BarChartWidgetProps } from './widgets/BarChartWidget/index.js'

export { DonutWidget } from './widgets/DonutWidget/index.js'
export type { DonutWidgetProps } from './widgets/DonutWidget/index.js'

export { TableWidget } from './widgets/TableWidget/index.js'
export type { TableWidgetProps } from './widgets/TableWidget/index.js'

export { QueryBuilder } from './QueryBuilder/index.js'
export type { QueryBuilderProps } from './QueryBuilder/index.js'

export type {
  DashboardWidgetConfig,
  WidgetResult,
  WidgetDataValue,
  CatalogField,
  ChartType,
  WidgetQuerySpec,
} from './tipos.js'
