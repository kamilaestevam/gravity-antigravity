/**
 * Contexto do seletor fixo de visualização — indica qual painel está ativo
 * para pausar canvas (Insights) e prefetch direcionado.
 */

import React, { createContext, useContext, useMemo } from 'react'

export type PedidoVisualizacaoId = 'visao-geral' | 'lista' | 'dashboard' | 'kanban'

const TESTID_ABA: Record<PedidoVisualizacaoId, string> = {
  'visao-geral': 'insights',
  lista: 'lista',
  dashboard: 'dashboard',
  kanban: 'kanban',
}

export function testidTabSeletor(id: PedidoVisualizacaoId): string {
  return `seletor-visao-tab-${TESTID_ABA[id]}`
}

export function testidPainelSeletor(id: PedidoVisualizacaoId): string {
  return `seletor-visao-painel-${TESTID_ABA[id]}`
}

export function resolverVisualizacaoPorPathname(pathname: string): PedidoVisualizacaoId | null {
  if (pathname.includes('/pedidos/visao-geral')) return 'visao-geral'
  if (pathname.includes('/pedidos/lista')) return 'lista'
  if (pathname.includes('/pedidos/dashboard')) return 'dashboard'
  if (pathname.includes('/pedidos/kanban')) return 'kanban'
  return null
}

export function ehRotaComSeletorVisualizacao(pathname: string): boolean {
  return resolverVisualizacaoPorPathname(pathname) !== null || pathname.includes('/pedido/configuracoes')
}

interface PedidosVisualizacaoContextValue {
  visualizacaoAtiva: PedidoVisualizacaoId | null
  painelAtivo: (id: PedidoVisualizacaoId) => boolean
}

const PedidosVisualizacaoContext = createContext<PedidosVisualizacaoContextValue>({
  visualizacaoAtiva: null,
  painelAtivo: () => false,
})

export function PedidosVisualizacaoProvider({
  visualizacaoAtiva,
  children,
}: {
  visualizacaoAtiva: PedidoVisualizacaoId | null
  children: React.ReactNode
}) {
  const value = useMemo<PedidosVisualizacaoContextValue>(
    () => ({
      visualizacaoAtiva,
      painelAtivo: (id) => visualizacaoAtiva === id,
    }),
    [visualizacaoAtiva],
  )

  return (
    <PedidosVisualizacaoContext.Provider value={value}>
      {children}
    </PedidosVisualizacaoContext.Provider>
  )
}

export function usePedidosVisualizacao(): PedidosVisualizacaoContextValue {
  return useContext(PedidosVisualizacaoContext)
}

/** Insights: globo/mapa só anima quando este painel está visível. */
export function usePainelInsightsAtivo(): boolean {
  return usePedidosVisualizacao().painelAtivo('visao-geral')
}
