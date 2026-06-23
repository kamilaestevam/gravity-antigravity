/**
 * Ações à direita da toolbar Insights|Lista|… (ex.: botão «Novo» na aba Insights).
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { SmartReadVisualizacaoId } from '../shared/rotas-smart-read'
import { useSmartReadVisualizacao } from './smart-read-visualizacao-context'

interface AcoesToolbarVisualizacaoContextValue {
  acoes: ReactNode | null
  definirAcoes: (value: ReactNode | null) => void
}

const AcoesToolbarVisualizacaoContext =
  createContext<AcoesToolbarVisualizacaoContextValue | null>(null)

export function AcoesToolbarVisualizacaoProvider({ children }: { children: ReactNode }) {
  const [acoes, setAcoes] = useState<ReactNode | null>(null)
  const definirAcoes = useCallback((value: ReactNode | null) => {
    setAcoes(value)
  }, [])
  const value = useMemo(
    () => ({ acoes, definirAcoes }),
    [acoes, definirAcoes],
  )
  return (
    <AcoesToolbarVisualizacaoContext.Provider value={value}>
      {children}
    </AcoesToolbarVisualizacaoContext.Provider>
  )
}

export function useAcoesToolbarVisualizacao(): ReactNode | null {
  return useContext(AcoesToolbarVisualizacaoContext)?.acoes ?? null
}

function useDefinirAcoesToolbarVisualizacao(): (value: ReactNode | null) => void {
  return useContext(AcoesToolbarVisualizacaoContext)?.definirAcoes ?? (() => {})
}

/** Registra ações na toolbar da visualização ativa; limpa ao desmontar ou ao trocar de aba. */
export function useSincronizarAcoesToolbarVisualizacao(
  visualizacaoId: SmartReadVisualizacaoId,
  acoes: ReactNode | null,
) {
  const { painelAtivo } = useSmartReadVisualizacao()
  const definirAcoes = useDefinirAcoesToolbarVisualizacao()
  const ativo = painelAtivo(visualizacaoId)

  useEffect(() => {
    if (!ativo) {
      definirAcoes(null)
      return undefined
    }
    definirAcoes(acoes)
    return () => definirAcoes(null)
  }, [ativo, acoes, definirAcoes])
}
