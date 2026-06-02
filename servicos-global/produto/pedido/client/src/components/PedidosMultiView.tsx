/**
 * PedidosMultiView — keep-alive das 4 visualizações (Insights, Lista, Dashboard, Kanban).
 *
 * Mesma instância de elemento em todas as rotas irmãs (App.tsx) para o React
 * preservar montagem ao trocar de pill/URL.
 */

import React, { Suspense, lazy, useEffect, useState } from 'react'
import { usePedidosVisualizacao, type PedidoVisualizacaoId, testidPainelSeletor } from './pedidos-visualizacao-context'
import { usePermissoesPedido } from '../shared/permissoes/usePermissoesPedido'
import { BloqueioPermissaoOpaco } from '../shared/permissoes/BloqueioPermissaoOpaco'
import './PedidosMultiView.css'

const PedidosVisaoGeral = lazy(() => import('../pages/PedidosVisaoGeral'))
const Pedidos = lazy(() => import('../pages/Pedidos'))
const PedidosDashboard = lazy(() => import('../pages/PedidosDashboard'))
const PedidosKanban = lazy(() => import('../pages/PedidosKanban'))

function PainelFallback() {
  return (
    <div className="pedido-view-fallback" aria-hidden>
      <div className="pedido-view-fallback__bar" />
      <div className="pedido-view-fallback__panel" />
    </div>
  )
}

interface PainelProps {
  id: PedidoVisualizacaoId
  pode: boolean
  motivo: string
  children: React.ReactNode
}

function Painel({
  id,
  pode,
  motivo,
  montado,
  children,
}: PainelProps & { montado: boolean }) {
  const { painelAtivo } = usePedidosVisualizacao()
  const ativo = painelAtivo(id)

  if (!montado) return null

  return (
    <div
      id={`pedido-view-${id}`}
      data-testid={testidPainelSeletor(id)}
      className={`pedido-view-panel${ativo ? ' pedido-view-panel--ativo' : ''}`}
      role="tabpanel"
      aria-hidden={!ativo}
      hidden={!ativo}
    >
      {ativo && (
        <span data-testid="seletor-visao-painel-pronto" className="sr-only" aria-hidden />
      )}
      <BloqueioPermissaoOpaco pode={pode} motivo={motivo} modo="bloqueio-tela">
        <Suspense fallback={<PainelFallback />}>
          {children}
        </Suspense>
      </BloqueioPermissaoOpaco>
    </div>
  )
}

export function PedidosMultiView() {
  const { visualizacaoAtiva } = usePedidosVisualizacao()
  const { estado: estadoPermissao } = usePermissoesPedido()
  const [visitados, setVisitados] = useState<Set<PedidoVisualizacaoId>>(() =>
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
    <div className="pedido-multi-view">
      <Painel
        id="visao-geral"
        montado={visitados.has('visao-geral')}
        pode={estadoPermissao('dashboard', 'ver') !== 'negado'}
        motivo="Sem permissão para ver a Visão Geral"
      >
        <PedidosVisaoGeral />
      </Painel>
      <Painel
        id="lista"
        montado={visitados.has('lista')}
        pode={estadoPermissao('lista', 'ver') !== 'negado'}
        motivo="Sem permissão para ver a Lista de Pedidos"
      >
        <Pedidos />
      </Painel>
      <Painel
        id="dashboard"
        montado={visitados.has('dashboard')}
        pode={estadoPermissao('dashboard', 'ver') !== 'negado'}
        motivo="Sem permissão para ver o Dashboard"
      >
        <PedidosDashboard />
      </Painel>
      <Painel
        id="kanban"
        montado={visitados.has('kanban')}
        pode={estadoPermissao('kanban', 'ver') !== 'negado'}
        motivo="Sem permissão para ver o Kanban"
      >
        <PedidosKanban />
      </Painel>
    </div>
  )
}
