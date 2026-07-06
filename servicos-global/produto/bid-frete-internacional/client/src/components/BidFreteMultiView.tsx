/**
 * BidFreteMultiView — keep-alive das 4 visualizações (cliente ou fornecedor).
 */

import React, { Suspense, lazy, useEffect, useState } from 'react'
import {
  useBidFreteVisualizacao,
  type BidFreteVisualizacaoId,
  testidPainelSeletorBid,
} from './bid-frete-visualizacao-context'
import { BidFreteVisualizacaoTabs, type ModoVisualizacaoBidFrete } from './BidFreteVisualizacaoTabs'
import {
  AcoesToolbarVisualizacaoProvider,
  useAcoesToolbarVisualizacao,
} from './acoes-toolbar-visualizacao-bid-frete-internacional'
import { ConteudoCarregandoBidFreteInternacional } from '../shared/pagina-carregando-bid-frete-internacional'
import './BidFreteVisualizacaoTabs.css'
import './BidFreteMultiView.css'

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
  return <ConteudoCarregandoBidFreteInternacional />
}

function Painel({
  id,
  montado,
  modo,
  embedTabs,
  children,
}: {
  id: BidFreteVisualizacaoId
  montado: boolean
  modo: ModoVisualizacaoBidFrete
  embedTabs: boolean
  children: React.ReactNode
}) {
  const { painelAtivo } = useBidFreteVisualizacao()
  const ativo = painelAtivo(id)
  const acoesToolbar = useAcoesToolbarVisualizacao()

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
      {embedTabs && (
        <div className="bid-frete-vis-toolbar">
          <BidFreteVisualizacaoTabs modo={modo} />
          {ativo && acoesToolbar ? (
            <div className="bid-frete-vis-toolbar__acoes">{acoesToolbar}</div>
          ) : null}
        </div>
      )}
      <Suspense fallback={<PainelFallback />}>{children}</Suspense>
    </div>
  )
}

function PaineisCliente({
  visitados,
  embedTabs,
}: {
  visitados: Set<BidFreteVisualizacaoId>
  embedTabs: boolean
}) {
  return (
    <>
      <Painel id="insights" montado={visitados.has('insights')} modo="cliente" embedTabs={embedTabs}><VisaoGeralCliente /></Painel>
      <Painel id="lista" montado={visitados.has('lista')} modo="cliente" embedTabs={embedTabs}><CotacoesCliente /></Painel>
      <Painel id="dashboard" montado={visitados.has('dashboard')} modo="cliente" embedTabs={embedTabs}><DashboardCliente /></Painel>
      <Painel id="kanban" montado={visitados.has('kanban')} modo="cliente" embedTabs={embedTabs}><CotacoesCliente /></Painel>
    </>
  )
}

function PaineisFornecedor({
  visitados,
  embedTabs,
}: {
  visitados: Set<BidFreteVisualizacaoId>
  embedTabs: boolean
}) {
  return (
    <>
      <Painel id="insights" montado={visitados.has('insights')} modo="fornecedor" embedTabs={embedTabs}><VisaoFornecedorDashboard /></Painel>
      <Painel id="lista" montado={visitados.has('lista')} modo="fornecedor" embedTabs={embedTabs}><VisaoFornecedorLista /></Painel>
      <Painel id="dashboard" montado={visitados.has('dashboard')} modo="fornecedor" embedTabs={embedTabs}><VisaoFornecedorPaineis /></Painel>
      <Painel id="kanban" montado={visitados.has('kanban')} modo="fornecedor" embedTabs={embedTabs}><VisaoFornecedorKanban /></Painel>
    </>
  )
}

export function BidFreteMultiView({
  modo,
  embedTabs = true,
}: {
  modo: ModoVisualizacaoBidFrete
  embedTabs?: boolean
}) {
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
    <AcoesToolbarVisualizacaoProvider>
      <div className="bid-frete-multi-view">
        {modo === 'fornecedor'
          ? <PaineisFornecedor visitados={visitados} embedTabs={embedTabs} />
          : <PaineisCliente visitados={visitados} embedTabs={embedTabs} />}
      </div>
    </AcoesToolbarVisualizacaoProvider>
  )
}
