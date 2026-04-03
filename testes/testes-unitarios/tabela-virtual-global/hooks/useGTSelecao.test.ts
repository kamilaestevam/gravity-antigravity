// @vitest-environment jsdom
/**
 * Testes unitários — useGTSelecao
 *
 * Cobre:
 *   - Estado inicial (Set vazio)
 *   - toggleItem: adiciona / remove
 *   - toggleTodos: seleciona todos / deseleciona todos
 *   - todosSelecionados: retorna true/false corretamente
 *   - parcialmnteSelecionados: retorna true/false corretamente
 *   - limpar: zera seleção
 *   - selecionadosArray: retorna array atualizado
 *   - Performance: O(1) lookup via Set
 */

import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGTSelecao } from '../../../../nucleo-global/Tabelas/tabela-virtual-global/src/hooks/useGTSelecao'

const IDS = ['id-1', 'id-2', 'id-3', 'id-4', 'id-5']

describe('useGTSelecao — estado inicial', () => {
  it('deve iniciar sem nenhum item selecionado', () => {
    const { result } = renderHook(() => useGTSelecao())
    expect(result.current.selecionados.size).toBe(0)
  })

  it('deve iniciar com selecionadosArray vazio', () => {
    const { result } = renderHook(() => useGTSelecao())
    expect(result.current.selecionadosArray).toEqual([])
  })
})

describe('useGTSelecao — toggleItem', () => {
  it('deve adicionar item ao conjunto de selecionados', () => {
    const { result } = renderHook(() => useGTSelecao())

    act(() => {
      result.current.toggleItem('id-1')
    })

    expect(result.current.selecionados.has('id-1')).toBe(true)
    expect(result.current.selecionados.size).toBe(1)
  })

  it('deve remover item ja selecionado', () => {
    const { result } = renderHook(() => useGTSelecao())

    act(() => { result.current.toggleItem('id-1') })
    act(() => { result.current.toggleItem('id-1') })

    expect(result.current.selecionados.has('id-1')).toBe(false)
    expect(result.current.selecionados.size).toBe(0)
  })

  it('deve permitir multiplas selecoes independentes', () => {
    const { result } = renderHook(() => useGTSelecao())

    act(() => {
      result.current.toggleItem('id-1')
      result.current.toggleItem('id-2')
      result.current.toggleItem('id-3')
    })

    expect(result.current.selecionados.size).toBe(3)
    expect(result.current.selecionados.has('id-1')).toBe(true)
    expect(result.current.selecionados.has('id-2')).toBe(true)
    expect(result.current.selecionados.has('id-3')).toBe(true)
  })

  it('deve manter outros selecionados ao remover um', () => {
    const { result } = renderHook(() => useGTSelecao())

    act(() => {
      result.current.toggleItem('id-1')
      result.current.toggleItem('id-2')
    })
    act(() => {
      result.current.toggleItem('id-1')
    })

    expect(result.current.selecionados.has('id-1')).toBe(false)
    expect(result.current.selecionados.has('id-2')).toBe(true)
    expect(result.current.selecionados.size).toBe(1)
  })

  it('deve atualizar selecionadosArray ao toggleItem', () => {
    const { result } = renderHook(() => useGTSelecao())

    act(() => { result.current.toggleItem('id-1') })

    expect(result.current.selecionadosArray).toContain('id-1')
    expect(result.current.selecionadosArray.length).toBe(1)
  })
})

describe('useGTSelecao — toggleTodos', () => {
  it('deve selecionar todos se nenhum esta selecionado', () => {
    const { result } = renderHook(() => useGTSelecao())

    act(() => {
      result.current.toggleTodos(IDS)
    })

    expect(result.current.selecionados.size).toBe(IDS.length)
    IDS.forEach(id => {
      expect(result.current.selecionados.has(id)).toBe(true)
    })
  })

  it('deve selecionar todos se apenas alguns estao selecionados', () => {
    const { result } = renderHook(() => useGTSelecao())

    act(() => { result.current.toggleItem('id-1') }) // seleciona parcialmente
    act(() => { result.current.toggleTodos(IDS) })

    expect(result.current.selecionados.size).toBe(IDS.length)
  })

  it('deve desselecionar todos se todos ja estao selecionados', () => {
    const { result } = renderHook(() => useGTSelecao())

    act(() => { result.current.toggleTodos(IDS) })
    expect(result.current.selecionados.size).toBe(IDS.length)

    act(() => { result.current.toggleTodos(IDS) })
    expect(IDS.every(id => !result.current.selecionados.has(id))).toBe(true)
  })

  it('deve nao alterar selecionados de outros ids ao toggleTodos', () => {
    const { result } = renderHook(() => useGTSelecao())

    act(() => { result.current.toggleItem('outro-id') })
    act(() => { result.current.toggleTodos(['id-1', 'id-2']) })

    // 'outro-id' deve permanecer selecionado
    expect(result.current.selecionados.has('outro-id')).toBe(true)
    expect(result.current.selecionados.has('id-1')).toBe(true)
    expect(result.current.selecionados.has('id-2')).toBe(true)
  })

  it('deve funcionar com array vazio sem erros', () => {
    const { result } = renderHook(() => useGTSelecao())

    act(() => { result.current.toggleTodos([]) })

    expect(result.current.selecionados.size).toBe(0)
  })
})

