/**
 * TodosProcessosTabs — pills no topo das telas de listagem de processos
 * (Lista | Kanban). Mesmo padrao de FinanceiroTabs.
 */

import React from 'react'
import { NavLink } from 'react-router-dom'
import { ListBullets, Kanban } from '@phosphor-icons/react'
import './TodosProcessosTabs.css'

export function TodosProcessosTabs() {
  return (
    <nav className="tpt-tabs" aria-label="Modo de visualização de processos">
      <NavLink
        to="/acesso-processos/lista"
        className={({ isActive }) => `tpt-tab ${isActive ? 'tpt-tab--active' : ''}`}
      >
        <ListBullets weight="duotone" size={16} />
        <span>Lista</span>
      </NavLink>
      <NavLink
        to="/acesso-processos/kanban"
        className={({ isActive }) => `tpt-tab ${isActive ? 'tpt-tab--active' : ''}`}
      >
        <Kanban weight="duotone" size={16} />
        <span>Kanban</span>
      </NavLink>
    </nav>
  )
}
