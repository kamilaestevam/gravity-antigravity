/**
 * SimulaCustoVisualizacaoTabs — pills no topo (Insights | Lista | Dashboard | Kanban).
 * Paridade BidFreteVisualizacaoTabs.
 */
import React from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChartPieSlice, ChartBar, ListBullets, Kanban } from '@phosphor-icons/react'
import type { SimulaCustoVisualizacaoId } from './simula-custo-visualizacao-context'
import { rotaSimulaCusto } from '../shared/rotas-simula-custo'
import './SimulaCustoVisualizacaoTabs.css'

interface TabDef {
  id: SimulaCustoVisualizacaoId
  to: string
  labelKey: string
  labelDefault: string
  icone: React.ReactNode
}

const TABS: TabDef[] = [
  {
    id: 'insights',
    to: rotaSimulaCusto('insights'),
    labelKey: 'simulacusto.nav.insights',
    labelDefault: 'Insights',
    icone: <ChartPieSlice weight="duotone" size={16} />,
  },
  {
    id: 'lista',
    to: rotaSimulaCusto('lista'),
    labelKey: 'simulacusto.nav.lista',
    labelDefault: 'Lista',
    icone: <ListBullets weight="duotone" size={16} />,
  },
  {
    id: 'dashboard',
    to: rotaSimulaCusto('dashboard'),
    labelKey: 'simulacusto.nav.dashboard',
    labelDefault: 'Dashboard',
    icone: <ChartBar weight="duotone" size={16} />,
  },
  {
    id: 'kanban',
    to: rotaSimulaCusto('kanban'),
    labelKey: 'simulacusto.nav.kanban',
    labelDefault: 'Kanban',
    icone: <Kanban weight="duotone" size={16} />,
  },
]

export function SimulaCustoVisualizacaoTabs() {
  const { t } = useTranslation()

  return (
    <nav className="ect-tabs" aria-label="Modo de visualização do Simula Custo">
      {TABS.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          data-testid={`seletor-visao-tab-${tab.id}`}
          className={({ isActive }) => `ect-tab ${isActive ? 'ect-tab--active' : ''}`}
        >
          {tab.icone}
          <span>{t(tab.labelKey, tab.labelDefault)}</span>
        </NavLink>
      ))}
    </nav>
  )
}
