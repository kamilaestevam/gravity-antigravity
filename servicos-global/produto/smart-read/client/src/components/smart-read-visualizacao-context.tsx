/**
 * smart-read-visualizacao-context.tsx — contexto do seletor Insights|Lista|…
 */

import React, { createContext, useContext, useMemo } from 'react'
import type { SmartReadVisualizacaoId } from '../shared/rotas-smart-read'

const TESTID_ABA: Record<SmartReadVisualizacaoId, string> = {
  insights: 'insights',
  lista: 'lista',
  dashboard: 'dashboard',
  kanban: 'kanban',
}

export function testidTabSeletorSmartRead(id: SmartReadVisualizacaoId): string {
  return `seletor-visao-tab-${TESTID_ABA[id]}`
}

export function testidPainelSeletorSmartRead(id: SmartReadVisualizacaoId): string {
  return `seletor-visao-painel-${TESTID_ABA[id]}`
}

export function resolverSmartReadVisualizacaoPorPathname(pathname: string): SmartReadVisualizacaoId | null {
  if (pathname.includes('/insights')) return 'insights'
  if (/\/lista(?:\/|$)/.test(pathname)) return 'lista'
  if (/\/dashboard(?:\/|$)/.test(pathname)) return 'dashboard'
  if (pathname.includes('/kanban')) return 'kanban'
  return null
}

interface SmartReadVisualizacaoContextValue {
  visualizacaoAtiva: SmartReadVisualizacaoId | null
  painelAtivo: (id: SmartReadVisualizacaoId) => boolean
}

const SmartReadVisualizacaoContext = createContext<SmartReadVisualizacaoContextValue>({
  visualizacaoAtiva: null,
  painelAtivo: () => false,
})

export function SmartReadVisualizacaoProvider({
  visualizacaoAtiva,
  children,
}: {
  visualizacaoAtiva: SmartReadVisualizacaoId | null
  children: React.ReactNode
}) {
  const value = useMemo<SmartReadVisualizacaoContextValue>(
    () => ({
      visualizacaoAtiva,
      painelAtivo: (id) => visualizacaoAtiva === id,
    }),
    [visualizacaoAtiva],
  )

  return (
    <SmartReadVisualizacaoContext.Provider value={value}>
      {children}
    </SmartReadVisualizacaoContext.Provider>
  )
}

export function useSmartReadVisualizacao(): SmartReadVisualizacaoContextValue {
  return useContext(SmartReadVisualizacaoContext)
}
