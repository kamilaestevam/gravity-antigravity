/**
 * BidFreteVisualizacaoLayout — contexto do seletor + Outlet.
 * Pills Insights|Lista|… ficam na toolbar do painel (abaixo do título no MenuTopoGlobal).
 */

import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { BidFreteVisualizacaoTabs, type ModoVisualizacaoBidFrete } from './BidFreteVisualizacaoTabs'
import {
  BidFreteVisualizacaoProvider,
  ehRotaComSeletorVisualizacaoBidFrete,
  resolverBidFreteVisualizacaoPorPathname,
} from './bid-frete-visualizacao-context'
import './BidFreteVisualizacaoTabs.css'

export function BidFreteVisualizacaoLayout({ modo }: { modo: ModoVisualizacaoBidFrete }) {
  const location = useLocation()
  const visualizacaoAtiva = resolverBidFreteVisualizacaoPorPathname(location.pathname, modo)
  const exibirTabsSemPainel =
    ehRotaComSeletorVisualizacaoBidFrete(location.pathname, modo) && visualizacaoAtiva === null

  return (
    <BidFreteVisualizacaoProvider modo={modo} visualizacaoAtiva={visualizacaoAtiva}>
      <div className="bid-frete-visualizacao-layout">
        {exibirTabsSemPainel && (
          <div className="bid-frete-vis-toolbar">
            <BidFreteVisualizacaoTabs modo={modo} />
          </div>
        )}
        <Outlet />
      </div>
    </BidFreteVisualizacaoProvider>
  )
}
