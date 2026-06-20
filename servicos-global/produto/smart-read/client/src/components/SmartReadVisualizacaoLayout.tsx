/**
 * SmartReadVisualizacaoLayout — contexto + Outlet
 */

import { Outlet, useLocation } from 'react-router-dom'
import {
  SmartReadVisualizacaoProvider,
  resolverSmartReadVisualizacaoPorPathname,
} from './smart-read-visualizacao-context'
import './SmartReadVisualizacaoTabs.css'

export function SmartReadVisualizacaoLayout() {
  const location = useLocation()
  const visualizacaoAtiva = resolverSmartReadVisualizacaoPorPathname(location.pathname)

  return (
    <SmartReadVisualizacaoProvider visualizacaoAtiva={visualizacaoAtiva}>
      <div className="smart-read-visualizacao-layout">
        <Outlet />
      </div>
    </SmartReadVisualizacaoProvider>
  )
}
