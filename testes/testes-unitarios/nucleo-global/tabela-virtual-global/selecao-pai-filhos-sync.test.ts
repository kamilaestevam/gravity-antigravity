// @vitest-environment jsdom
// TST-UNIT-TVG-002 — Sync seleção pai↔filhos
// Cobre: propagação de seleção para filhos não-cached, preservação de pai
// explicitamente selecionado ao colapsar, e desmarcação de auto-promovido.
/// <reference types="vitest/globals" />

import { renderHook, act, waitFor } from '@testing-library/react'
import { useState, useRef, useCallback, useEffect } from 'react'

// ─── Tipos simplificados ───────────────────────────────────────────────────

interface ItemPai { id: string }
interface ItemFilho { id: string; pedido_id: string }

// ─── Hook que replica a lógica de seleção do TabelaVirtualGlobal ───────────
// Extrai as 3 partes relevantes: toggleItemComSync, cleanup ao colapsar,
// e o mecanismo de paisAutoPromovidos. Testar o componente inteiro (6k+ linhas)
// é inviável — este hook simula EXATAMENTE a lógica envolvida nos 2 bugs.

function useSelecaoPaiFilhosSync(opts: {
  onCarregarFilhos?: (item: ItemPai) => Promise<ItemFilho[]>
  dados: ItemPai[]
}) {
  const { onCarregarFilhos, dados } = opts

  // ── selecionados (pais) ──
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const selecionadosRef = useRef(selecionados)
  selecionadosRef.current = selecionados

  const toggleItem = useCallback((id: string) => {
    setSelecionados(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }, [])

  // ── filhos selecionados ──
  const [filhosSelecionados, setFilhosSelecionados] = useState<Set<string>>(new Set())
  const filhosCacheMap = useRef<Map<string, ItemFilho>>(new Map())

  // ── auto-promoção ──
  const [paisAutoPromovidos, setPaisAutoPromovidos] = useState<Set<string>>(new Set())

  // ── filhosCache (simula useGTExpandir) ──
  const [filhosCache, setFilhosCache] = useState<Map<string, ItemFilho[]>>(new Map())
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set())

  // ── syncFilhosDoPai (extraído) ──
  const syncFilhosDoPai = useCallback(
    (filhosDoPai: ItemFilho[], marcar: boolean) => {
      setFilhosSelecionados(prev => {
        const novo = new Set(prev)
        for (const filho of filhosDoPai) {
          if (marcar) {
            novo.add(filho.id)
            filhosCacheMap.current.set(filho.id, filho)
          } else {
            novo.delete(filho.id)
            filhosCacheMap.current.delete(filho.id)
          }
        }
        return novo
      })
    },
    [],
  )

  // ── toggleItemComSync (lógica corrigida) ──
  const toggleItemComSync = useCallback(
    (id: string) => {
      const estavaMarcado = selecionados.has(id)
      toggleItem(id)

      setPaisAutoPromovidos(prev => {
        if (!prev.has(id)) return prev
        const n = new Set(prev); n.delete(id); return n
      })

      const filhosDoPai = filhosCache.get(id) ?? []

      if (filhosDoPai.length > 0) {
        syncFilhosDoPai(filhosDoPai, !estavaMarcado)
        return
      }

      if (!estavaMarcado && onCarregarFilhos) {
        const item = dados.find(d => d.id === id)
        if (!item) return
        onCarregarFilhos(item)
          .then(filhos => {
            if (filhos.length === 0) return
            if (!selecionadosRef.current.has(id)) return
            syncFilhosDoPai(filhos, true)
          })
          .catch(() => {})
      }
    },
    [selecionados, toggleItem, filhosCache, syncFilhosDoPai, onCarregarFilhos, dados],
  )

  // ── cleanup ao colapsar + re-sync ao expandir (lógica corrigida) ──
  const prevExpandidosRef = useRef<Set<string>>(expandidos)
  useEffect(() => {
    const prev = prevExpandidosRef.current
    prevExpandidosRef.current = expandidos

    const colapsados: string[] = []
    for (const id of prev) {
      if (!expandidos.has(id)) colapsados.push(id)
    }

    const recemExpandidos: string[] = []
    for (const id of expandidos) {
      if (!prev.has(id)) recemExpandidos.push(id)
    }

    // Collapse: limpa filhos
    if (colapsados.length > 0) {
      const idsParaRemover = new Set<string>()
      for (const paiId of colapsados) {
        const filhos = filhosCache.get(paiId) ?? []
        for (const filho of filhos) {
          idsParaRemover.add(filho.id)
        }
      }

      if (idsParaRemover.size > 0) {
        setFilhosSelecionados(prevSel => {
          const novo = new Set(prevSel)
          let mudou = false
          for (const fId of idsParaRemover) {
            if (novo.has(fId)) { novo.delete(fId); filhosCacheMap.current.delete(fId); mudou = true }
          }
          return mudou ? novo : prevSel
        })
      }

      for (const paiId of colapsados) {
        if (paisAutoPromovidos.has(paiId)) {
          toggleItem(paiId)
          setPaisAutoPromovidos(prev => { const n = new Set(prev); n.delete(paiId); return n })
        }
      }
    }

    // Expand: re-seleciona filhos de pais explicitamente selecionados
    if (recemExpandidos.length > 0) {
      for (const paiId of recemExpandidos) {
        if (!selecionados.has(paiId) || paisAutoPromovidos.has(paiId)) continue
        const filhos = filhosCache.get(paiId) ?? []
        if (filhos.length === 0) continue
        syncFilhosDoPai(filhos, true)
      }
    }
  }, [expandidos, filhosCache, selecionados, toggleItem, paisAutoPromovidos, syncFilhosDoPai])

  // ── helpers para os testes ──
  const expandir = useCallback((paiId: string, filhos: ItemFilho[]) => {
    setFilhosCache(prev => { const n = new Map(prev); n.set(paiId, filhos); return n })
    setExpandidos(prev => new Set(prev).add(paiId))
  }, [])

  const colapsar = useCallback((paiId: string) => {
    setExpandidos(prev => { const n = new Set(prev); n.delete(paiId); return n })
  }, [])

  const autoPromover = useCallback((paiId: string) => {
    setSelecionados(prev => new Set(prev).add(paiId))
    setPaisAutoPromovidos(prev => new Set(prev).add(paiId))
  }, [])

  return {
    selecionados,
    filhosSelecionados,
    paisAutoPromovidos,
    filhosCacheMap,
    toggleItemComSync,
    expandir,
    colapsar,
    autoPromover,
  }
}

