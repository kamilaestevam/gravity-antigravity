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
import type { BidFreteVisualizacaoId } from './bid-frete-visualizacao-context'
import { useBidFreteVisualizacao } from './bid-frete-visualizacao-context'

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
  visualizacaoId: BidFreteVisualizacaoId,
  acoes: ReactNode | null,
) {
  const { painelAtivo } = useBidFreteVisualizacao()
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
