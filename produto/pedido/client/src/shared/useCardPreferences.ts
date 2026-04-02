/**
 * useCardPreferences — preferências de cards por usuário (localStorage)
 *
 * Modelo:
 *  - CARDS_CATALOGO: todos os cards disponíveis no produto (curado pela equipe)
 *  - CARDS_PADRAO:   ids adicionados por padrão para novos usuários
 *  - prefs:          lista de cards que o usuário adicionou (ordem + visibilidade)
 *  - disponíveis:    cards do catálogo ainda não adicionados pelo usuário
 */

import { useState, useCallback } from 'react'

// ─── Catálogo completo ────────────────────────────────────────────────────────

export interface CardDefinicao {
  id:        string
  labelKey:  string
  descKey:   string
  iconeKey:  string
  cor:       string
}

export const CARDS_CATALOGO: CardDefinicao[] = [
  // ── Padrão ───────────────────────────────────────────────────────────────
  {
    id: 'total_pedidos', labelKey: 'pedido.total_pedidos',
    descKey: 'pedido.itens_total', iconeKey: 'package', cor: 'var(--ws-accent, #818cf8)',
  },
  {
    id: 'valor_total', labelKey: 'pedido.valor_total',
    descKey: 'pedido.soma_pedidos', iconeKey: 'currency', cor: '#34d399',
  },
  {
    id: 'qtd_total', labelKey: 'pedido.qtd_total',
    descKey: 'pedido.qtd_acumulada', iconeKey: 'scales', cor: '#fbbf24',
  },
  // ── Disponíveis para adicionar ────────────────────────────────────────────
  {
    id: 'pedidos_atrasados', labelKey: 'pedido.pedidos_atrasados',
    descKey: 'pedido.pedidos_atrasados_desc', iconeKey: 'warning', cor: '#f87171',
  },
  {
    id: 'itens_prontos', labelKey: 'pedido.itens_prontos',
    descKey: 'pedido.itens_prontos_desc', iconeKey: 'check', cor: '#34d399',
  },
  {
    id: 'cobertura_pendente', labelKey: 'pedido.cobertura_pendente',
    descKey: 'pedido.cobertura_pendente_desc', iconeKey: 'currency-circle', cor: '#fb923c',
  },
]

// IDs adicionados por padrão para novos usuários
const CARDS_PADRAO = ['total_pedidos', 'valor_total', 'qtd_total']

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

  /** Cards do catálogo ainda não adicionados pelo usuário */
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
