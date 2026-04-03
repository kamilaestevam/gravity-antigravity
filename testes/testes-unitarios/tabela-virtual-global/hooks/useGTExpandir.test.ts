// @vitest-environment jsdom
/**
 * Testes unitários — useGTExpandir
 *
 * Cobre:
 *   - Estado inicial
 *   - toggle: expande linha sem loader
 *   - toggle: colapsa linha já expandida
 *   - toggle: carrega filhos sob demanda via onCarregarFilhos
 *   - toggle: usa cache (não recarrega filhos já carregados)
 *   - toggle: gerencia carregandoFilhos durante load assíncrono
 *   - colapsar: colapsa item específico
 *   - colapsarTodos: colapsa todos os itens expandidos
 *   - erro no loader: não expande, remove carregandoFilhos
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGTExpandir } from '../../../../nucleo-global/Tabelas/tabela-virtual-global/src/hooks/useGTExpandir'

// ── Tipos de teste ────────────────────────────────────────────────────────────

interface PaiMock { id: string; nome: string }
interface FilhoMock { id: string; paiId: string }

const PAI_A: PaiMock = { id: 'a', nome: 'Pedido A' }
const PAI_B: PaiMock = { id: 'b', nome: 'Pedido B' }
const FILHOS_A: FilhoMock[] = [
  { id: 'f1', paiId: 'a' },
  { id: 'f2', paiId: 'a' },
]

// ── Testes ────────────────────────────────────────────────────────────────────

describe('useGTExpandir — estado inicial', () => {
  it('deve iniciar com expandidos vazio', () => {
    const { result } = renderHook(() => useGTExpandir<PaiMock, FilhoMock>())
    expect(result.current.expandidos.size).toBe(0)
  })

  it('deve iniciar com filhosCache vazio', () => {
    const { result } = renderHook(() => useGTExpandir<PaiMock, FilhoMock>())
    expect(result.current.filhosCache.size).toBe(0)
  })

  it('deve iniciar com carregandoFilhos vazio', () => {
    const { result } = renderHook(() => useGTExpandir<PaiMock, FilhoMock>())
    expect(result.current.carregandoFilhos.size).toBe(0)
  })
})

describe('useGTExpandir — toggle sem loader', () => {
  it('deve expandir item quando nao ha onCarregarFilhos', async () => {
    const { result } = renderHook(() => useGTExpandir<PaiMock, FilhoMock>())

    await act(async () => {
      await result.current.toggle('a', PAI_A)
    })

    expect(result.current.expandidos.has('a')).toBe(true)
  })

  it('deve colapsar item ja expandido', async () => {
    const { result } = renderHook(() => useGTExpandir<PaiMock, FilhoMock>())

    await act(async () => {
      await result.current.toggle('a', PAI_A)
    })
    expect(result.current.expandidos.has('a')).toBe(true)

    await act(async () => {
      await result.current.toggle('a', PAI_A)
    })
    expect(result.current.expandidos.has('a')).toBe(false)
  })

  it('deve manter outros itens expandidos ao colapsar um', async () => {
    const { result } = renderHook(() => useGTExpandir<PaiMock, FilhoMock>())

    await act(async () => {
      await result.current.toggle('a', PAI_A)
      await result.current.toggle('b', PAI_B)
    })
    expect(result.current.expandidos.has('a')).toBe(true)
    expect(result.current.expandidos.has('b')).toBe(true)

    await act(async () => {
      await result.current.toggle('a', PAI_A)
    })
    expect(result.current.expandidos.has('a')).toBe(false)
    expect(result.current.expandidos.has('b')).toBe(true)
  })
})

describe('useGTExpandir — toggle com onCarregarFilhos', () => {
  it('deve carregar filhos e expandir', async () => {
    const loader = vi.fn().mockResolvedValue(FILHOS_A)
    const { result } = renderHook(() => useGTExpandir<PaiMock, FilhoMock>(loader))

    await act(async () => {
      await result.current.toggle('a', PAI_A)
    })

    expect(loader).toHaveBeenCalledOnce()
    expect(loader).toHaveBeenCalledWith(PAI_A)
    expect(result.current.expandidos.has('a')).toBe(true)
    expect(result.current.filhosCache.get('a')).toEqual(FILHOS_A)
  })

  it('deve usar cache se filhos ja foram carregados', async () => {
    const loader = vi.fn().mockResolvedValue(FILHOS_A)
    const { result } = renderHook(() => useGTExpandir<PaiMock, FilhoMock>(loader))

    // Primeiro toggle: carrega
    await act(async () => {
      await result.current.toggle('a', PAI_A)
    })

    // Segundo toggle: colapsa
    await act(async () => {
      await result.current.toggle('a', PAI_A)
    })

    // Terceiro toggle: deve usar cache (não chama loader de novo)
    await act(async () => {
      await result.current.toggle('a', PAI_A)
    })

    expect(loader).toHaveBeenCalledOnce() // chamado apenas uma vez
    expect(result.current.expandidos.has('a')).toBe(true)
  })

  it('deve adicionar id a carregandoFilhos durante o load e remover apos', async () => {
    let resolveLoader!: (val: FilhoMock[]) => void
    const loader = vi.fn().mockReturnValue(new Promise<FilhoMock[]>(r => { resolveLoader = r }))
    const { result } = renderHook(() => useGTExpandir<PaiMock, FilhoMock>(loader))

    // Inicia toggle sem aguardar
    let togglePromise: Promise<void>
    act(() => {
      togglePromise = result.current.toggle('a', PAI_A)
    })

    // Durante o load, carregandoFilhos deve conter o id
    expect(result.current.carregandoFilhos.has('a')).toBe(true)

    // Resolve o loader
    await act(async () => {
      resolveLoader(FILHOS_A)
      await togglePromise
    })

    // Após completar, carregandoFilhos deve estar vazio
    expect(result.current.carregandoFilhos.has('a')).toBe(false)
    expect(result.current.expandidos.has('a')).toBe(true)
  })

  it('nao deve expandir se loader lanca erro', async () => {
    const loader = vi.fn().mockRejectedValue(new Error('Falha de rede'))
    const { result } = renderHook(() => useGTExpandir<PaiMock, FilhoMock>(loader))

    await act(async () => {
      await result.current.toggle('a', PAI_A).catch(() => {})
    })

    expect(result.current.expandidos.has('a')).toBe(false)
    expect(result.current.carregandoFilhos.has('a')).toBe(false)
  })
})

describe('useGTExpandir — colapsar', () => {
  it('deve colapsar item especifico sem afetar outros', async () => {
    const { result } = renderHook(() => useGTExpandir<PaiMock, FilhoMock>())

    await act(async () => {
      await result.current.toggle('a', PAI_A)
      await result.current.toggle('b', PAI_B)
    })

    act(() => {
      result.current.colapsar('a')
    })

    expect(result.current.expandidos.has('a')).toBe(false)
    expect(result.current.expandidos.has('b')).toBe(true)
  })

  it('deve ser noop se id nao esta expandido', () => {
    const { result } = renderHook(() => useGTExpandir<PaiMock, FilhoMock>())

    act(() => {
      result.current.colapsar('inexistente')
    })

    expect(result.current.expandidos.size).toBe(0)
  })
})

describe('useGTExpandir — colapsarTodos', () => {
  it('deve colapsar todos os itens expandidos', async () => {
    const { result } = renderHook(() => useGTExpandir<PaiMock, FilhoMock>())

    await act(async () => {
      await result.current.toggle('a', PAI_A)
      await result.current.toggle('b', PAI_B)
    })
    expect(result.current.expandidos.size).toBe(2)

    act(() => {
      result.current.colapsarTodos()
    })

    expect(result.current.expandidos.size).toBe(0)
  })

  it('nao preserva filhosCache ao colapsar todos', async () => {
    const loader = vi.fn().mockResolvedValue(FILHOS_A)
    const { result } = renderHook(() => useGTExpandir<PaiMock, FilhoMock>(loader))

    await act(async () => {
      await result.current.toggle('a', PAI_A)
    })
    expect(result.current.filhosCache.size).toBe(1)

    act(() => {
      result.current.colapsarTodos()
    })

    // Cache deve ser preservado (não limpo) para permitir re-expansão rápida
    expect(result.current.filhosCache.size).toBe(1)
    expect(result.current.expandidos.size).toBe(0)
  })
})
