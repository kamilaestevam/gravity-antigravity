// @vitest-environment node
import { describe, it, expect } from 'vitest'

interface Item {
  id_item: string
  campo_teste: string
}

interface PedidoComItens {
  id_pedido: string
  itens: Item[]
}

function filtrarItensParaEdicao(
  pedidos: PedidoComItens[],
  itemIds: string[] | undefined,
  pedidoIdsCompleto: string[] | undefined,
): Item[] {
  const filtroItemIds = itemIds && itemIds.length > 0 ? new Set(itemIds) : null
  const pedidosCompletos = pedidoIdsCompleto ? new Set(pedidoIdsCompleto) : new Set<string>()

  const resultado: Item[] = []
  for (const p of pedidos) {
    if (!filtroItemIds || pedidosCompletos.has(p.id_pedido)) {
      resultado.push(...p.itens)
    } else {
      resultado.push(...p.itens.filter(i => filtroItemIds.has(i.id_item)))
    }
  }
  return resultado
}

const PEDIDOS_COM_ITENS: PedidoComItens[] = [
  {
    id_pedido: 'ped_001',
    itens: [
      { id_item: 'item_001', campo_teste: 'A' },
      { id_item: 'item_002', campo_teste: 'B' },
      { id_item: 'item_003', campo_teste: 'C' },
    ],
  },
  {
    id_pedido: 'ped_002',
    itens: [
      { id_item: 'item_004', campo_teste: 'D' },
      { id_item: 'item_005', campo_teste: 'E' },
    ],
  },
]

describe('Edição em Massa — Seleção Mista (item_ids + pedido_ids_completo)', () => {
  it('F13: item_ids com 2 de 5 itens → apenas esses 2 retornados', () => {
    const resultado = filtrarItensParaEdicao(
      PEDIDOS_COM_ITENS,
      ['item_002', 'item_004'],
      undefined,
    )

    expect(resultado).toHaveLength(2)
    expect(resultado.map(i => i.id_item)).toEqual(['item_002', 'item_004'])
  })

  it('F14: pedido_ids_completo + item_ids → pedido completo retorna todos os itens, outro retorna filtrado', () => {
    const resultado = filtrarItensParaEdicao(
      PEDIDOS_COM_ITENS,
      ['item_001', 'item_004'],
      ['ped_002'],
    )

    // ped_001: não está em pedidosCompletos, filtroItemIds ativo → só item_001
    // ped_002: está em pedidosCompletos → todos os itens (item_004, item_005)
    expect(resultado).toHaveLength(3)
    expect(resultado.map(i => i.id_item)).toEqual(['item_001', 'item_004', 'item_005'])
  })

  it('F15: sem item_ids (undefined) → todos os itens de todos os pedidos retornados', () => {
    const resultado = filtrarItensParaEdicao(
      PEDIDOS_COM_ITENS,
      undefined,
      undefined,
    )

    expect(resultado).toHaveLength(5)
    expect(resultado.map(i => i.id_item)).toEqual([
      'item_001', 'item_002', 'item_003', 'item_004', 'item_005',
    ])
  })
})
