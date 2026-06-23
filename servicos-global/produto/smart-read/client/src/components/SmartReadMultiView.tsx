/**
 * SmartReadMultiView — keep-alive das 4 visualizações
 */

import React, { Suspense, lazy, useEffect, useState } from 'react'
import {
  useSmartReadVisualizacao,
  testidPainelSeletorSmartRead,
} from './smart-read-visualizacao-context'
import {
  AcoesToolbarVisualizacaoProvider,
  useAcoesToolbarVisualizacao,
} from './acoes-toolbar-visualizacao-smart-read'
import type { SmartReadVisualizacaoId } from '../shared/rotas-smart-read'
import { SmartReadVisualizacaoTabs } from './SmartReadVisualizacaoTabs'
import './SmartReadVisualizacaoTabs.css'

const InsightsSmartRead = lazy(() => import('../pages/insights-smart-read'))
const ListaLeituraSmartRead = lazy(() => import('../pages/lista-leitura-smart-read'))
const DashboardSmartRead = lazy(() => import('../pages/dashboard-smart-read'))
const KanbanLeituraSmartRead = lazy(() => import('../pages/kanban-leitura-smart-read'))

function PainelFallback() {
  return (
    <div style={{ padding: '2rem', color: 'var(--ws-muted, #94a3b8)' }}>Carregando…</div>
  )
}

function Painel({
  id,
  montado,
  children,
}: {
  id: SmartReadVisualizacaoId
  montado: boolean
  children: React.ReactNode
}) {
  const { painelAtivo } = useSmartReadVisualizacao()
  const ativo = painelAtivo(id)
  const acoesToolbar = useAcoesToolbarVisualizacao()

  if (!montado) return null

  return (
    <div
      data-testid={testidPainelSeletorSmartRead(id)}
      className={`smart-read-view-panel${ativo ? ' smart-read-view-panel--ativo' : ''}`}
      role="tabpanel"
      aria-hidden={!ativo}
      hidden={!ativo}
    >
      {ativo && (
        <div className="smart-read-vis-toolbar">
          <SmartReadVisualizacaoTabs />
          {acoesToolbar ? (
            <div className="smart-read-vis-toolbar__acoes">{acoesToolbar}</div>
          ) : null}
        </div>
      )}
      <Suspense fallback={<PainelFallback />}>{children}</Suspense>
    </div>
  )
}

export function SmartReadMultiView() {
  const { visualizacaoAtiva } = useSmartReadVisualizacao()
  const [visitados, setVisitados] = useState<Set<SmartReadVisualizacaoId>>(() =>
    visualizacaoAtiva ? new Set([visualizacaoAtiva]) : new Set(['lista']),
  )

  useEffect(() => {
    if (!visualizacaoAtiva) return
    setVisitados((prev) => {
      if (prev.has(visualizacaoAtiva)) return prev
      const next = new Set(prev)
      next.add(visualizacaoAtiva)
      return next
    })
  }, [visualizacaoAtiva])

  return (
    <AcoesToolbarVisualizacaoProvider>
      <div className="smart-read-multi-view">
        <Painel id="insights" montado={visitados.has('insights')}><InsightsSmartRead /></Painel>
        <Painel id="lista" montado={visitados.has('lista')}><ListaLeituraSmartRead /></Painel>
        <Painel id="dashboard" montado={visitados.has('dashboard')}><DashboardSmartRead /></Painel>
        <Painel id="kanban" montado={visitados.has('kanban')}><KanbanLeituraSmartRead /></Painel>
      </div>
    </AcoesToolbarVisualizacaoProvider>
  )
}
