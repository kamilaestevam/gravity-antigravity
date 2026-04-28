/**
 * useCardPreferences — preferências de cards por usuário (localStorage)
 *
 * Sincronização entre abas e componentes via custom event:
 *  - Toda escrita despacha 'pedido:cards-updated' no window
 *  - Todo hook ouve o evento e re-lê o localStorage
 *  - Funciona mesmo com múltiplas instâncias do hook na mesma página
 */

import { useState, useCallback, useEffect } from 'react'
import { CARDS_CATALOGO, CARDS_PADRAO } from './columnCatalog'

export type { CardDefinicao } from './columnCatalog'
export { CARDS_CATALOGO, CARDS_PADRAO }

// ─── Preferência por card ─────────────────────────────────────────────────────

export interface CardPreferencia {
  id:      string
  visible: boolean
}

const STORAGE_KEY   = 'pedido:cards-v2'
const SYNC_EVENT    = 'pedido:cards-updated'

const DEFAULT: CardPreferencia[] = CARDS_PADRAO.map(id => ({ id, visible: true }))

function carregarPrefs(): CardPreferencia[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT
    const salvas = JSON.parse(raw) as CardPreferencia[]
    return salvas.filter(p => CARDS_CATALOGO.find(c => c.id === p.id))
  } catch {
    return DEFAULT
  }
}

function salvar(next: CardPreferencia[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(SYNC_EVENT))
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCardPreferences() {
  const [prefs, setPrefs] = useState<CardPreferencia[]>(carregarPrefs)

  // Re-sincroniza quando outro componente (ou outra aba) atualiza
  useEffect(() => {
    function onSync() { setPrefs(carregarPrefs()) }
    window.addEventListener(SYNC_EVENT, onSync)
    window.addEventListener('storage',  onSync)   // outras abas
    return () => {
      window.removeEventListener(SYNC_EVENT, onSync)
      window.removeEventListener('storage',  onSync)
    }
  }, [])

  const persistir = useCallback((next: CardPreferencia[]) => {
    setPrefs(next)
    salvar(next)
  }, [])

  /** Colunas do catálogo ainda não adicionadas pelo usuário */
  const disponiveis = CARDS_CATALOGO.filter(c => !prefs.find(p => p.id === c.id))

  /** Adiciona um card do catálogo ao final da lista */
  const adicionar = useCallback((id: string) => {
    setPrefs(prev => {
      if (prev.find(p => p.id === id)) return prev
      const next = [...prev, { id, visible: true }]
      salvar(next)
      return next
    })
  }, [])

  /** Remove um card da lista do usuário */
  const remover = useCallback((id: string) => {
    setPrefs(prev => {
      const next = prev.filter(p => p.id !== id)
      salvar(next)
      return next
    })
  }, [])

  /** Alterna visibilidade (olho) sem remover */
  const toggle = useCallback((id: string) => {
    setPrefs(prev => {
      const next = prev.map(p => p.id === id ? { ...p, visible: !p.visible } : p)
      salvar(next)
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
