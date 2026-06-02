/**
 * ProcessoVisualizacaoLayout — pills Lista | Kanban + Outlet.
 */

import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { TodosProcessosTabs } from '../pages/todos/TodosProcessosTabs'
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
        <div className="proc-visualizacao-layout__tabs">
          <TodosProcessosTabs />
        </div>
        <Outlet />
      </div>
    </ProcessoVisualizacaoProvider>
  )
}
