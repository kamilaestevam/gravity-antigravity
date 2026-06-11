import Dashboard from '../dashboard'
import {
  BidFreteDashboardVisaoProvider,
  CONFIG_DASHBOARD_FORNECEDOR,
} from '../../shared/bid-frete-dashboard-visao-context'

/**
 * Dashboard configurável (widgets) — visão fornecedor.
 * Mesma experiência do /bid-frete/dashboard, com KPIs e funil do fornecedor.
 */
export default function VisaoFornecedorPaineisDashboard() {
  return (
    <BidFreteDashboardVisaoProvider config={CONFIG_DASHBOARD_FORNECEDOR}>
      <Dashboard />
    </BidFreteDashboardVisaoProvider>
  )
}
