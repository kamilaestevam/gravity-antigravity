/**
 * Contexto do seletor Insights | Lista | Dashboard | Kanban (Processo).
 */

import React, { createContext, useContext, useMemo } from 'react'

export type ProcessoVisualizacaoId = 'insights' | 'lista' | 'dashboard' | 'kanban'

export function testidTabSeletorProcesso(id: ProcessoVisualizacaoId): string {
  return `seletor-visao-tab-${id}`
}

export function testidPainelSeletorProcesso(id: ProcessoVisualizacaoId): string {
  return `seletor-visao-painel-${id}`
}

export function resolverProcessoVisualizacaoPorPathname(pathname: string): ProcessoVisualizacaoId | null {
  if (pathname.includes('/kanban')) return 'kanban'
  if (pathname.includes('/dashboard')) return 'dashboard'
  if (pathname.includes('/insights')) return 'insights'
  if (pathname.includes('/lista')) return 'lista'
  return null
}

interface ProcessoVisualizacaoContextValue {
  visualizacaoAtiva: ProcessoVisualizacaoId | null
  painelAtivo: (id: ProcessoVisualizacaoId) => boolean
}

const ProcessoVisualizacaoContext = createContext<ProcessoVisualizacaoContextValue>({
  visualizacaoAtiva: null,
  painelAtivo: () => false,
})

export function ProcessoVisualizacaoProvider({
  visualizacaoAtiva,
  children,
}: {
  visualizacaoAtiva: ProcessoVisualizacaoId | null
  children: React.ReactNode
}) {
  const value = useMemo<ProcessoVisualizacaoContextValue>(
    () => ({
      visualizacaoAtiva,
      painelAtivo: (id) => visualizacaoAtiva === id,
    }),
    [visualizacaoAtiva],
  )

  return (
    <ProcessoVisualizacaoContext.Provider value={value}>
      {children}
    </ProcessoVisualizacaoContext.Provider>
  )
}

export function useProcessoVisualizacao(): ProcessoVisualizacaoContextValue {
  return useContext(ProcessoVisualizacaoContext)
}
