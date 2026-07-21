/**
 * SimulaCustoMultiView — keep-alive das 4 visualizações.
 * Paridade BidFreteMultiView: cada visão monta na primeira visita e permanece
 * montada (hidden) ao trocar de pill — sem refetch a cada troca.
 */
import React, { Suspense, lazy, useEffect, useState } from 'react'
import {
  useSimulaCustoVisualizacao,
  type SimulaCustoVisualizacaoId,
} from './simula-custo-visualizacao-context'
import { ConteudoCarregandoSimulaCusto } from '../shared/pagina-carregando-simula-custo'
import './SimulaCustoVisualizacaoTabs.css'

const Insights   = lazy(() => import('../pages/insights-simula-custo'))
const Lista      = lazy(() => import('../pages/lista-simula-custo'))
const Dashboard  = lazy(() => import('../pages/dashboard-simula-custo'))
const KanbanPage = lazy(() => import('../pages/kanban-simula-custo'))

function Painel({
  id,
  montado,
  children,
}: {
  id: SimulaCustoVisualizacaoId
  montado: boolean
  children: React.ReactNode
}) {
  const { visualizacaoAtiva } = useSimulaCustoVisualizacao()
  const ativo = visualizacaoAtiva === id

  if (!montado) return null

  return (
    <div
      data-testid={`seletor-visao-painel-${id}`}
      className={`simula-custo-view-panel${ativo ? ' simula-custo-view-panel--ativo' : ''}`}
      role="tabpanel"
      aria-hidden={!ativo}
      hidden={!ativo}
    >
      <Suspense fallback={<ConteudoCarregandoSimulaCusto />}>{children}</Suspense>
    </div>
  )
}

export function SimulaCustoMultiView() {
  const { visualizacaoAtiva } = useSimulaCustoVisualizacao()
  const [visitados, setVisitados] = useState<Set<SimulaCustoVisualizacaoId>>(() =>
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
    <div className="simula-custo-multi-view">
      <Painel id="insights"  montado={visitados.has('insights')}><Insights /></Painel>
      <Painel id="lista"     montado={visitados.has('lista')}><Lista /></Painel>
      <Painel id="dashboard" montado={visitados.has('dashboard')}><Dashboard /></Painel>
      <Painel id="kanban"    montado={visitados.has('kanban')}><KanbanPage /></Painel>
    </div>
  )
}
