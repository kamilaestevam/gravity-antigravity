import { useCallback, useEffect, useState } from 'react'
import {
  type KanbanCardConfigBidFrete,
  KANBAN_BF_CARD_PADRAO,
  normalizarCardConfigBidFrete,
} from './kanban-bid-frete-card'

export type EscopoKanbanBidFrete = 'operacional' | 'fornecedor'

export const KANBAN_COLUNAS_OCULTAS_KEY = 'bid-frete:config:kanban-colunas-ocultas'
export const KANBAN_CARD_CONFIG_KEY = 'bid-frete:config:kanban-card-config'
export const KANBAN_CONFIG_SYNC_EVENT = 'bid-frete:kanban-config:atualizado'

function chavesKanbanEscopo(escopo: EscopoKanbanBidFrete) {
  const sufixo = escopo === 'fornecedor' ? ':fornecedor' : ''
  return {
    colunasOcultas: `bid-frete${sufixo}:config:kanban-colunas-ocultas`,
    cardConfig: `bid-frete${sufixo}:config:kanban-card-config`,
    syncEvent: `bid-frete${sufixo}:kanban-config:atualizado`,
  }
}

function lerJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function carregarColunasOcultasKanbanBidFrete(escopo: EscopoKanbanBidFrete = 'operacional'): string[] {
  const { colunasOcultas } = chavesKanbanEscopo(escopo)
  const salvas = lerJson<string[]>(colunasOcultas, [])
  return Array.isArray(salvas) ? salvas.filter(id => typeof id === 'string') : []
}

export function carregarCardConfigKanbanBidFrete(escopo: EscopoKanbanBidFrete = 'operacional'): KanbanCardConfigBidFrete {
  const { cardConfig } = chavesKanbanEscopo(escopo)
  const salva = lerJson<unknown>(cardConfig, null)
  if (salva == null) return KANBAN_BF_CARD_PADRAO
  return normalizarCardConfigBidFrete(salva)
}

export function notificarKanbanConfigBidFreteAtualizado(escopo: EscopoKanbanBidFrete = 'operacional'): void {
  const { syncEvent } = chavesKanbanEscopo(escopo)
  window.dispatchEvent(new CustomEvent(syncEvent))
}

export function useKanbanPreferencesBidFrete(escopo: EscopoKanbanBidFrete = 'operacional') {
  const chaves = chavesKanbanEscopo(escopo)
  const [colunasOcultas, setColunasOcultas] = useState<string[]>(() =>
    carregarColunasOcultasKanbanBidFrete(escopo),
  )
  const [cardConfig, setCardConfig] = useState<KanbanCardConfigBidFrete>(() =>
    carregarCardConfigKanbanBidFrete(escopo),
  )

  const recarregar = useCallback(() => {
    setColunasOcultas(carregarColunasOcultasKanbanBidFrete(escopo))
    setCardConfig(carregarCardConfigKanbanBidFrete(escopo))
  }, [escopo])

  useEffect(() => {
    const onSync = () => recarregar()
    window.addEventListener(chaves.syncEvent, onSync)
    window.addEventListener('storage', onSync)
    window.addEventListener('focus', onSync)
    return () => {
      window.removeEventListener(chaves.syncEvent, onSync)
      window.removeEventListener('storage', onSync)
      window.removeEventListener('focus', onSync)
    }
  }, [recarregar, chaves.syncEvent])

  return { colunasOcultas, cardConfig }
}

export type { KanbanCardConfigBidFrete } from './kanban-bid-frete-card'
