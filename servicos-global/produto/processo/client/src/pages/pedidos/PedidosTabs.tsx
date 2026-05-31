/**
 * PedidosTabs — Navegacao entre Resumo (cards/infografico) e Lista (tabela).
 * Usado no topo de PedidosResumo e PedidosLista.
 */

import React from 'react'
import { NavLink } from 'react-router-dom'
import { ChartPieSlice, ListBullets } from '@phosphor-icons/react'
import './PedidosTabs.css'

export function PedidosTabs() {
  return (
    <nav className="pt-tabs" aria-label="Modos de visualizacao de Pedidos">
      <NavLink
        to="/processo/pedidos/resumo"
        className={({ isActive }) => `pt-tab ${isActive ? 'pt-tab--active' : ''}`}
      >
        <ChartPieSlice weight="duotone" size={16} />
        <span>Resumo</span>
      </NavLink>
      <NavLink
        to="/processo/pedidos/lista"
        className={({ isActive }) => `pt-tab ${isActive ? 'pt-tab--active' : ''}`}
      >
        <ListBullets weight="duotone" size={16} />
        <span>Lista</span>
      </NavLink>
    </nav>
  )
}