// ─── Dados de teste ────────────────────────────────────────────────────────

const PAI_A: ItemPai = { id: 'pedido-1' }
const PAI_B: ItemPai = { id: 'pedido-2' }

const FILHOS_A: ItemFilho[] = [
  { id: 'item-1a', pedido_id: 'pedido-1' },
  { id: 'item-1b', pedido_id: 'pedido-1' },
  { id: 'item-1c', pedido_id: 'pedido-1' },
]

const FILHOS_B: ItemFilho[] = [
  { id: 'item-2a', pedido_id: 'pedido-2' },
]

// ─── Testes ────────────────────────────────────────────────────────────────

describe('Bug #1 — selecionar pai colapsado carrega filhos sob demanda', () => {
  it('carrega filhos e marca quando pai nunca expandido', async () => {
    const onCarregarFilhos = vi.fn().mockResolvedValue(FILHOS_A)

    const { result } = renderHook(() =>
      useSelecaoPaiFilhosSync({
        onCarregarFilhos,
        dados: [PAI_A, PAI_B],
      }),
    )

    // Seleciona pai sem expandir (filhos não estão no cache)
    act(() => { result.current.toggleItemComSync('pedido-1') })

    // Pai está selecionado imediatamente
    expect(result.current.selecionados.has('pedido-1')).toBe(true)

    // onCarregarFilhos foi chamado
    expect(onCarregarFilhos).toHaveBeenCalledWith(PAI_A)

    // Aguarda o fetch resolver e filhos serem marcados
    await waitFor(() => {
      expect(result.current.filhosSelecionados.size).toBe(3)
    })

    expect(result.current.filhosSelecionados.has('item-1a')).toBe(true)
    expect(result.current.filhosSelecionados.has('item-1b')).toBe(true)
    expect(result.current.filhosSelecionados.has('item-1c')).toBe(true)
  })

  it('NÃO marca filhos se pai foi desmarcado antes do fetch resolver', async () => {
    let resolverFetch: (filhos: ItemFilho[]) => void
    const fetchLento = vi.fn().mockImplementation(
      () => new Promise<ItemFilho[]>(resolve => { resolverFetch = resolve }),
    )

    const { result } = renderHook(() =>
      useSelecaoPaiFilhosSync({
        onCarregarFilhos: fetchLento,
        dados: [PAI_A],
      }),
    )

    // Seleciona pai
    act(() => { result.current.toggleItemComSync('pedido-1') })
    expect(result.current.selecionados.has('pedido-1')).toBe(true)

    // Desmarca pai ANTES do fetch resolver
    act(() => { result.current.toggleItemComSync('pedido-1') })
    expect(result.current.selecionados.has('pedido-1')).toBe(false)

    // Agora o fetch resolve
    await act(async () => { resolverFetch!(FILHOS_A) })

    // Filhos NÃO devem ser marcados (pai foi desmarcado)
    expect(result.current.filhosSelecionados.size).toBe(0)
  })

  it('não chama onCarregarFilhos ao desmarcar pai', () => {
    const onCarregarFilhos = vi.fn().mockResolvedValue(FILHOS_A)

    const { result } = renderHook(() =>
      useSelecaoPaiFilhosSync({
        onCarregarFilhos,
        dados: [PAI_A],
      }),
    )

    // Marca e desmarca (filhos não no cache)
    act(() => { result.current.toggleItemComSync('pedido-1') })
    onCarregarFilhos.mockClear()

    act(() => { result.current.toggleItemComSync('pedido-1') })

    // Desmarcar NÃO dispara fetch
    expect(onCarregarFilhos).not.toHaveBeenCalled()
  })

  it('propaga seleção normalmente quando filhos já estão no cache', () => {
    const onCarregarFilhos = vi.fn()

    const { result } = renderHook(() =>
      useSelecaoPaiFilhosSync({
        onCarregarFilhos,
        dados: [PAI_A],
      }),
    )

    // Expande primeiro (filhos entram no cache)
    act(() => { result.current.expandir('pedido-1', FILHOS_A) })

    // Seleciona pai
    act(() => { result.current.toggleItemComSync('pedido-1') })

    // Filhos marcados imediatamente (síncrono, sem fetch)
    expect(result.current.filhosSelecionados.size).toBe(3)
    expect(onCarregarFilhos).not.toHaveBeenCalled()
  })

  it('trata erro no fetch sem quebrar', async () => {
    const onCarregarFilhos = vi.fn().mockRejectedValue(new Error('network'))

    const { result } = renderHook(() =>
      useSelecaoPaiFilhosSync({
        onCarregarFilhos,
        dados: [PAI_A],
      }),
    )

    // Seleciona pai (fetch vai falhar)
    act(() => { result.current.toggleItemComSync('pedido-1') })

    // Pai está selecionado
    expect(result.current.selecionados.has('pedido-1')).toBe(true)

    // Aguarda o fetch falhar silenciosamente
    await waitFor(() => {
      expect(onCarregarFilhos).toHaveBeenCalled()
    })

    // Filhos continuam vazios (fetch falhou), mas sem erro
    expect(result.current.filhosSelecionados.size).toBe(0)
  })
})

