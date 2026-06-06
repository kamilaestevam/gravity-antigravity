import React, { createContext, useContext, type ReactNode } from 'react'
import type { EnrichedCatalogField } from '@nucleo/dashboard'
import type { DashboardKpis, GabiInsightItem } from './api'
import { dashboardApi, paineisDashboardApi } from './api'
import { DASHBOARD_CATALOG, CATALOG_BY_KEY } from './dashboardCatalog'
import { generateSuggestions } from './dashboardSuggestions'
import { useDashboardStore } from '../stores/dashboardStore'
import { useDashboardStoreFornecedor } from '../stores/dashboardStoreFornecedor'
import {
  DASHBOARD_CATALOG_FORNECEDOR,
  CATALOG_FORNECEDOR_BY_KEY,
  STATUS_LABELS_FORNECEDOR_DASHBOARD,
} from './dashboard-fornecedor-catalog'
import { dashboardFornecedorApi, paineisDashboardFornecedorApi } from './dashboard-fornecedor-api'
import { generateSuggestionsFornecedor } from './dashboard-fornecedor-suggestions'
import { buildClientInsightsFornecedor } from './dashboard-fornecedor-insights'
import { buildClientInsightsOperacional } from './dashboard-operacional-insights'
import { ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL } from './rotas-bid-frete-internacional'

export type ModoDashboardBidFrete = 'operacional' | 'fornecedor'

export interface BidFreteDashboardVisaoConfig {
  modo: ModoDashboardBidFrete
  useDashboardStore: typeof useDashboardStore
  catalog: EnrichedCatalogField[]
  catalogByKey: Record<string, EnrichedCatalogField>
  dashboardApi: {
    kpis: (
      period: string,
      range?: { from: string; to: string },
      idsWorkspacesFiltro?: string[],
    ) => Promise<DashboardKpis>
    trend: (period: string, granularity?: string) => Promise<{ period: string; granularity: string; value: import('./api').DashboardTrendBucket[] }>
    insights: (period: string, range?: { from: string; to: string }) => Promise<{ period: string; role: string; insights: GabiInsightItem[] }>
  }
  paineisDashboardApi: typeof paineisDashboardApi
  generateSuggestions: typeof generateSuggestions
  buildClientInsights: (kpis: DashboardKpis, prev?: DashboardKpis | null) => GabiInsightItem[]
  statusLabels: Record<string, string>
  widgetNavRoute: Record<string, string>
  listaRoute: string
}

const STATUS_LABELS_OPERACIONAL: Record<string, string> = {
  RASCUNHO: 'Rascunho',
  ENVIADA_FORNECEDORES: 'Enviada ao fornecedor',
  EM_COTACAO: 'Em cotação',
  AGUARDANDO_APROVACAO: 'Aprovação pendente',
  APROVADA: 'Aprovada',
  REPROVADA: 'Reprovada',
  CANCELADA: 'Cancelada',
  FALTA_INFORMACAO: 'Falta de informação',
  EXPIRADA: 'Expirada',
}

export const CONFIG_DASHBOARD_OPERACIONAL: BidFreteDashboardVisaoConfig = {
  modo: 'operacional',
  useDashboardStore,
  catalog: DASHBOARD_CATALOG,
  catalogByKey: CATALOG_BY_KEY,
  dashboardApi,
  paineisDashboardApi,
  generateSuggestions,
  buildClientInsights: buildClientInsightsOperacional,
  statusLabels: STATUS_LABELS_OPERACIONAL,
  widgetNavRoute: {
    kpi_cotacoes_andamento: '/bid-frete/lista',
    kpi_cotacoes_passadas: '/bid-frete/lista',
  },
  listaRoute: '/bid-frete/lista',
}

export const CONFIG_DASHBOARD_FORNECEDOR: BidFreteDashboardVisaoConfig = {
  modo: 'fornecedor',
  useDashboardStore: useDashboardStoreFornecedor as typeof useDashboardStore,
  catalog: DASHBOARD_CATALOG_FORNECEDOR,
  catalogByKey: CATALOG_FORNECEDOR_BY_KEY,
  dashboardApi: dashboardFornecedorApi,
  paineisDashboardApi: paineisDashboardFornecedorApi as unknown as typeof paineisDashboardApi,
  generateSuggestions: generateSuggestionsFornecedor,
  buildClientInsights: (kpis, _prev) => buildClientInsightsFornecedor(kpis),
  statusLabels: STATUS_LABELS_FORNECEDOR_DASHBOARD,
  widgetNavRoute: {
    kpi_pendentes_fornecedor: ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.cotacoesPendentes,
    kpi_propostas_enviadas_fornecedor: ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.propostas,
    kpi_em_analise_fornecedor: ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.propostas,
    kpi_aprovadas_fornecedor: ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.propostas,
    kpi_reprovadas_fornecedor: ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.propostas,
  },
  listaRoute: ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.kanban,
}

const BidFreteDashboardVisaoContext = createContext<BidFreteDashboardVisaoConfig>(
  CONFIG_DASHBOARD_OPERACIONAL,
)

export function BidFreteDashboardVisaoProvider({
  config,
  children,
}: {
  config: BidFreteDashboardVisaoConfig
  children: ReactNode
}) {
  return (
    <BidFreteDashboardVisaoContext.Provider value={config}>
      {children}
    </BidFreteDashboardVisaoContext.Provider>
  )
}

export function useBidFreteDashboardVisao(): BidFreteDashboardVisaoConfig {
  return useContext(BidFreteDashboardVisaoContext)
}
