/**
 * ProcessoVisualizacaoLayout — contexto do seletor + Outlet.
 * Pills Insights | Lista | Dashboard | Kanban ficam no toolbar (abaixo do título).
 */

import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import {
  ProcessoVisualizacaoProvider,
  resolverProcessoVisualizacaoPorPathname,
} from './processo-visualizacao-context'

export function ProcessoVisualizacaoLayout() {
  const location = useLocation()
  const visualizacaoAtiva = resolverProcessoVisualizacaoPorPathname(location.pathname)

  return (
    <ProcessoVisualizacaoProvider visualizacaoAtiva={visualizacaoAtiva}>
      <div className="proc-visualizacao-layout">
        <Outlet />
      </div>
    </ProcessoVisualizacaoProvider>
  )
}
