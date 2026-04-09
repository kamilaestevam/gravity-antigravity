// @nucleo/dashboard — Gravity Design System
// Componentes de Dashboard BI com suporte a drag & drop, gráficos e query builder.

export { WidgetContainer } from './WidgetContainer/index.js'
export type { WidgetContainerProps } from './WidgetContainer/index.js'

export { DashboardGrid } from './DashboardGrid/index.js'
export type { DashboardGridProps } from './DashboardGrid/index.js'

export { KpiWidget } from './widgets/KpiWidget/index.js'
export type { KpiWidgetProps } from './widgets/KpiWidget/index.js'

export { LineChartWidget } from './widgets/LineChartWidget/index.js'
export type { LineChartWidgetProps, LineSeriesConfig } from './widgets/LineChartWidget/index.js'

export { BarChartWidget } from './widgets/BarChartWidget/index.js'
export type { BarChartWidgetProps, BarSeriesConfig } from './widgets/BarChartWidget/index.js'

export { DistributionWidget } from './widgets/DistributionWidget/index.js'
export type { DistributionWidgetProps } from './widgets/DistributionWidget/index.js'

export { DonutWidget } from './widgets/DonutWidget/index.js'
export type { DonutWidgetProps } from './widgets/DonutWidget/index.js'

export { TableWidget } from './widgets/TableWidget/index.js'
export type { TableWidgetProps } from './widgets/TableWidget/index.js'

export { DashboardToolbar } from './DashboardToolbar/index.js'
export type { DashboardToolbarProps, PeriodOption } from './DashboardToolbar/index.js'

export { KpiValue } from './KpiValue/index.js'
export type { KpiValueProps } from './KpiValue/index.js'

export { WidgetEditModal } from './WidgetEditModal/index.js'
export type { WidgetEditModalProps, ChartOptionMeta, PeriodOptionEdit } from './WidgetEditModal/index.js'

export { SuggestionsPanel } from './SuggestionsPanel/index.js'
export type { SuggestionsPanelProps } from './SuggestionsPanel/index.js'

export { QueryBuilder } from './QueryBuilder/index.js'
export type { QueryBuilderProps } from './QueryBuilder/index.js'

export { resolveAxisAssignment, wouldExceedUnitLimit, formatValueByUnit, unitBadgeLabel, SERIES_COLORS } from './utils/axisUtils.js'
export type { AxisAssignment, YAxisSide } from './utils/axisUtils.js'

export { generateSuggestions, getComplementaryFields, suggestChartType } from './suggestionsEngine.js'
export type { SuggestedWidget, SuggestionDerivedMetric } from './suggestionsEngine.js'

export type {
  DashboardWidgetConfig,
  WidgetResult,
  WidgetDataValue,
  WidgetSeriesPoint,
  WidgetDistributionSlice,
  CatalogField,
  EnrichedCatalogField,
  SemanticType,
  FieldDomain,
  ChartType,
  FieldUnitType,
  WidgetQuerySpec,
  FieldQuerySpec,
  DerivedMetric,
  DerivedOperation,
  ActiveFilter,
  GlobalSlicers,
} from './tipos.js'
