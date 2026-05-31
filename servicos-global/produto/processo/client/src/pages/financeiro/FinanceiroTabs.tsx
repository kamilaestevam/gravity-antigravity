/**
 * FinanceiroTabs — pills no topo das telas de Financeiro do processo.
 * Mesmo padrao de PedidosTabs (Resumo/Lista) — 3 abas: Movimentacao,
 * Numerario, Rateio.
 */

import React from 'react'
import { NavLink } from 'react-router-dom'
import { Receipt, CurrencyDollar, FileXls } from '@phosphor-icons/react'
import './FinanceiroTabs.css'

export function FinanceiroTabs() {
  return (
    <nav className="ft-tabs" aria-label="Modos de visualização Financeiro">
      <NavLink
        to="/processo/financeiro/movimentacao"
        className={({ isActive }) => `ft-tab ${isActive ? 'ft-tab--active' : ''}`}
      >
        <Receipt weight="duotone" size={16} />
        <span>Movimentação</span>
      </NavLink>
      <NavLink
        to="/processo/financeiro/numerario"
        className={({ isActive }) => `ft-tab ${isActive ? 'ft-tab--active' : ''}`}
      >
        <CurrencyDollar weight="duotone" size={16} />
        <span>Numerário</span>
      </NavLink>
      <NavLink
        to="/processo/financeiro/rateio"
        className={({ isActive }) => `ft-tab ${isActive ? 'ft-tab--active' : ''}`}
      >
        <FileXls weight="duotone" size={16} />
        <span>Rateio</span>
      </NavLink>
    </nav>
  )
}
