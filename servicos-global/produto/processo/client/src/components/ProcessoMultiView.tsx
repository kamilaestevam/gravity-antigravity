/**
 * ProcessoMultiView — keep-alive Lista e Kanban.
 */

import React, { Suspense, lazy, useEffect, useState } from 'react'
import {
  useProcessoVisualizacao,
  type ProcessoVisualizacaoId,
  testidPainelSeletorProcesso,
} from './processo-visualizacao-context'
import './ProcessoMultiView.css'

const ProcessoLista = lazy(() => import('../pages/ProcessoLista'))
const TodosProcessosKanban = lazy(() => import('../pages/todos/TodosProcessosKanban'))

function PainelFallback() {
  return <div className="proc-view-fallback" aria-hidden />
}

function Painel({
  id,
  montado,
  children,
}: {
  id: ProcessoVisualizacaoId
  montado: boolean
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
      <Suspense fallback={<PainelFallback />}>{children}</Suspense>
    </div>
  )
}

export function ProcessoMultiView() {
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
      <Painel id="lista" montado={visitados.has('lista')}><ProcessoLista embedTabs={false} /></Painel>
      <Painel id="kanban" montado={visitados.has('kanban')}><TodosProcessosKanban embedTabs={false} /></Painel>
    </div>
  )
}
