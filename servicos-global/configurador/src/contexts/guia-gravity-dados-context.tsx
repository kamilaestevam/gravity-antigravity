import React, { createContext, useContext } from 'react'
import type { GuiaGravityRankingResponse } from '../../shared/guia-gravity/guia-gravity-jornada-schema.js'

export interface GuiaGravityDadosContextValue {
  produtosContratados: string[]
  slugsAssinaturaAtiva: ReadonlySet<string>
  ranking: GuiaGravityRankingResponse['ranking']
  rankingCarregando: boolean
}

const GuiaGravityDadosContext = createContext<GuiaGravityDadosContextValue | null>(null)

export function GuiaGravityDadosProvider({
  value,
  children,
}: {
  value: GuiaGravityDadosContextValue
  children: React.ReactNode
}) {
  return <GuiaGravityDadosContext.Provider value={value}>{children}</GuiaGravityDadosContext.Provider>
}

export function useGuiaGravityDados(): GuiaGravityDadosContextValue {
  const ctx = useContext(GuiaGravityDadosContext)
  if (!ctx) {
    throw new Error('useGuiaGravityDados deve ser usado dentro de GuiaGravityDadosProvider')
  }
  return ctx
}
