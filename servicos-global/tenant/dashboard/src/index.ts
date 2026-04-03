export { Dashboard } from './Dashboard.js'
export { KPICard } from './components/KPICard.js'
export { DashboardGeralPage } from './pages/DashboardGeralPage.js'
export { useDashboardData } from './hooks/useDashboardData.js'
export { useDashboardSSE } from './hooks/useDashboardSSE.js'
export { useDashboardLayout, type GridLayoutItem } from './hooks/useDashboardLayout.js'
export { useDashboardStore } from './store/dashboardStore.js'
export type {
  DashboardConfig,
  DashboardWidgetConfig,
  WidgetResult,
  CatalogField,
  CatalogWidget,
  ChartType,
} from './store/dashboardStore.js'
