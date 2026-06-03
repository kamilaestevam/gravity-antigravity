/**
 * PedidosVisualizacaoLayout — seletor fixo + Outlet (layout route).
 * Tabs permanecem montadas; conteúdo troca via Outlet ou PedidosMultiView keep-alive.
 */

import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { PedidosVisualizacaoTabs } from './PedidosVisualizacaoTabs'
import {
  PedidosVisualizacaoProvider,
  ehRotaComSeletorVisualizacao,
  resolverVisualizacaoPorPathname,
} from './pedidos-visualizacao-context'
import './PedidosVisualizacaoTabs.css'

export function PedidosVisualizacaoLayout() {
  const location = useLocation()
  const visualizacaoAtiva = resolverVisualizacaoPorPathname(location.pathname)
  const exibirTabs = ehRotaComSeletorVisualizacao(location.pathname)

  return (
    <PedidosVisualizacaoProvider visualizacaoAtiva={visualizacaoAtiva}>
      <div className="pedido-visualizacao-layout">
        {exibirTabs && (
          <div className="pedido-visualizacao-layout__tabs">
            <PedidosVisualizacaoTabs />
          </div>
        )}
        <Outlet />
      </div>
    </PedidosVisualizacaoProvider>
  )
}
