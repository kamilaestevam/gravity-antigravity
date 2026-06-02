import React, { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { EscopoKanbanBidFrete } from './use-kanban-preferences-bid-frete'
import { ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL } from './rotas-bid-frete-internacional'

export type ModoConfiguracoesBidFrete = 'operacional' | 'fornecedor'

export interface BidFreteConfiguracoesVisaoConfig {
  modo: ModoConfiguracoesBidFrete
  /** Prefixo localStorage: `bid-frete:config` ou `bid-frete:fornecedor:config` */
  storagePrefix: string
  kanbanEscopo: EscopoKanbanBidFrete
  /** IDs de abas da sidebar (`SIDEBAR_ITEMS.id`) visíveis nesta visão */
  sidebarIdsPermitidos: Set<string>
  settingsRoute: string
}

export const CONFIG_CONFIGURACOES_OPERACIONAL: BidFreteConfiguracoesVisaoConfig = {
  modo: 'operacional',
  storagePrefix: 'bid-frete:config',
  kanbanEscopo: 'operacional',
  sidebarIdsPermitidos: new Set<string>(),
  settingsRoute: '/bid-frete/configuracoes',
}

export const CONFIG_CONFIGURACOES_FORNECEDOR: BidFreteConfiguracoesVisaoConfig = {
  modo: 'fornecedor',
  storagePrefix: 'bid-frete:fornecedor:config',
  kanbanEscopo: 'fornecedor',
  /** vazio = paridade com visão cliente (visualizações + produto + sistema) */
  sidebarIdsPermitidos: new Set<string>(),
  settingsRoute: ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.configuracoes,
}

const BidFreteConfiguracoesVisaoContext = createContext<BidFreteConfiguracoesVisaoConfig>(
  CONFIG_CONFIGURACOES_OPERACIONAL,
)

export function BidFreteConfiguracoesVisaoProvider({
  config,
  children,
}: {
  config: BidFreteConfiguracoesVisaoConfig
  children: ReactNode
}) {
  const value = useMemo(() => config, [config])
  return (
    <BidFreteConfiguracoesVisaoContext.Provider value={value}>
      {children}
    </BidFreteConfiguracoesVisaoContext.Provider>
  )
}

export function useBidFreteConfiguracoesVisao(): BidFreteConfiguracoesVisaoConfig {
  return useContext(BidFreteConfiguracoesVisaoContext)
}

/** Operacional ou Set vazio: todas as abas; caso contrário, filtra pelo conjunto */
export function todasAbasConfigPermitidas(config: BidFreteConfiguracoesVisaoConfig): boolean {
  return config.modo === 'operacional' || config.sidebarIdsPermitidos.size === 0
}

export function sidebarConfigPermitida(
  config: BidFreteConfiguracoesVisaoConfig,
  itemId: string,
): boolean {
  if (todasAbasConfigPermitidas(config)) return true
  return config.sidebarIdsPermitidos.has(itemId)
}
