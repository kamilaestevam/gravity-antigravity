/**
 * SimulaCustoVisualizacaoLayout — toolbar com pills + ações + Outlet.
 * Paridade BidFreteVisualizacaoLayout: as pills ficam abaixo do título do
 * MenuTopoGlobal; o botão «Nova Simula» fica à direita da toolbar.
 */
import React from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from '@phosphor-icons/react'
import { SimulaCustoVisualizacaoTabs } from './SimulaCustoVisualizacaoTabs'
import {
  SimulaCustoVisualizacaoProvider,
  ehRotaComSeletorVisualizacaoSimulaCusto,
  resolverVisualizacaoSimulaCustoPorPathname,
} from './simula-custo-visualizacao-context'
import { rotaSimulaCusto } from '../shared/rotas-simula-custo'
import './SimulaCustoVisualizacaoTabs.css'

export function SimulaCustoVisualizacaoLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const visualizacaoAtiva = resolverVisualizacaoSimulaCustoPorPathname(location.pathname)
  const exibirToolbar = ehRotaComSeletorVisualizacaoSimulaCusto(location.pathname)
  const ehConfiguracoes = location.pathname.includes('/configuracoes')

  return (
    <SimulaCustoVisualizacaoProvider visualizacaoAtiva={visualizacaoAtiva}>
      <div className="simula-custo-visualizacao-layout">
        {exibirToolbar && (
          <div className="simula-custo-vis-toolbar">
            <SimulaCustoVisualizacaoTabs />
            {!ehConfiguracoes && (
              <div className="simula-custo-vis-toolbar__acoes">
                <button
                  type="button"
                  className="ect-btn-nova"
                  onClick={() => navigate(rotaSimulaCusto('simulas/nova'))}
                >
                  <Plus weight="bold" size={14} />
                  {t('simulacusto.simulas.nova_curto', 'Nova')}
                </button>
              </div>
            )}
          </div>
        )}
        <Outlet />
      </div>
    </SimulaCustoVisualizacaoProvider>
  )
}
