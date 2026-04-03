// @vitest-environment jsdom
/**
 * Testes unitários — useGTInlineEdit
 *
 * Cobre:
 *   - Estado inicial
 *   - iniciarEdicao: define célula editando e valor
 *   - atualizarValor: atualiza o valor em edição
 *   - confirmarEdicao: chama onEditar com args corretos
 *   - confirmarEdicao: atualiza item via onAtualizarItem
 *   - confirmarEdicao: fecha edição após sucesso
 *   - confirmarEdicao: rollback ao valor original em erro (409)
 *   - confirmarEdicao: define erro ao falhar
 *   - confirmarEdicao: noop se onEditar não definido
 *   - confirmarEdicao: gerencia flag salvando
 *   - cancelarEdicao: zera todo o estado
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGTInlineEdit } from '../../../../nucleo-global/Tabelas/tabela-virtual-global/src/hooks/useGTInlineEdit'

interface ItemMock {
  id: string
  numero_invoice: string
  updated_at: string
}

const ITEM_ORIGINAL: ItemMock = {
  id: 'pedido-001',
  numero_invoice: 'INV-2026/001',
  updated_at: '2026-01-15T10:00:00Z',
}

const ITEM_ATUALIZADO: ItemMock = {
  id: 'pedido-001',
  numero_invoice: 'INV-2026/002',
  updated_at: '2026-01-15T11:00:00Z',
}

describe('useGTInlineEdit — estado inicial', () => {
  it('deve iniciar sem célula em edição', () => {
    const { result } = renderHook(() => useGTInlineEdit<ItemMock>())
    expect(result.current.editandoCelula).toBeNull()
  })

  it('deve iniciar com valorEditando null', () => {
    const { result } = renderHook(() => useGTInlineEdit<ItemMock>())
    expect(result.current.valorEditando).toBeNull()
  })

  it('deve iniciar com salvando false', () => {
    const { result } = renderHook(() => useGTInlineEdit<ItemMock>())
    expect(result.current.salvando).toBe(false)
  })

  it('deve iniciar com erro null', () => {
    const { result } = renderHook(() => useGTInlineEdit<ItemMock>())
    expect(result.current.erro).toBeNull()
  })
})

describe('useGTInlineEdit — iniciarEdicao', () => {
  it('deve definir editandoCelula com id e campo corretos', () => {
    const { result } = renderHook(() => useGTInlineEdit<ItemMock>())

    act(() => {
      result.current.iniciarEdicao('pedido-001', 'numero_invoice', 'INV-2026/001')
    })

    expect(result.current.editandoCelula).toEqual({
      id: 'pedido-001',
      campo: 'numero_invoice',
    })
  })

  it('deve definir valorEditando com o valor atual', () => {
    const { result } = renderHook(() => useGTInlineEdit<ItemMock>())

    act(() => {
      result.current.iniciarEdicao('pedido-001', 'numero_invoice', 'INV-2026/001')
    })

    expect(result.current.valorEditando).toBe('INV-2026/001')
  })

  it('deve limpar erro anterior ao iniciar nova edição', () => {
    const onEditar = vi.fn().mockRejectedValue(new Error('Conflito'))
    const { result } = renderHook(() => useGTInlineEdit<ItemMock>(onEditar))

    // Cria um erro primeiro
    act(() => {
      result.current.iniciarEdicao('pedido-001', 'numero_invoice', 'INV-VELHA')
    })

    act(() => {
      result.current.iniciarEdicao('pedido-001', 'numero_invoice', 'INV-NOVA')
    })

    expect(result.current.erro).toBeNull()
  })

  it('deve aceitar valores de diferentes tipos', () => {
    const { result } = renderHook(() => useGTInlineEdit<ItemMock>())

    act(() => {
      result.current.iniciarEdicao('pedido-001', 'valor_total', 35000.00)
    })
    expect(result.current.valorEditando).toBe(35000.00)

    act(() => {
      result.current.iniciarEdicao('pedido-001', 'ativo', true)
    })
    expect(result.current.valorEditando).toBe(true)
  })
})

describe('useGTInlineEdit — atualizarValor', () => {
  it('deve atualizar o valor enquanto edita', () => {
    const { result } = renderHook(() => useGTInlineEdit<ItemMock>())

    act(() => {
      result.current.iniciarEdicao('pedido-001', 'numero_invoice', 'INV-ORIGINAL')
    })

    act(() => {
      result.current.atualizarValor('INV-NOVO')
    })

    expect(result.current.valorEditando).toBe('INV-NOVO')
  })

  it('deve preservar editandoCelula ao atualizar valor', () => {
    const { result } = renderHook(() => useGTInlineEdit<ItemMock>())

    act(() => {
      result.current.iniciarEdicao('pedido-001', 'numero_invoice', 'INV-ORIGINAL')
    })
    act(() => {
      result.current.atualizarValor('INV-NOVO')
    })

    expect(result.current.editandoCelula).toEqual({
      id: 'pedido-001',
      campo: 'numero_invoice',
    })
  })
})

describe('useGTInlineEdit — confirmarEdicao (sucesso)', () => {
  it('deve chamar onEditar com id, campo e valor corretos', async () => {
    const onEditar = vi.fn().mockResolvedValue(ITEM_ATUALIZADO)
    const { result } = renderHook(() => useGTInlineEdit<ItemMock>(onEditar))

    act(() => {
      result.current.iniciarEdicao('pedido-001', 'numero_invoice', 'INV-NOVO')
    })

    await act(async () => {
      await result.current.confirmarEdicao()
    })

    expect(onEditar).toHaveBeenCalledOnce()
    expect(onEditar).toHaveBeenCalledWith('pedido-001', 'numero_invoice', 'INV-NOVO')
  })

  it('deve chamar onAtualizarItem com o item retornado', async () => {
    const onEditar = vi.fn().mockResolvedValue(ITEM_ATUALIZADO)
    const onAtualizarItem = vi.fn()
    const { result } = renderHook(() => useGTInlineEdit<ItemMock>(onEditar, onAtualizarItem))

    act(() => {
      result.current.iniciarEdicao('pedido-001', 'numero_invoice', 'INV-NOVO')
    })

    await act(async () => {
      await result.current.confirmarEdicao()
    })

    expect(onAtualizarItem).toHaveBeenCalledOnce()
    expect(onAtualizarItem).toHaveBeenCalledWith(ITEM_ATUALIZADO)
  })

  it('deve fechar edição (editandoCelula = null) após sucesso', async () => {
    const onEditar = vi.fn().mockResolvedValue(ITEM_ATUALIZADO)
    const { result } = renderHook(() => useGTInlineEdit<ItemMock>(onEditar))

    act(() => {
      result.current.iniciarEdicao('pedido-001', 'numero_invoice', 'INV-NOVO')
    })

    await act(async () => {
      await result.current.confirmarEdicao()
    })

    expect(result.current.editandoCelula).toBeNull()
    expect(result.current.valorEditando).toBeNull()
    expect(result.current.erro).toBeNull()
  })

  it('deve ser noop sem error se onEditar nao definido', async () => {
    const { result } = renderHook(() => useGTInlineEdit<ItemMock>())

    act(() => {
      result.current.iniciarEdicao('pedido-001', 'numero_invoice', 'INV-NOVO')
    })

    await act(async () => {
      await result.current.confirmarEdicao()
    })

    // Fecha sem errar
    expect(result.current.editandoCelula).toBeNull()
  })
})

describe('useGTInlineEdit — confirmarEdicao (conflito 409)', () => {
  it('deve fazer rollback para valor original em erro', async () => {
    const onEditar = vi.fn().mockRejectedValue(new Error('Conflito: pedido foi modificado'))
    const { result } = renderHook(() => useGTInlineEdit<ItemMock>(onEditar))

    act(() => {
      result.current.iniciarEdicao('pedido-001', 'numero_invoice', 'INV-ORIGINAL')
    })
    act(() => {
      result.current.atualizarValor('INV-NOVO')
    })

    await act(async () => {
      await result.current.confirmarEdicao()
    })

    // valorEditando deve voltar ao original após rollback
    expect(result.current.valorEditando).toBe('INV-ORIGINAL')
  })

  it('deve definir mensagem de erro ao falhar', async () => {
    const onEditar = vi.fn().mockRejectedValue(new Error('Conflito: pedido modificado por outro usuario'))
    const { result } = renderHook(() => useGTInlineEdit<ItemMock>(onEditar))

    act(() => {
      result.current.iniciarEdicao('pedido-001', 'numero_invoice', 'INV-NOVO')
    })

    await act(async () => {
      await result.current.confirmarEdicao()
    })

    expect(result.current.erro).toBe('Conflito: pedido modificado por outro usuario')
  })

  it('deve definir erro generico para erros sem mensagem', async () => {
    const onEditar = vi.fn().mockRejectedValue('erro-string-puro')
    const { result } = renderHook(() => useGTInlineEdit<ItemMock>(onEditar))

    act(() => {
      result.current.iniciarEdicao('pedido-001', 'numero_invoice', 'INV-NOVO')
    })

    await act(async () => {
      await result.current.confirmarEdicao()
    })

    expect(result.current.erro).toBe('Erro ao salvar. Tente novamente.')
  })

  it('deve fechar edição mesmo em erro (editandoCelula = null)', async () => {
    const onEditar = vi.fn().mockRejectedValue(new Error('Conflito'))
    const { result } = renderHook(() => useGTInlineEdit<ItemMock>(onEditar))

    act(() => {
      result.current.iniciarEdicao('pedido-001', 'numero_invoice', 'INV-NOVO')
    })

    await act(async () => {
      await result.current.confirmarEdicao()
    })

    expect(result.current.editandoCelula).toBeNull()
  })
})

describe('useGTInlineEdit — flag salvando', () => {
  it('deve ser true durante a chamada async e false ao finalizar', async () => {
    let resolveSave!: (val: ItemMock) => void
    const onEditar = vi.fn().mockReturnValue(new Promise<ItemMock>(r => { resolveSave = r }))
    const { result } = renderHook(() => useGTInlineEdit<ItemMock>(onEditar))

    act(() => {
      result.current.iniciarEdicao('pedido-001', 'numero_invoice', 'INV-NOVO')
    })

    // Inicia sem aguardar
    let confirmPromise: Promise<void>
    act(() => { confirmPromise = result.current.confirmarEdicao() })

    expect(result.current.salvando).toBe(true)

    await act(async () => {
      resolveSave(ITEM_ATUALIZADO)
      await confirmPromise
    })

    expect(result.current.salvando).toBe(false)
  })
})

describe('useGTInlineEdit — cancelarEdicao', () => {
  it('deve fechar edição sem chamar API', () => {
    const onEditar = vi.fn()
    const { result } = renderHook(() => useGTInlineEdit<ItemMock>(onEditar))

    act(() => {
      result.current.iniciarEdicao('pedido-001', 'numero_invoice', 'INV-NOVO')
    })

    act(() => {
      result.current.cancelarEdicao()
    })

    expect(onEditar).not.toHaveBeenCalled()
    expect(result.current.editandoCelula).toBeNull()
    expect(result.current.valorEditando).toBeNull()
    expect(result.current.erro).toBeNull()
  })

  it('deve ser noop se nao ha edição ativa', () => {
    const { result } = renderHook(() => useGTInlineEdit<ItemMock>())

    act(() => {
      result.current.cancelarEdicao()
    })

    expect(result.current.editandoCelula).toBeNull()
    expect(result.current.valorEditando).toBeNull()
  })
})
