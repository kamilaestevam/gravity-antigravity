/**
 * BidFreteVisualizacaoLayout — envolve Insights, Lista, Dashboard e Kanban
 * com o seletor fixo no topo (cliente ou visão fornecedor).
 */

import React from 'react'
import { BidFreteVisualizacaoTabs, type ModoVisualizacaoBidFrete } from './BidFreteVisualizacaoTabs'
import './BidFreteVisualizacaoTabs.css'

export function BidFreteVisualizacaoLayout({
  modo,
  children,
}: {
  modo: ModoVisualizacaoBidFrete
  children: React.ReactNode
}) {
  return (
    <div className="bid-frete-visualizacao-layout">
      <div className="bid-frete-visualizacao-layout__tabs">
        <BidFreteVisualizacaoTabs modo={modo} />
      </div>
      {children}
    </div>
  )
}
