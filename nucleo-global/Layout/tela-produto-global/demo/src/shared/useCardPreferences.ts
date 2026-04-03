/**
 * useCardPreferences — preferências de cards do Demo (localStorage)
 * Mesma lógica do padrão Gravity — chave isolada 'demo:cards-v1'.
 */

import { useState, useCallback, useEffect } from 'react'
import { CARDS_CATALOGO, CARDS_PADRAO } from './cardCatalog'

export type { CardDefinicao } from './cardCatalog'
export { CARDS_CATALOGO, CARDS_PADRAO }

export interface CardPreferencia {
  id:      string
  visible: boolean
}

const STORAGE_KEY = 'demo:cards-v1'
const SYNC_EVENT  = 'demo:cards-updated'

const DEFAULT: CardPreferencia[] = CARDS_PADRAO.map(id => ({ id, visible: true }))

function carregarPrefs(): CardPreferencia[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT

    const salvas = JSON.parse(raw) as CardPreferencia[]
    const validas = salvas.filter(p => CARDS_CATALOGO.find(c => c.id === p.id))
    const novas   = CARDS_CATALOGO
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

export function useCardPreferences() {
  const [prefs, setPrefs] = useState<CardPreferencia[]>(carregarPrefs)

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

  const disponiveis = CARDS_CATALOGO.filter(c => !prefs.find(p => p.id === c.id))

  const adicionar = useCallback((id: string) => {
    setPrefs(prev => {
      if (prev.find(p => p.id === id)) return prev
      const next = [...prev, { id, visible: true }]
      salvar(next)
      return next
    })
  }, [])

  const remover = useCallback((id: string) => {
    setPrefs(prev => {
      const next = prev.filter(p => p.id !== id)
      salvar(next)
      return next
    })
  }, [])

  const toggle = useCallback((id: string) => {
    setPrefs(prev => {
      const next = prev.map(p => p.id === id ? { ...p, visible: !p.visible } : p)
      salvar(next)
      return next
    })
  }, [])

  const reordenar = useCallback((novaOrdem: CardPreferencia[]) => {
    persistir(novaOrdem)
  }, [persistir])

  const resetar = useCallback(() => persistir(DEFAULT), [persistir])

  const visiveis = prefs.filter(p => p.visible)

  return { prefs, visiveis, disponiveis, adicionar, remover, toggle, reordenar, resetar }
}
