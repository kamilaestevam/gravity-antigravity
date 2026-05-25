// @nucleo/dashboard — Gravity Design System
// Componentes de Dashboard BI com suporte a drag & drop, gráficos e query builder.

export { DashboardPainelContainer } from './DashboardPainelContainer/index.js'
export type { WidgetContainerProps } from './DashboardPainelContainer/index.js'

export { DashboardGrid } from './DashboardGrid/index.js'
export type { DashboardGridProps } from './DashboardGrid/index.js'

export { DashboardWidgetKPI } from './widgets/DashboardWidgetKPI/index.js'
export type { KpiWidgetProps } from './widgets/DashboardWidgetKPI/index.js'

export { DashboardWidgetLinha } from './widgets/DashboardWidgetLinha/index.js'
export type { LineChartWidgetProps, LineSeriesConfig } from './widgets/DashboardWidgetLinha/index.js'

export { DashboardWidgetBarras } from './widgets/DashboardWidgetBarras/index.js'
export type { BarChartWidgetProps, BarSeriesConfig } from './widgets/DashboardWidgetBarras/index.js'

export { DashboardWidgetDistribuicao } from './widgets/DashboardWidgetDistribuicao/index.js'
export type { DistributionWidgetProps } from './widgets/DashboardWidgetDistribuicao/index.js'

export { DashboardWidgetDonut } from './widgets/DashboardWidgetDonut/index.js'
export type { DonutWidgetProps } from './widgets/DashboardWidgetDonut/index.js'

export { DashboardWidgetTabela } from './widgets/DashboardWidgetTabela/index.js'
export type { TableWidgetProps } from './widgets/DashboardWidgetTabela/index.js'

export { DashboardBarraFerramentas, PeriodDropdown } from './DashboardBarraFerramentas/index.js'
export type { DashboardToolbarProps, PeriodOption } from './DashboardBarraFerramentas/index.js'

export { DashboardValorKPI } from './DashboardValorKPI/index.js'
export type { KpiValueProps } from './DashboardValorKPI/index.js'

export { DashboardPainelEditarModal } from './DashboardPainelEditarModal/index.js'
export type { ModalEditarWidgetProps, ChartOptionMeta, PeriodOptionEdit } from './DashboardPainelEditarModal/index.js'

export { DashboardPainelSugestoes } from './DashboardPainelSugestoes/index.js'
export type { SuggestionsPanelProps } from './DashboardPainelSugestoes/index.js'

export { DashboardConstrutorConsulta } from './DashboardConstrutorConsulta/index.js'
export type { QueryBuilderProps } from './DashboardConstrutorConsulta/index.js'

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
