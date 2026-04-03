/**
 * useCardPreferences — preferências de cards do SimulaCusto (localStorage)
 *
 * Sincronização entre abas e componentes via custom event:
 *  - Toda escrita despacha 'sc:cards-updated' no window
 *  - Todo hook ouve o evento e re-lê o localStorage
 *
 * Tolerante a novas entradas do catálogo: ao carregar preferências salvas,
 * mescla automaticamente cards novos do catálogo (visible: false) para que
 * o usuário possa descobri-los no configurador sem perder suas preferências.
 */

import { useState, useCallback, useEffect } from 'react'
import { CARDS_CATALOGO, CARDS_PADRAO } from './cardCatalog'

export type { CardDefinicao } from './cardCatalog'
export { CARDS_CATALOGO, CARDS_PADRAO }

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface CardPreferencia {
  id:      string
  visible: boolean
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'sc:cards-v2'
const SYNC_EVENT  = 'sc:cards-updated'

const DEFAULT: CardPreferencia[] = CARDS_PADRAO.map(id => ({ id, visible: true }))

// ─── Persistência ─────────────────────────────────────────────────────────────

function carregarPrefs(): CardPreferencia[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT

    const salvas = JSON.parse(raw) as CardPreferencia[]

    // Remove cards que não existem mais no catálogo
    const validas = salvas.filter(p => CARDS_CATALOGO.find(c => c.id === p.id))

    // Mescla cards novos do catálogo que ainda não estão nas preferências salvas
    const novas = CARDS_CATALOGO
      .filter(c => !validas.find(p => p.id === c.id))
      .map(c => ({ id: c.id, visible: false }))

    return [...validas, ...novas]
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
    window.addEventListener('storage',  onSync)
    return () => {
      window.removeEventListener(SYNC_EVENT, onSync)
      window.removeEventListener('storage',  onSync)
    }
  }, [])

  const persistir = useCallback((next: CardPreferencia[]) => {
    setPrefs(next)
    salvar(next)
  }, [])

  /** Cards do catálogo ainda não adicionados pelo usuário */
  const disponiveis = CARDS_CATALOGO.filter(c => !prefs.find(p => p.id === c.id))

  /** Adiciona um card ao final da lista (visível) */
  const adicionar = useCallback((id: string) => {
    setPrefs(prev => {
      if (prev.find(p => p.id === id)) return prev
      const next = [...prev, { id, visible: true }]
      salvar(next)
      return next
    })
  }, [])

  /** Remove um card da lista */
  const remover = useCallback((id: string) => {
    setPrefs(prev => {
      const next = prev.filter(p => p.id !== id)
      salvar(next)
      return next
    })
  }, [])

  /** Alterna visibilidade sem remover */
  const toggle = useCallback((id: string) => {
    setPrefs(prev => {
      const next = prev.map(p => p.id === id ? { ...p, visible: !p.visible } : p)
      salvar(next)
      return next
    })
  }, [])

  /** Reordena após DnD */
  const reordenar = useCallback((novaOrdem: CardPreferencia[]) => {
    persistir(novaOrdem)
  }, [persistir])

  /** Restaura configuração padrão */
  const resetar = useCallback(() => persistir(DEFAULT), [persistir])

  /** Cards visíveis na ordem configurada */
  const visiveis = prefs.filter(p => p.visible)

  return { prefs, visiveis, disponiveis, adicionar, remover, toggle, reordenar, resetar }
}
