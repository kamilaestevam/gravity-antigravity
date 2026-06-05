/**
 * Contexto do seletor fixo BID Frete — painel ativo para keep-alive e prefetch.
 */

import React, { createContext, useContext, useMemo } from 'react'
import type { ModoVisualizacaoBidFrete } from './BidFreteVisualizacaoTabs'

export type BidFreteVisualizacaoId = 'insights' | 'lista' | 'dashboard' | 'kanban'

const TESTID_ABA: Record<BidFreteVisualizacaoId, string> = {
  insights: 'insights',
  lista: 'lista',
  dashboard: 'dashboard',
  kanban: 'kanban',
}

export function testidTabSeletorBid(id: BidFreteVisualizacaoId): string {
  return `seletor-visao-tab-${TESTID_ABA[id]}`
}

export function testidPainelSeletorBid(id: BidFreteVisualizacaoId): string {
  return `seletor-visao-painel-${TESTID_ABA[id]}`
}

export function resolverBidFreteVisualizacaoPorPathname(
  pathname: string,
  modo: ModoVisualizacaoBidFrete,
): BidFreteVisualizacaoId | null {
  if (modo === 'cliente') {
    if (pathname.includes('/insights') || pathname.includes('/visao-geral')) return 'insights'
    if (/\/lista(?:\/|$)/.test(pathname)) return 'lista'
    if (/\/dashboard(?:\/|$)/.test(pathname)) return 'dashboard'
    if (pathname.includes('/kanban')) return 'kanban'
    return null
  }
  if (/\/visao-fornecedor-bid-frete-internacional\/dashboard(?:\/|$)/.test(pathname)) {
    return 'insights'
  }
  if (pathname.includes('/paineis-dashboard')) return 'dashboard'
  if (/\/visao-fornecedor-bid-frete-internacional\/lista(?:\/|$)/.test(pathname)) return 'lista'
  if (pathname.includes('/kanban')) return 'kanban'
  return null
}

interface BidFreteVisualizacaoContextValue {
  modo: ModoVisualizacaoBidFrete
  visualizacaoAtiva: BidFreteVisualizacaoId | null
  painelAtivo: (id: BidFreteVisualizacaoId) => boolean
}

const BidFreteVisualizacaoContext = createContext<BidFreteVisualizacaoContextValue>({
  modo: 'cliente',
  visualizacaoAtiva: null,
  painelAtivo: () => false,
})

export function BidFreteVisualizacaoProvider({
  modo,
  visualizacaoAtiva,
  children,
}: {
  modo: ModoVisualizacaoBidFrete
  visualizacaoAtiva: BidFreteVisualizacaoId | null
  children: React.ReactNode
}) {
  const value = useMemo<BidFreteVisualizacaoContextValue>(
    () => ({
      modo,
      visualizacaoAtiva,
      painelAtivo: (id) => visualizacaoAtiva === id,
    }),
    [modo, visualizacaoAtiva],
  )

  return (
    <BidFreteVisualizacaoContext.Provider value={value}>
      {children}
    </BidFreteVisualizacaoContext.Provider>
  )
}

export function useBidFreteVisualizacao(): BidFreteVisualizacaoContextValue {
  return useContext(BidFreteVisualizacaoContext)
}
