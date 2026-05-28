import { useCallback, useEffect, useState } from 'react'
import {
  type KanbanCardConfigBidFrete,
  KANBAN_BF_CARD_PADRAO,
  normalizarCardConfigBidFrete,
} from './kanban-bid-frete-card'

export const KANBAN_COLUNAS_OCULTAS_KEY = 'bid-frete:config:kanban-colunas-ocultas'
export const KANBAN_CARD_CONFIG_KEY = 'bid-frete:config:kanban-card-config'
export const KANBAN_CONFIG_SYNC_EVENT = 'bid-frete:kanban-config:atualizado'

function lerJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function carregarColunasOcultasKanbanBidFrete(): string[] {
  const salvas = lerJson<string[]>(KANBAN_COLUNAS_OCULTAS_KEY, [])
  return Array.isArray(salvas) ? salvas.filter(id => typeof id === 'string') : []
}

export function carregarCardConfigKanbanBidFrete(): KanbanCardConfigBidFrete {
  const salva = lerJson<unknown>(KANBAN_CARD_CONFIG_KEY, null)
  if (salva == null) return KANBAN_BF_CARD_PADRAO
  return normalizarCardConfigBidFrete(salva)
}

export function notificarKanbanConfigBidFreteAtualizado(): void {
  window.dispatchEvent(new CustomEvent(KANBAN_CONFIG_SYNC_EVENT))
}

export function useKanbanPreferencesBidFrete() {
  const [colunasOcultas, setColunasOcultas] = useState<string[]>(carregarColunasOcultasKanbanBidFrete)
  const [cardConfig, setCardConfig] = useState<KanbanCardConfigBidFrete>(carregarCardConfigKanbanBidFrete)

  const recarregar = useCallback(() => {
    setColunasOcultas(carregarColunasOcultasKanbanBidFrete())
    setCardConfig(carregarCardConfigKanbanBidFrete())
  }, [])

  useEffect(() => {
    const onSync = () => recarregar()
    window.addEventListener(KANBAN_CONFIG_SYNC_EVENT, onSync)
    window.addEventListener('storage', onSync)
    window.addEventListener('focus', onSync)
    return () => {
      window.removeEventListener(KANBAN_CONFIG_SYNC_EVENT, onSync)
      window.removeEventListener('storage', onSync)
      window.removeEventListener('focus', onSync)
    }
  }, [recarregar])

  return { colunasOcultas, cardConfig }
}

export type { KanbanCardConfigBidFrete } from './kanban-bid-frete-card'
