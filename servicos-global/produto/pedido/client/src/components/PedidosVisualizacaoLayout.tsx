/**
 * PedidosVisualizacaoLayout — envolve Lista, Kanban, Visão Geral e Dashboard
 * com o seletor de visualização fixo no topo do conteúdo.
 */

import React from 'react'
import { PedidosVisualizacaoTabs } from './PedidosVisualizacaoTabs'
import './PedidosVisualizacaoTabs.css'

export function PedidosVisualizacaoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pedido-visualizacao-layout">
      <div className="pedido-visualizacao-layout__tabs">
        <PedidosVisualizacaoTabs />
      </div>
      {children}
    </div>
  )
}
