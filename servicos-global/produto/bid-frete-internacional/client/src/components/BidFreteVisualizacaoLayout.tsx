/**
 * BidFreteVisualizacaoLayout — seletor fixo + Outlet (layout route).
 */

import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { BidFreteVisualizacaoTabs, type ModoVisualizacaoBidFrete } from './BidFreteVisualizacaoTabs'
import {
  BidFreteVisualizacaoProvider,
  resolverBidFreteVisualizacaoPorPathname,
} from './bid-frete-visualizacao-context'
import './BidFreteVisualizacaoTabs.css'

export function BidFreteVisualizacaoLayout({ modo }: { modo: ModoVisualizacaoBidFrete }) {
  const location = useLocation()
  const visualizacaoAtiva = resolverBidFreteVisualizacaoPorPathname(location.pathname, modo)

  return (
    <BidFreteVisualizacaoProvider modo={modo} visualizacaoAtiva={visualizacaoAtiva}>
      <div className="bid-frete-visualizacao-layout">
        <div className="bid-frete-visualizacao-layout__tabs">
          <BidFreteVisualizacaoTabs modo={modo} />
        </div>
        <Outlet />
      </div>
    </BidFreteVisualizacaoProvider>
  )
}