describe('Bug #2 — colapsar pai preserva seleção explícita', () => {
  it('pai selecionado explicitamente permanece marcado ao colapsar', () => {
    const { result } = renderHook(() =>
      useSelecaoPaiFilhosSync({
        dados: [PAI_A],
      }),
    )

    // Expande, seleciona, colapsa
    act(() => { result.current.expandir('pedido-1', FILHOS_A) })
    act(() => { result.current.toggleItemComSync('pedido-1') })

    expect(result.current.selecionados.has('pedido-1')).toBe(true)
    expect(result.current.filhosSelecionados.size).toBe(3)

    // Colapsa o pai
    act(() => { result.current.colapsar('pedido-1') })

    // Pai permanece selecionado (seleção explícita)
    expect(result.current.selecionados.has('pedido-1')).toBe(true)

    // Filhos limpos (estão invisíveis)
    expect(result.current.filhosSelecionados.size).toBe(0)
  })

  it('pai auto-promovido é desmarcado ao colapsar', () => {
    const { result } = renderHook(() =>
      useSelecaoPaiFilhosSync({
        dados: [PAI_A],
      }),
    )

    // Expande e auto-promove (simula todos filhos marcados individualmente)
    act(() => { result.current.expandir('pedido-1', FILHOS_A) })
    act(() => { result.current.autoPromover('pedido-1') })

    expect(result.current.selecionados.has('pedido-1')).toBe(true)
    expect(result.current.paisAutoPromovidos.has('pedido-1')).toBe(true)

    // Colapsa
    act(() => { result.current.colapsar('pedido-1') })

    // Pai auto-promovido é desmarcado
    expect(result.current.selecionados.has('pedido-1')).toBe(false)
    expect(result.current.paisAutoPromovidos.has('pedido-1')).toBe(false)
  })

  it('múltiplos pais: só auto-promovido desmarca, explícito permanece', () => {
    const { result } = renderHook(() =>
      useSelecaoPaiFilhosSync({
        dados: [PAI_A, PAI_B],
      }),
    )

    // Expande ambos
    act(() => {
      result.current.expandir('pedido-1', FILHOS_A)
      result.current.expandir('pedido-2', FILHOS_B)
    })

    // pedido-1 selecionado explicitamente
    act(() => { result.current.toggleItemComSync('pedido-1') })

    // pedido-2 auto-promovido
    act(() => { result.current.autoPromover('pedido-2') })

    expect(result.current.selecionados.has('pedido-1')).toBe(true)
    expect(result.current.selecionados.has('pedido-2')).toBe(true)

    // Colapsa ambos
    act(() => {
      result.current.colapsar('pedido-1')
      result.current.colapsar('pedido-2')
    })

    // pedido-1 permanece (explícito)
    expect(result.current.selecionados.has('pedido-1')).toBe(true)
    // pedido-2 desmarcado (auto-promovido)
    expect(result.current.selecionados.has('pedido-2')).toBe(false)
  })
})

