/**
 * Contexto do seletor de visualização do Estimativa Custo —
 * paridade BidFreteVisualizacaoContext (pills Insights | Lista | Dashboard | Kanban).
 */
import React, { createContext, useContext, useMemo } from 'react'

export type EstimativaCustoVisualizacaoId = 'insights' | 'lista' | 'dashboard' | 'kanban'

export function resolverVisualizacaoEstimativaCustoPorPathname(
  pathname: string,
): EstimativaCustoVisualizacaoId | null {
  if (pathname.includes('/insights') || pathname.includes('/visao-geral')) return 'insights'
  if (/\/lista(?:\/|$)/.test(pathname)) return 'lista'
  if (/\/dashboard(?:\/|$)/.test(pathname)) return 'dashboard'
  if (pathname.includes('/kanban')) return 'kanban'
  return null
}

/** Rotas que exibem o seletor sem aba ativa (ex.: Configurações). */
export function ehRotaComSeletorVisualizacaoEstimativaCusto(pathname: string): boolean {
  if (resolverVisualizacaoEstimativaCustoPorPathname(pathname) !== null) return true
  return pathname.includes('/simula-custo/configuracoes')
}

interface EstimativaCustoVisualizacaoContextValue {
  visualizacaoAtiva: EstimativaCustoVisualizacaoId | null
}

const EstimativaCustoVisualizacaoContext =
  createContext<EstimativaCustoVisualizacaoContextValue>({ visualizacaoAtiva: null })

export function EstimativaCustoVisualizacaoProvider({
  visualizacaoAtiva,
  children,
}: {
  visualizacaoAtiva: EstimativaCustoVisualizacaoId | null
  children: React.ReactNode
}) {
  const value = useMemo(() => ({ visualizacaoAtiva }), [visualizacaoAtiva])
  return (
    <EstimativaCustoVisualizacaoContext.Provider value={value}>
      {children}
    </EstimativaCustoVisualizacaoContext.Provider>
  )
}

export function useEstimativaCustoVisualizacao(): EstimativaCustoVisualizacaoContextValue {
  return useContext(EstimativaCustoVisualizacaoContext)
}
