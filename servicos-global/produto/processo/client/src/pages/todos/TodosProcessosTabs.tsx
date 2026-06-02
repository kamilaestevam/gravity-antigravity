/**
 * TodosProcessosTabs — pills no topo das telas de listagem de processos
 * (Lista | Kanban). Mesmo padrao de FinanceiroTabs.
 */

import React, { useCallback } from 'react'
import { NavLink } from 'react-router-dom'
import {
  testidTabSeletorProcesso,
  type ProcessoVisualizacaoId,
} from '../../components/processo-visualizacao-context'
import { prefetchProcessoVisualizacao } from '../../shared/processo-prefetch'
import { ListBullets, Kanban } from '@phosphor-icons/react'
import './TodosProcessosTabs.css'

export function TodosProcessosTabs() {
  const onPrefetch = useCallback((id: ProcessoVisualizacaoId) => {
    prefetchProcessoVisualizacao(id)
  }, [])

  return (
    <nav className="tpt-tabs" aria-label="Modo de visualização de processos">
      <NavLink
        to="/acesso-processos/lista"
        data-testid={testidTabSeletorProcesso('lista')}
        className={({ isActive }) => `tpt-tab ${isActive ? 'tpt-tab--active' : ''}`}
        onMouseEnter={() => onPrefetch('lista')}
        onFocus={() => onPrefetch('lista')}
      >
        <ListBullets weight="duotone" size={16} />
        <span>Lista</span>
      </NavLink>
      <NavLink
        to="/acesso-processos/kanban"
        data-testid={testidTabSeletorProcesso('kanban')}
        className={({ isActive }) => `tpt-tab ${isActive ? 'tpt-tab--active' : ''}`}
        onMouseEnter={() => onPrefetch('kanban')}
        onFocus={() => onPrefetch('kanban')}
      >
        <Kanban weight="duotone" size={16} />
        <span>Kanban</span>
      </NavLink>
    </nav>
  )
}