describe('Bug #3 — re-expandir pai selecionado restaura filhos', () => {
  it('selecionar → colapsar → expandir: filhos são restaurados', () => {
    const { result } = renderHook(() =>
      useSelecaoPaiFilhosSync({
        dados: [PAI_A],
      }),
    )

    // Expande e seleciona pai
    act(() => { result.current.expandir('pedido-1', FILHOS_A) })
    act(() => { result.current.toggleItemComSync('pedido-1') })

    expect(result.current.selecionados.has('pedido-1')).toBe(true)
    expect(result.current.filhosSelecionados.size).toBe(3)

    // Colapsa → filhos limpos, pai permanece
    act(() => { result.current.colapsar('pedido-1') })
    expect(result.current.selecionados.has('pedido-1')).toBe(true)
    expect(result.current.filhosSelecionados.size).toBe(0)

    // Re-expande → filhos restaurados automaticamente
    act(() => { result.current.expandir('pedido-1', FILHOS_A) })

    expect(result.current.selecionados.has('pedido-1')).toBe(true)
    expect(result.current.filhosSelecionados.size).toBe(3)
    expect(result.current.filhosSelecionados.has('item-1a')).toBe(true)
    expect(result.current.filhosSelecionados.has('item-1b')).toBe(true)
    expect(result.current.filhosSelecionados.has('item-1c')).toBe(true)
  })

  it('re-expandir pai NÃO selecionado não marca filhos', () => {
    const { result } = renderHook(() =>
      useSelecaoPaiFilhosSync({
        dados: [PAI_A],
      }),
    )

    // Expande sem selecionar, colapsa, re-expande
    act(() => { result.current.expandir('pedido-1', FILHOS_A) })
    act(() => { result.current.colapsar('pedido-1') })
    act(() => { result.current.expandir('pedido-1', FILHOS_A) })

    // Nenhum filho deve estar selecionado
    expect(result.current.filhosSelecionados.size).toBe(0)
  })

  it('ciclo completo: selecionar → colapsar → expandir → colapsar → expandir', () => {
    const { result } = renderHook(() =>
      useSelecaoPaiFilhosSync({
        dados: [PAI_A],
      }),
    )

    act(() => { result.current.expandir('pedido-1', FILHOS_A) })
    act(() => { result.current.toggleItemComSync('pedido-1') })
    expect(result.current.filhosSelecionados.size).toBe(3)

    // Ciclo 1: colapsar → expandir
    act(() => { result.current.colapsar('pedido-1') })
    expect(result.current.filhosSelecionados.size).toBe(0)

    act(() => { result.current.expandir('pedido-1', FILHOS_A) })
    expect(result.current.filhosSelecionados.size).toBe(3)

    // Ciclo 2: colapsar → expandir
    act(() => { result.current.colapsar('pedido-1') })
    expect(result.current.filhosSelecionados.size).toBe(0)

    act(() => { result.current.expandir('pedido-1', FILHOS_A) })
    expect(result.current.filhosSelecionados.size).toBe(3)
  })
})
