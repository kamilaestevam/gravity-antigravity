/**
 * ProcessoVisualizacaoTabs — pills Insights | Lista | Dashboard | Kanban.
 * Paridade PedidosVisualizacaoTabs / BidFreteVisualizacaoTabs.
 */

import React, { useCallback } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChartPieSlice, ChartBar, ListBullets, Kanban } from '@phosphor-icons/react'
import {
  testidTabSeletorProcesso,
  type ProcessoVisualizacaoId,
} from '../../components/processo-visualizacao-context'
import { prefetchProcessoVisualizacao } from '../../shared/processo-prefetch'
import './TodosProcessosTabs.css'

interface TabDef {
  id: ProcessoVisualizacaoId
  to: string
  labelKey: string
  defaultLabel: string
  icone: React.ReactNode
}

const TABS: TabDef[] = [
  {
    id: 'insights',
    to: '../insights',
    labelKey: 'processo.nav.insights',
    defaultLabel: 'Insights',
    icone: <ChartPieSlice weight="duotone" size={16} />,
  },
  {
    id: 'lista',
    to: '../lista',
    labelKey: 'processo.nav.lista',
    defaultLabel: 'Lista',
    icone: <ListBullets weight="duotone" size={16} />,
  },
  {
    id: 'dashboard',
    to: '../dashboard',
    labelKey: 'processo.nav.dashboard',
    defaultLabel: 'Dashboard',
    icone: <ChartBar weight="duotone" size={16} />,
  },
  {
    id: 'kanban',
    to: '../kanban',
    labelKey: 'processo.nav.kanban',
    defaultLabel: 'Kanban',
    icone: <Kanban weight="duotone" size={16} />,
  },
]

export function TodosProcessosTabs() {
  const { t } = useTranslation()

  const onPrefetch = useCallback((id: ProcessoVisualizacaoId) => {
    prefetchProcessoVisualizacao(id)
  }, [])

  return (
    <nav className="tpt-tabs" aria-label="Modo de visualização de processos">
      {TABS.map(tab => (
        <NavLink
          key={tab.id}
          to={tab.to}
          data-testid={testidTabSeletorProcesso(tab.id)}
          className={({ isActive }) => `tpt-tab ${isActive ? 'tpt-tab--active' : ''}`}
          onMouseEnter={() => onPrefetch(tab.id)}
          onFocus={() => onPrefetch(tab.id)}
        >
          {tab.icone}
          <span>{t(tab.labelKey, { defaultValue: tab.defaultLabel })}</span>
        </NavLink>
      ))}
    </nav>
  )
}

/** Alias — paridade BidFreteVisualizacaoTabs / PedidosVisualizacaoTabs. */
export const ProcessoVisualizacaoTabs = TodosProcessosTabs
