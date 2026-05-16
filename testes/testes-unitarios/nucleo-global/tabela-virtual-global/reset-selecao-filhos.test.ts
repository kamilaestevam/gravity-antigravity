// @vitest-environment jsdom
// TST-UNIT-TVG-001 — resetSelecaoFilhos (ghost selection fix)
// Cobre: limpeza de filhosSelecionados via prop counter, prevenção de ghost
// selection após exclusão de itens, e não-limpeza quando counter não muda.
/// <reference types="vitest/globals" />

import { renderHook, act } from '@testing-library/react'
import { useState, useRef, useEffect } from 'react'

// ─── Lógica extraída do TabelaVirtualGlobal para teste isolado ──────────────
// Testa o useEffect de reset sem montar o componente completo (pesado, 5k+ linhas).
// O hook simula EXATAMENTE a mesma lógica do useEffect em TabelaVirtualGlobal.tsx.

function useResetSelecaoFilhos(resetSelecaoFilhos?: number) {
  const [filhosSelecionados, setFilhosSelecionados] = useState<Set<string>>(new Set())
  const filhosCacheMap = useRef<Map<string, unknown>>(new Map())

  // Simula a mesma lógica do useEffect de reset no TabelaVirtualGlobal
  const resetSelecaoFilhosRef = useRef(resetSelecaoFilhos ?? 0)
  useEffect(() => {
    const valor = resetSelecaoFilhos ?? 0
    if (valor === resetSelecaoFilhosRef.current) return
    resetSelecaoFilhosRef.current = valor

    setFilhosSelecionados(prev => {
      if (prev.size === 0) return prev
      filhosCacheMap.current.clear()
      return new Set()
    })
  }, [resetSelecaoFilhos])

  const adicionarFilho = (id: string, obj?: unknown) => {
    setFilhosSelecionados(prev => new Set(prev).add(id))
    filhosCacheMap.current.set(id, obj ?? { id })
  }

  return { filhosSelecionados, filhosCacheMap, adicionarFilho }
}

// ─── Testes ─────────────────────────────────────────────────────────────────

describe('resetSelecaoFilhos — ghost selection fix', () => {
  it('limpa filhosSelecionados quando counter incrementa', () => {
    let counter = 0
    const { result, rerender } = renderHook(
      ({ reset }) => useResetSelecaoFilhos(reset),
      { initialProps: { reset: counter } },
    )

    // Adiciona 2 filhos selecionados
    act(() => {
      result.current.adicionarFilho('item-1')
      result.current.adicionarFilho('item-2')
    })
    expect(result.current.filhosSelecionados.size).toBe(2)

    // Incrementa counter → deve limpar
    counter = 1
    rerender({ reset: counter })

    expect(result.current.filhosSelecionados.size).toBe(0)
  })

  it('limpa filhosCacheMap junto com filhosSelecionados', () => {
    let counter = 0
    const { result, rerender } = renderHook(
      ({ reset }) => useResetSelecaoFilhos(reset),
      { initialProps: { reset: counter } },
    )

    act(() => {
      result.current.adicionarFilho('item-A', { id: 'item-A', numero: '001' })
      result.current.adicionarFilho('item-B', { id: 'item-B', numero: '002' })
    })
    expect(result.current.filhosCacheMap.current.size).toBe(2)

    counter = 1
    rerender({ reset: counter })

    expect(result.current.filhosCacheMap.current.size).toBe(0)
  })

  it('NÃO limpa quando counter não muda', () => {
    const { result, rerender } = renderHook(
      ({ reset }) => useResetSelecaoFilhos(reset),
      { initialProps: { reset: 0 } },
    )

    act(() => {
      result.current.adicionarFilho('item-1')
    })
    expect(result.current.filhosSelecionados.size).toBe(1)

    // Re-render com mesmo valor → NÃO deve limpar
    rerender({ reset: 0 })
    expect(result.current.filhosSelecionados.size).toBe(1)
  })

  it('NÃO limpa quando counter é undefined', () => {
    const { result, rerender } = renderHook(
      ({ reset }) => useResetSelecaoFilhos(reset),
      { initialProps: { reset: undefined as number | undefined } },
    )

    act(() => {
      result.current.adicionarFilho('item-X')
    })
    expect(result.current.filhosSelecionados.size).toBe(1)

    // Re-render com undefined → NÃO deve limpar
    rerender({ reset: undefined })
    expect(result.current.filhosSelecionados.size).toBe(1)
  })

  it('não faz nada se filhosSelecionados já está vazio quando counter incrementa', () => {
    let counter = 0
    const { result, rerender } = renderHook(
      ({ reset }) => useResetSelecaoFilhos(reset),
      { initialProps: { reset: counter } },
    )

    // Não adiciona nenhum filho — Set vazio
    expect(result.current.filhosSelecionados.size).toBe(0)

    // Incrementa counter → Set continua vazio (sem erro)
    counter = 1
    rerender({ reset: counter })
    expect(result.current.filhosSelecionados.size).toBe(0)
  })

  it('suporta múltiplos resets consecutivos', () => {
    let counter = 0
    const { result, rerender } = renderHook(
      ({ reset }) => useResetSelecaoFilhos(reset),
      { initialProps: { reset: counter } },
    )

    // Ciclo 1: adicionar + reset
    act(() => {
      result.current.adicionarFilho('item-1')
      result.current.adicionarFilho('item-2')
    })
    expect(result.current.filhosSelecionados.size).toBe(2)

    counter = 1
    rerender({ reset: counter })
    expect(result.current.filhosSelecionados.size).toBe(0)

    // Ciclo 2: adicionar novos + reset
    act(() => {
      result.current.adicionarFilho('item-3')
    })
    expect(result.current.filhosSelecionados.size).toBe(1)

    counter = 2
    rerender({ reset: counter })
    expect(result.current.filhosSelecionados.size).toBe(0)
    expect(result.current.filhosCacheMap.current.size).toBe(0)
  })
})
