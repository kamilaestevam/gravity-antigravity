// @vitest-environment jsdom
/**
 * selecaoStore.test.ts — Testes unitários do Zustand store de seleção do Pedido
 *
 * Cobre:
 *   hasMixedTipos — estado derivado calculado por calcularHasMixedTipos
 *   setPedidosSelecionados — atualiza pedidos e recalcula hasMixedTipos
 *   setItensSelecionados — atualiza itens sem afetar hasMixedTipos
 *   limparSelecao — reseta tudo
 *   useHasMixedTipos — hook isolado retorna valor correto
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import {
  useSelecaoStore,
  useHasMixedTipos,
} from '../../../../produto/pedido/client/src/shared/state/selecaoStore.js'
import type { Pedido, PedidoItem } from '../../../../produto/pedido/client/src/shared/types.js'

// ── Fixtures ──────────────────────────────────────────────────────────────────

function criarPedidoImportacao(id: string): Pedido {
  return {
    id,
    tenant_id: 'tenant-test',
    company_id: 'company-test',
    tipo_operacao: 'importacao',
    numero_pedido: `PO-IMP-${id}`,
    status: 'draft',
    itens: [],
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString(),
  } as unknown as Pedido
}

function criarPedidoExportacao(id: string): Pedido {
  return {
    id,
    tenant_id: 'tenant-test',
    company_id: 'company-test',
    tipo_operacao: 'exportacao',
    numero_pedido: `PO-EXP-${id}`,
    status: 'draft',
    itens: [],
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString(),
  } as unknown as Pedido
}

function criarItem(id: string): PedidoItem {
  return {
    id,
    tenant_id: 'tenant-test',
    pedido_id: 'pedi_001',
    part_number: 'SKU-001',
    sequencia_item: 1,
  } as unknown as PedidoItem
}

// ── Resetar store entre testes ────────────────────────────────────────────────

beforeEach(() => {
  act(() => {
    useSelecaoStore.getState().limparSelecao()
  })
})

// ── hasMixedTipos — estado derivado ──────────────────────────────────────────

describe('hasMixedTipos — estado derivado', () => {
  it('store vazia → hasMixedTipos = false', () => {
    const { hasMixedTipos } = useSelecaoStore.getState()
    expect(hasMixedTipos).toBe(false)
  })

  it('setPedidosSelecionados com todos importacao → hasMixedTipos = false', () => {
    act(() => {
      useSelecaoStore.getState().setPedidosSelecionados([
        criarPedidoImportacao('p1'),
        criarPedidoImportacao('p2'),
        criarPedidoImportacao('p3'),
      ])
    })
    expect(useSelecaoStore.getState().hasMixedTipos).toBe(false)
  })

  it('setPedidosSelecionados com todos exportacao → hasMixedTipos = false', () => {
    act(() => {
      useSelecaoStore.getState().setPedidosSelecionados([
        criarPedidoExportacao('p1'),
        criarPedidoExportacao('p2'),
      ])
    })
    expect(useSelecaoStore.getState().hasMixedTipos).toBe(false)
  })

  it('setPedidosSelecionados com mix importacao + exportacao → hasMixedTipos = true', () => {
    act(() => {
      useSelecaoStore.getState().setPedidosSelecionados([
        criarPedidoImportacao('p1'),
        criarPedidoExportacao('p2'),
      ])
    })
    expect(useSelecaoStore.getState().hasMixedTipos).toBe(true)
  })

  it('setPedidosSelecionados com um único pedido → hasMixedTipos = false', () => {
    act(() => {
      useSelecaoStore.getState().setPedidosSelecionados([
        criarPedidoImportacao('p1'),
      ])
    })
    expect(useSelecaoStore.getState().hasMixedTipos).toBe(false)
  })

  it('limparSelecao após mix → hasMixedTipos volta para false', () => {
    act(() => {
      useSelecaoStore.getState().setPedidosSelecionados([
        criarPedidoImportacao('p1'),
        criarPedidoExportacao('p2'),
      ])
    })
    expect(useSelecaoStore.getState().hasMixedTipos).toBe(true)

    act(() => {
      useSelecaoStore.getState().limparSelecao()
    })
    expect(useSelecaoStore.getState().hasMixedTipos).toBe(false)
  })

  it('limparSelecao reseta pedidosSelecionados e itensSelecionados', () => {
    act(() => {
      useSelecaoStore.getState().setPedidosSelecionados([criarPedidoImportacao('p1')])
      useSelecaoStore.getState().setItensSelecionados([criarItem('i1')])
    })
    act(() => {
      useSelecaoStore.getState().limparSelecao()
    })
    const state = useSelecaoStore.getState()
    expect(state.pedidosSelecionados).toHaveLength(0)
    expect(state.itensSelecionados).toHaveLength(0)
    expect(state.hasMixedTipos).toBe(false)
  })

  it('setItensSelecionados não afeta hasMixedTipos', () => {
    act(() => {
      useSelecaoStore.getState().setPedidosSelecionados([
        criarPedidoImportacao('p1'),
        criarPedidoExportacao('p2'),
      ])
    })
    const mixAntes = useSelecaoStore.getState().hasMixedTipos
    expect(mixAntes).toBe(true)

    act(() => {
      useSelecaoStore.getState().setItensSelecionados([criarItem('i1'), criarItem('i2')])
    })
    // hasMixedTipos não deve mudar com setItensSelecionados
    expect(useSelecaoStore.getState().hasMixedTipos).toBe(true)
  })

  it('substituir mix por lista homogênea → hasMixedTipos = false', () => {
    act(() => {
      useSelecaoStore.getState().setPedidosSelecionados([
        criarPedidoImportacao('p1'),
        criarPedidoExportacao('p2'),
      ])
    })
    expect(useSelecaoStore.getState().hasMixedTipos).toBe(true)

    act(() => {
      useSelecaoStore.getState().setPedidosSelecionados([
        criarPedidoImportacao('p3'),
        criarPedidoImportacao('p4'),
      ])
    })
    expect(useSelecaoStore.getState().hasMixedTipos).toBe(false)
  })
})

// ── useHasMixedTipos — hook isolado ──────────────────────────────────────────

describe('useHasMixedTipos — hook React', () => {
  it('retorna false na store vazia', () => {
    const { result } = renderHook(() => useHasMixedTipos())
    expect(result.current).toBe(false)
  })

  it('retorna true após setPedidosSelecionados com mix', () => {
    const { result } = renderHook(() => useHasMixedTipos())

    act(() => {
      useSelecaoStore.getState().setPedidosSelecionados([
        criarPedidoImportacao('p1'),
        criarPedidoExportacao('p2'),
      ])
    })

    expect(result.current).toBe(true)
  })

  it('retorna false após limparSelecao', () => {
    const { result } = renderHook(() => useHasMixedTipos())

    act(() => {
      useSelecaoStore.getState().setPedidosSelecionados([
        criarPedidoImportacao('p1'),
        criarPedidoExportacao('p2'),
      ])
    })
    expect(result.current).toBe(true)

    act(() => {
      useSelecaoStore.getState().limparSelecao()
    })
    expect(result.current).toBe(false)
  })

  it('atualiza reativamente ao mudar seleção de mix para homogêneo', () => {
    const { result } = renderHook(() => useHasMixedTipos())

    act(() => {
      useSelecaoStore.getState().setPedidosSelecionados([
        criarPedidoImportacao('p1'),
        criarPedidoExportacao('p2'),
      ])
    })
    expect(result.current).toBe(true)

    act(() => {
      useSelecaoStore.getState().setPedidosSelecionados([
        criarPedidoExportacao('p3'),
        criarPedidoExportacao('p4'),
      ])
    })
    expect(result.current).toBe(false)
  })
})
