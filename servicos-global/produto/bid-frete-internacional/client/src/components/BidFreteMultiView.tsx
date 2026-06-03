/**
 * BidFreteMultiView — keep-alive das 4 visualizações (cliente ou fornecedor).
 */

import React, { Suspense, lazy, useEffect, useState } from 'react'
import {
  useBidFreteVisualizacao,
  type BidFreteVisualizacaoId,
  testidPainelSeletorBid,
} from './bid-frete-visualizacao-context'
import type { ModoVisualizacaoBidFrete } from './BidFreteVisualizacaoTabs'
import './BidFreteVisualizacaoTabs.css'

const VisaoGeralCliente = lazy(() => import('../pages/visao-geral'))
const DashboardCliente = lazy(() => import('../pages/dashboard'))
const CotacoesCliente = lazy(() => import('../pages/lista-bid-frete-internacional'))
const VisaoFornecedorDashboard = lazy(
  () => import('../pages/visao-fornecedor-bid-frete-internacional/visao-fornecedor-bid-frete-internacional-dashboard'),
)
const VisaoFornecedorPaineis = lazy(
  () => import('../pages/visao-fornecedor-bid-frete-internacional/visao-fornecedor-bid-frete-internacional-paineis-dashboard'),
)
const VisaoFornecedorLista = lazy(
  () => import('../pages/visao-fornecedor-bid-frete-internacional/lista-visao-fornecedor-bid-frete-internacional'),
)
const VisaoFornecedorKanban = lazy(
  () => import('../pages/visao-fornecedor-bid-frete-internacional/kanban-visao-fornecedor-bid-frete-internacional'),
)

function PainelFallback() {
  return (
    <div className="bid-frete-view-fallback" aria-hidden>
      <div className="bid-frete-view-fallback__bar" />
    </div>
  )
}

function Painel({
  id,
  montado,
  children,
}: {
  id: BidFreteVisualizacaoId
  montado: boolean
  children: React.ReactNode
}) {
  const { painelAtivo } = useBidFreteVisualizacao()
  const ativo = painelAtivo(id)

  if (!montado) return null

  return (
    <div
      data-testid={testidPainelSeletorBid(id)}
      className={`bid-frete-view-panel${ativo ? ' bid-frete-view-panel--ativo' : ''}`}
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

function PaineisCliente({ visitados }: { visitados: Set<BidFreteVisualizacaoId> }) {
  return (
    <>
      <Painel id="visao-geral" montado={visitados.has('visao-geral')}><VisaoGeralCliente /></Painel>
      <Painel id="lista" montado={visitados.has('lista')}><CotacoesCliente /></Painel>
      <Painel id="dashboard" montado={visitados.has('dashboard')}><DashboardCliente /></Painel>
      <Painel id="kanban" montado={visitados.has('kanban')}><CotacoesCliente /></Painel>
    </>
  )
}

function PaineisFornecedor({ visitados }: { visitados: Set<BidFreteVisualizacaoId> }) {
  return (
    <>
      <Painel id="visao-geral" montado={visitados.has('visao-geral')}><VisaoFornecedorDashboard /></Painel>
      <Painel id="lista" montado={visitados.has('lista')}><VisaoFornecedorLista /></Painel>
      <Painel id="dashboard" montado={visitados.has('dashboard')}><VisaoFornecedorPaineis /></Painel>
      <Painel id="kanban" montado={visitados.has('kanban')}><VisaoFornecedorKanban /></Painel>
    </>
  )
}

export function BidFreteMultiView({ modo }: { modo: ModoVisualizacaoBidFrete }) {
  const { visualizacaoAtiva } = useBidFreteVisualizacao()
  const [visitados, setVisitados] = useState<Set<BidFreteVisualizacaoId>>(() =>
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
    <div className="bid-frete-multi-view">
      {modo === 'fornecedor'
        ? <PaineisFornecedor visitados={visitados} />
        : <PaineisCliente visitados={visitados} />}
    </div>
  )
}
