/**
 * useCardPreferences — preferências de cards por usuário (localStorage)
 */

import { useState, useCallback, useEffect } from 'react'
import { CARDS_CATALOGO, CARDS_PADRAO } from './columnCatalog'
import type { CardPeriodoCodigo } from './lista-card-schemas'

export type { CardDefinicao } from './columnCatalog'
export { CARDS_CATALOGO, CARDS_PADRAO }

export interface CardPreferencia {
  id:      string
  visible: boolean
}

const STORAGE_KEY    = 'pedido:cards-v2'
const PERIOD_KEY     = 'pedido:cards-periodo'
const SYNC_EVENT     = 'pedido:cards-updated'

const DEFAULT: CardPreferencia[] = CARDS_PADRAO.map(id => ({ id, visible: true }))
const DEFAULT_PERIODO: CardPeriodoCodigo = '30d'

function carregarPrefs(): CardPreferencia[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT
    const salvas = JSON.parse(raw) as CardPreferencia[]
    return salvas.filter(p =>
      CARDS_CATALOGO.find(c => c.id === p.id) || p.id.startsWith('custom:'),
    )
  } catch {
    return DEFAULT
  }
}

function carregarPeriodo(): CardPeriodoCodigo {
  try {
    const raw = localStorage.getItem(PERIOD_KEY) as CardPeriodoCodigo | null
    if (raw && ['7d', '30d', '6m', '1a', 'tudo'].includes(raw)) return raw
  } catch { /* ignore */ }
  return DEFAULT_PERIODO
}

function salvarPrefs(next: CardPreferencia[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(SYNC_EVENT))
}

function salvarPeriodo(periodo: CardPeriodoCodigo) {
  localStorage.setItem(PERIOD_KEY, periodo)
  window.dispatchEvent(new CustomEvent(SYNC_EVENT))
}

export function useCardPreferences() {
  const [prefs, setPrefs] = useState<CardPreferencia[]>(carregarPrefs)
  const [periodo, setPeriodoState] = useState<CardPeriodoCodigo>(carregarPeriodo)

  useEffect(() => {
    function onSync() {
      setPrefs(carregarPrefs())
      setPeriodoState(carregarPeriodo())
    }
    window.addEventListener(SYNC_EVENT, onSync)
    window.addEventListener('storage', onSync)
    return () => {
      window.removeEventListener(SYNC_EVENT, onSync)
      window.removeEventListener('storage', onSync)
    }
  }, [])

  const persistir = useCallback((next: CardPreferencia[]) => {
    setPrefs(next)
    salvarPrefs(next)
  }, [])

  const setPeriodo = useCallback((next: CardPeriodoCodigo) => {
    setPeriodoState(next)
    salvarPeriodo(next)
  }, [])

  const disponiveis = CARDS_CATALOGO.filter(c => !prefs.find(p => p.id === c.id))

  const adicionar = useCallback((id: string) => {
    setPrefs(prev => {
      if (prev.find(p => p.id === id)) return prev
      const next = [...prev, { id, visible: true }]
      salvarPrefs(next)
      return next
    })
  }, [])

  const remover = useCallback((id: string) => {
    setPrefs(prev => {
      const next = prev.filter(p => p.id !== id)
      salvarPrefs(next)
      return next
    })
  }, [])

  const toggle = useCallback((id: string) => {
    setPrefs(prev => {
      const next = prev.map(p => p.id === id ? { ...p, visible: !p.visible } : p)
      salvarPrefs(next)
      return next
    })
  }, [])

  const reordenar = useCallback((novaOrdem: CardPreferencia[]) => {
    persistir(novaOrdem)
  }, [persistir])

  const resetar = useCallback(() => {
    persistir(DEFAULT)
    setPeriodoState(DEFAULT_PERIODO)
    salvarPeriodo(DEFAULT_PERIODO)
  }, [persistir])

  const visiveis = prefs.filter(p => p.visible)

  return {
    prefs, visiveis, disponiveis, periodo,
    adicionar, remover, toggle, reordenar, resetar, setPeriodo,
  }
}
