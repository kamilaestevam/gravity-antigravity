/**
 * ProcessoMultiView — keep-alive Insights, Lista, Dashboard e Kanban.
 */

import React, { Suspense, lazy, useEffect, useState } from 'react'
import {
  useProcessoVisualizacao,
  type ProcessoVisualizacaoId,
  testidPainelSeletorProcesso,
} from './processo-visualizacao-context'
import { ProcessoPaginaTopo } from './ProcessoPaginaTopo'
import { TodosProcessosTabs } from '../pages/todos/TodosProcessosTabs'
import '../pages/todos/TodosProcessosTabs.css'
import './ProcessoMultiView.css'

const ProcessoInsights = lazy(() => import('../pages/ProcessoInsights'))
const ProcessoLista = lazy(() => import('../pages/ProcessoLista'))
const ProcessoDashboard = lazy(() => import('../pages/ProcessoDashboard'))
const TodosProcessosKanban = lazy(() => import('../pages/todos/TodosProcessosKanban'))

function PainelFallback() {
  return <div className="proc-view-fallback" aria-hidden />
}

function Painel({
  id,
  montado,
  embedTabs,
  children,
}: {
  id: ProcessoVisualizacaoId
  montado: boolean
  embedTabs: boolean
  children: React.ReactNode
}) {
  const { painelAtivo } = useProcessoVisualizacao()
  const ativo = painelAtivo(id)

  if (!montado) return null

  return (
    <div
      data-testid={testidPainelSeletorProcesso(id)}
      className={`proc-view-panel${ativo ? ' proc-view-panel--ativo' : ''}`}
      role="tabpanel"
      aria-hidden={!ativo}
      hidden={!ativo}
    >
      {ativo && (
        <span data-testid="seletor-visao-painel-pronto" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }} aria-hidden />
      )}
      {embedTabs && (
        <>
          <ProcessoPaginaTopo visualizacao={id} />
          <div className="proc-vis-toolbar">
            <TodosProcessosTabs />
          </div>
        </>
      )}
      <Suspense fallback={<PainelFallback />}>{children}</Suspense>
    </div>
  )
}

export function ProcessoMultiView({ embedTabs = true }: { embedTabs?: boolean }) {
  const { visualizacaoAtiva } = useProcessoVisualizacao()
  const [visitados, setVisitados] = useState<Set<ProcessoVisualizacaoId>>(() =>
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
    <div className="proc-multi-view">
      <Painel id="insights" montado={visitados.has('insights')} embedTabs={embedTabs}><ProcessoInsights /></Painel>
      <Painel id="lista" montado={visitados.has('lista')} embedTabs={embedTabs}><ProcessoLista embedTabs={false} /></Painel>
      <Painel id="dashboard" montado={visitados.has('dashboard')} embedTabs={embedTabs}><ProcessoDashboard /></Painel>
      <Painel id="kanban" montado={visitados.has('kanban')} embedTabs={embedTabs}><TodosProcessosKanban embedTabs={false} /></Painel>
    </div>
  )
}