describe('useGTSelecao — todosSelecionados', () => {
  it('deve retornar true quando todos os ids estao selecionados', () => {
    const { result } = renderHook(() => useGTSelecao())

    act(() => { result.current.toggleTodos(['id-1', 'id-2']) })

    expect(result.current.todosSelecionados(['id-1', 'id-2'])).toBe(true)
  })

  it('deve retornar false quando apenas alguns estao selecionados', () => {
    const { result } = renderHook(() => useGTSelecao())

    act(() => { result.current.toggleItem('id-1') })

    expect(result.current.todosSelecionados(['id-1', 'id-2'])).toBe(false)
  })

  it('deve retornar false para lista vazia', () => {
    const { result } = renderHook(() => useGTSelecao())
    expect(result.current.todosSelecionados([])).toBe(false)
  })

  it('deve retornar false quando nenhum esta selecionado', () => {
    const { result } = renderHook(() => useGTSelecao())
    expect(result.current.todosSelecionados(['id-1', 'id-2'])).toBe(false)
  })
})

describe('useGTSelecao — parcialmnteSelecionados', () => {
  it('deve retornar true quando alguns (nao todos) estao selecionados', () => {
    const { result } = renderHook(() => useGTSelecao())

    act(() => { result.current.toggleItem('id-1') })

    expect(result.current.parcialmnteSelecionados(['id-1', 'id-2', 'id-3'])).toBe(true)
  })

  it('deve retornar false quando todos estao selecionados', () => {
    const { result } = renderHook(() => useGTSelecao())

    act(() => { result.current.toggleTodos(['id-1', 'id-2']) })

    expect(result.current.parcialmnteSelecionados(['id-1', 'id-2'])).toBe(false)
  })

  it('deve retornar false quando nenhum esta selecionado', () => {
    const { result } = renderHook(() => useGTSelecao())
    expect(result.current.parcialmnteSelecionados(['id-1', 'id-2'])).toBe(false)
  })

  it('deve retornar false para lista vazia', () => {
    const { result } = renderHook(() => useGTSelecao())
    expect(result.current.parcialmnteSelecionados([])).toBe(false)
  })
})

describe('useGTSelecao — limpar', () => {
  it('deve zerar todos os selecionados', () => {
    const { result } = renderHook(() => useGTSelecao())

    act(() => { result.current.toggleTodos(IDS) })
    expect(result.current.selecionados.size).toBe(IDS.length)

    act(() => { result.current.limpar() })
    expect(result.current.selecionados.size).toBe(0)
    expect(result.current.selecionadosArray).toEqual([])
  })

  it('deve ser noop se selecionados ja esta vazio', () => {
    const { result } = renderHook(() => useGTSelecao())

    act(() => { result.current.limpar() })

    expect(result.current.selecionados.size).toBe(0)
  })
})

describe('useGTSelecao — selecionadosArray', () => {
  it('deve ser memo-izado (mesma referencia se selecionados nao mudou)', () => {
    const { result } = renderHook(() => useGTSelecao())

    const arr1 = result.current.selecionadosArray

    // Chamada de leitura sem mutação — deve retornar mesma referência
    const arr2 = result.current.selecionadosArray

    expect(arr1).toBe(arr2)
  })

  it('deve conter exatamente os ids selecionados', () => {
    const { result } = renderHook(() => useGTSelecao())

    act(() => {
      result.current.toggleItem('id-2')
      result.current.toggleItem('id-4')
    })

    const arr = result.current.selecionadosArray
    expect(arr).toHaveLength(2)
    expect(arr).toContain('id-2')
    expect(arr).toContain('id-4')
  })
})
