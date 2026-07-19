/**
 * EstimativaCustoMultiView — keep-alive das 4 visualizações.
 * Paridade BidFreteMultiView: cada visão monta na primeira visita e permanece
 * montada (hidden) ao trocar de pill — sem refetch a cada troca.
 */
import React, { Suspense, lazy, useEffect, useState } from 'react'
import {
  useEstimativaCustoVisualizacao,
  type EstimativaCustoVisualizacaoId,
} from './estimativa-custo-visualizacao-context'
import { ConteudoCarregandoEstimativaCusto } from '../shared/pagina-carregando-estimativa-custo'
import './EstimativaCustoVisualizacaoTabs.css'

const Insights   = lazy(() => import('../pages/insights-estimativa-custo'))
const Lista      = lazy(() => import('../pages/lista-estimativa-custo'))
const Dashboard  = lazy(() => import('../pages/dashboard-estimativa-custo'))
const KanbanPage = lazy(() => import('../pages/kanban-estimativa-custo'))

function Painel({
  id,
  montado,
  children,
}: {
  id: EstimativaCustoVisualizacaoId
  montado: boolean
  children: React.ReactNode
}) {
  const { visualizacaoAtiva } = useEstimativaCustoVisualizacao()
  const ativo = visualizacaoAtiva === id

  if (!montado) return null

  return (
    <div
      data-testid={`seletor-visao-painel-${id}`}
      className={`estimativa-custo-view-panel${ativo ? ' estimativa-custo-view-panel--ativo' : ''}`}
      role="tabpanel"
      aria-hidden={!ativo}
      hidden={!ativo}
    >
      <Suspense fallback={<ConteudoCarregandoEstimativaCusto />}>{children}</Suspense>
    </div>
  )
}

export function EstimativaCustoMultiView() {
  const { visualizacaoAtiva } = useEstimativaCustoVisualizacao()
  const [visitados, setVisitados] = useState<Set<EstimativaCustoVisualizacaoId>>(() =>
    visualizacaoAtiva ? new Set([visualizacaoAtiva]) : new Set(),
  )

  useEffect(() => {
    if (!visualizacaoAtiva) return
    setVisitados(prev => {
      if (prev.has(visualizacaoAtiva)) return prev
      const next = new Set(prev)
      next.add(visualizacaoAtiva)
      return next
    })
  }, [visualizacaoAtiva])

  return (
    <div className="estimativa-custo-multi-view">
      <Painel id="insights"  montado={visitados.has('insights')}><Insights /></Painel>
      <Painel id="lista"     montado={visitados.has('lista')}><Lista /></Painel>
      <Painel id="dashboard" montado={visitados.has('dashboard')}><Dashboard /></Painel>
      <Painel id="kanban"    montado={visitados.has('kanban')}><KanbanPage /></Painel>
    </div>
  )
}
