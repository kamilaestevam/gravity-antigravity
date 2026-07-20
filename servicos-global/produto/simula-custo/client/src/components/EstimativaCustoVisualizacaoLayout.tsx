/**
 * EstimativaCustoVisualizacaoLayout — toolbar com pills + ações + Outlet.
 * Paridade BidFreteVisualizacaoLayout: as pills ficam abaixo do título do
 * MenuTopoGlobal; o botão «Nova Estimativa» fica à direita da toolbar.
 */
import React from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from '@phosphor-icons/react'
import { EstimativaCustoVisualizacaoTabs } from './EstimativaCustoVisualizacaoTabs'
import {
  EstimativaCustoVisualizacaoProvider,
  ehRotaComSeletorVisualizacaoEstimativaCusto,
  resolverVisualizacaoEstimativaCustoPorPathname,
} from './estimativa-custo-visualizacao-context'
import { rotaSimulaCusto } from '../shared/rotas-estimativa-custo'
import './EstimativaCustoVisualizacaoTabs.css'

export function EstimativaCustoVisualizacaoLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const visualizacaoAtiva = resolverVisualizacaoEstimativaCustoPorPathname(location.pathname)
  const exibirToolbar = ehRotaComSeletorVisualizacaoEstimativaCusto(location.pathname)
  const ehConfiguracoes = location.pathname.includes('/configuracoes')

  return (
    <EstimativaCustoVisualizacaoProvider visualizacaoAtiva={visualizacaoAtiva}>
      <div className="estimativa-custo-visualizacao-layout">
        {exibirToolbar && (
          <div className="estimativa-custo-vis-toolbar">
            <EstimativaCustoVisualizacaoTabs />
            {!ehConfiguracoes && (
              <div className="estimativa-custo-vis-toolbar__acoes">
                <button
                  type="button"
                  className="ect-btn-nova"
                  onClick={() => navigate(rotaSimulaCusto('estimativas/nova'))}
                >
                  <Plus weight="bold" size={14} />
                  {t('simulacusto.estimativas.nova_curto', 'Nova')}
                </button>
              </div>
            )}
          </div>
        )}
        <Outlet />
      </div>
    </EstimativaCustoVisualizacaoProvider>
  )
}
