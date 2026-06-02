/**
 * BidFreteVisualizacaoTabs — pills no topo (Insights | Lista | Dashboard | Kanban).
 * Paridade com PedidosVisualizacaoTabs — cliente e visão fornecedor.
 */

import React from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChartPieSlice, ChartBar, ListBullets, Kanban } from '@phosphor-icons/react'
import {
  ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL,
  rotaBidFreteInternacional,
} from '../shared/rotas-bid-frete-internacional'
import './BidFreteVisualizacaoTabs.css'

export type ModoVisualizacaoBidFrete = 'cliente' | 'fornecedor'

interface TabDef {
  to: string
  labelKey: string
  icone: React.ReactNode
}

const TABS_CLIENTE: TabDef[] = [
  {
    to: rotaBidFreteInternacional('visao-geral'),
    labelKey: 'bidfrete.nav.insights',
    icone: <ChartPieSlice weight="duotone" size={16} />,
  },
  {
    to: rotaBidFreteInternacional('lista'),
    labelKey: 'bidfrete.nav.lista',
    icone: <ListBullets weight="duotone" size={16} />,
  },
  {
    to: rotaBidFreteInternacional('dashboard'),
    labelKey: 'bidfrete.nav.dashboard',
    icone: <ChartBar weight="duotone" size={16} />,
  },
  {
    to: rotaBidFreteInternacional('kanban'),
    labelKey: 'bidfrete.nav.kanban',
    icone: <Kanban weight="duotone" size={16} />,
  },
]

const TABS_FORNECEDOR: TabDef[] = [
  {
    to: ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.dashboard,
    labelKey: 'bidfrete.visao_fornecedor_bid_frete_internacional.nav.insights',
    icone: <ChartPieSlice weight="duotone" size={16} />,
  },
  {
    to: ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.lista,
    labelKey: 'bidfrete.visao_fornecedor_bid_frete_internacional.nav.lista',
    icone: <ListBullets weight="duotone" size={16} />,
  },
  {
    to: ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.paineisDashboard,
    labelKey: 'bidfrete.visao_fornecedor_bid_frete_internacional.nav.paineis_dashboard',
    icone: <ChartBar weight="duotone" size={16} />,
  },
  {
    to: ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.kanban,
    labelKey: 'bidfrete.visao_fornecedor_bid_frete_internacional.nav.kanban',
    icone: <Kanban weight="duotone" size={16} />,
  },
]

export function BidFreteVisualizacaoTabs({ modo }: { modo: ModoVisualizacaoBidFrete }) {
  const { t } = useTranslation()
  const tabs = modo === 'fornecedor' ? TABS_FORNECEDOR : TABS_CLIENTE

  return (
    <nav className="bft-tabs" aria-label="Modo de visualização do Bid Frete Internacional">
      {tabs.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) => `bft-tab ${isActive ? 'bft-tab--active' : ''}`}
        >
          {tab.icone}
          <span>{t(tab.labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  )
}
