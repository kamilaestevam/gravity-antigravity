/**
 * useCardPreferences — preferências de cards por usuário (localStorage)
 *
 * Persiste quais cards estão visíveis e em qual ordem.
 * Ao adicionar novos cards ao catálogo, eles aparecem automaticamente
 * como visíveis no final da lista (merge inteligente).
 */

import { useState, useCallback } from 'react'

// ─── Catálogo de cards disponíveis ────────────────────────────────────────────

export interface CardDefinicao {
  id:       string
  labelKey: string
  descKey:  string
  iconeKey: string   // chave para mapear ícone no componente consumidor
  cor:      string
}

export const CARDS_CATALOGO: CardDefinicao[] = [
  {
    id:       'total_pedidos',
    labelKey: 'pedido.total_pedidos',
    descKey:  'pedido.itens_total',
    iconeKey: 'package',
    cor:      'var(--ws-accent, #818cf8)',
  },
  {
    id:       'valor_total',
    labelKey: 'pedido.valor_total',
    descKey:  'pedido.soma_pedidos',
    iconeKey: 'currency',
    cor:      '#34d399',
  },
  {
    id:       'qtd_total',
    labelKey: 'pedido.qtd_total',
    descKey:  'pedido.qtd_acumulada',
    iconeKey: 'scales',
    cor:      '#fbbf24',
  },
]

// ─── Tipo de preferência ───────────────────────────────────────────────────────

export interface CardPreferencia {
  id:      string
  visible: boolean
}

// ─── Storage ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'pedido:cards-v1'

const DEFAULT: CardPreferencia[] = CARDS_CATALOGO.map(c => ({ id: c.id, visible: true }))

function carregarPrefs(): CardPreferencia[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT
    const salvas = JSON.parse(raw) as CardPreferencia[]
    const mapasSalvos = new Map(salvas.map(p => [p.id, p]))
    // merge: mantém ordem salva + adiciona cards novos do catálogo ao final
    const resultado: CardPreferencia[] = []
    salvas.forEach(p => {
      if (CARDS_CATALOGO.find(c => c.id === p.id)) resultado.push(p)
    })
    CARDS_CATALOGO.forEach(c => {
      if (!mapasSalvos.has(c.id)) resultado.push({ id: c.id, visible: true })
    })
    return resultado
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

  /** Alterna visibilidade de um card */
  const toggle = useCallback((id: string) => {
    setPrefs(prev => {
      const next = prev.map(p => p.id === id ? { ...p, visible: !p.visible } : p)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  /** Move um card para cima ou para baixo na lista */
  const mover = useCallback((id: string, dir: 'up' | 'down') => {
    setPrefs(prev => {
      const idx = prev.findIndex(p => p.id === id)
      if (idx === -1) return prev
      const swapIdx = dir === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  /** Restaura configuração padrão */
  const resetar = useCallback(() => persistir(DEFAULT), [persistir])

  /** Cards visíveis na ordem configurada */
  const visiveis = prefs.filter(p => p.visible)

  return { prefs, visiveis, toggle, mover, resetar }
}
