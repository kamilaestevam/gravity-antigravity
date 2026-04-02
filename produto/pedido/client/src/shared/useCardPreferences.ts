/**
 * useCardPreferences — preferências de cards por usuário (localStorage)
 *
 * Modelo:
 *  - CARDS_CATALOGO: todas as colunas da tabela que podem virar card
 *  - CARDS_PADRAO:   ids adicionados por padrão para novos usuários
 *  - prefs:          lista de cards que o usuário adicionou (ordem + visibilidade)
 *  - disponíveis:    colunas do catálogo ainda não adicionadas pelo usuário
 */

import { useState, useCallback } from 'react'
import { CARDS_CATALOGO, CARDS_PADRAO } from './columnCatalog'

export type { CardDefinicao } from './columnCatalog'
export { CARDS_CATALOGO, CARDS_PADRAO }

// ─── Preferência por card ─────────────────────────────────────────────────────

export interface CardPreferencia {
  id:      string
  visible: boolean
}

const STORAGE_KEY = 'pedido:cards-v2'

const DEFAULT: CardPreferencia[] = CARDS_PADRAO.map(id => ({ id, visible: true }))

function carregarPrefs(): CardPreferencia[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT
    const salvas = JSON.parse(raw) as CardPreferencia[]
    // Filtra ids que ainda existem no catálogo
    return salvas.filter(p => CARDS_CATALOGO.find(c => c.id === p.id))
  } catch {
    return DEFAULT
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCardPreferences() {
  const [prefs, setPrefs] = useState<CardPreferencia[]>(carregarPrefs)

  const persistir = useCallback((next: CardPreferencia[]) => {
    setPrefs(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }, [])

  /** Colunas do catálogo ainda não adicionadas pelo usuário */
  const disponiveis = CARDS_CATALOGO.filter(c => !prefs.find(p => p.id === c.id))

  /** Adiciona um card do catálogo ao final da lista */
  const adicionar = useCallback((id: string) => {
    setPrefs(prev => {
      if (prev.find(p => p.id === id)) return prev
      const next = [...prev, { id, visible: true }]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  /** Remove um card da lista do usuário */
  const remover = useCallback((id: string) => {
    setPrefs(prev => {
      const next = prev.filter(p => p.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  /** Alterna visibilidade (olho) sem remover */
  const toggle = useCallback((id: string) => {
    setPrefs(prev => {
      const next = prev.map(p => p.id === id ? { ...p, visible: !p.visible } : p)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  /** Reordena a lista após DnD */
  const reordenar = useCallback((novaOrdem: CardPreferencia[]) => {
    persistir(novaOrdem)
  }, [persistir])

  /** Restaura configuração padrão */
  const resetar = useCallback(() => persistir(DEFAULT), [persistir])

  /** Cards visíveis na ordem configurada */
  const visiveis = prefs.filter(p => p.visible)

  return { prefs, visiveis, disponiveis, adicionar, remover, toggle, reordenar, resetar }
}
