/**
 * Contexto do seletor de visualização do Simula Custo —
 * paridade BidFreteVisualizacaoContext (pills Insights | Lista | Dashboard | Kanban).
 */
import React, { createContext, useContext, useMemo } from 'react'

export type SimulaCustoVisualizacaoId = 'insights' | 'lista' | 'dashboard' | 'kanban'

export function resolverVisualizacaoSimulaCustoPorPathname(
  pathname: string,
): SimulaCustoVisualizacaoId | null {
  if (pathname.includes('/insights') || pathname.includes('/visao-geral')) return 'insights'
  if (/\/lista(?:\/|$)/.test(pathname)) return 'lista'
  if (/\/dashboard(?:\/|$)/.test(pathname)) return 'dashboard'
  if (pathname.includes('/kanban')) return 'kanban'
  return null
}

/** Rotas que exibem o seletor sem aba ativa (ex.: Configurações). */
export function ehRotaComSeletorVisualizacaoSimulaCusto(pathname: string): boolean {
  if (resolverVisualizacaoSimulaCustoPorPathname(pathname) !== null) return true
  return pathname.includes('/simula-custo/configuracoes')
}

interface SimulaCustoVisualizacaoContextValue {
  visualizacaoAtiva: SimulaCustoVisualizacaoId | null
}

const SimulaCustoVisualizacaoContext =
  createContext<SimulaCustoVisualizacaoContextValue>({ visualizacaoAtiva: null })

export function SimulaCustoVisualizacaoProvider({
  visualizacaoAtiva,
  children,
}: {
  visualizacaoAtiva: SimulaCustoVisualizacaoId | null
  children: React.ReactNode
}) {
  const value = useMemo(() => ({ visualizacaoAtiva }), [visualizacaoAtiva])
  return (
    <SimulaCustoVisualizacaoContext.Provider value={value}>
      {children}
    </SimulaCustoVisualizacaoContext.Provider>
  )
}

export function useSimulaCustoVisualizacao(): SimulaCustoVisualizacaoContextValue {
  return useContext(SimulaCustoVisualizacaoContext)
}
