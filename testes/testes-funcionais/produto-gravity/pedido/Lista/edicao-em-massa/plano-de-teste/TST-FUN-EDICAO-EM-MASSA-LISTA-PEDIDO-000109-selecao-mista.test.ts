// TST-FUN-EDICAO-EM-MASSA-LISTA-PEDIDO-000109 — seleção mista
// @vitest-environment node
import { describe, it, expect } from 'vitest'

interface Item { id_item: string }
interface PedidoComItens { id_pedido: string; itens: Item[] }

function filtrarItensParaEdicao(
  pedidos: PedidoComItens[],
  itemIds: string[] | undefined,
  pedidoIdsCompleto: string[] | undefined,
): Item[] {
  const filtroItemIds = itemIds?.length ? new Set(itemIds) : null
  const pedidosCompletos = new Set(pedidoIdsCompleto ?? [])
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

const PEDIDOS: PedidoComItens[] = [
  { id_pedido: 'ped_001', itens: [{ id_item: 'i1' }, { id_item: 'i2' }, { id_item: 'i3' }] },
  { id_pedido: 'ped_002', itens: [{ id_item: 'i4' }, { id_item: 'i5' }] },
]

describe('TST-FUN-EDICAO-EM-MASSA-LISTA-PEDIDO-000109 — seleção mista', () => {
  it('F08: item_ids filtra 2 de 5 itens', () => {
    const r = filtrarItensParaEdicao(PEDIDOS, ['i2', 'i4'], undefined)
    expect(r.map(i => i.id_item)).toEqual(['i2', 'i4'])
  })

  it('F08b: pedido completo + item_ids avulsos', () => {
    const r = filtrarItensParaEdicao(PEDIDOS, ['i1', 'i4'], ['ped_002'])
    expect(r.map(i => i.id_item)).toEqual(['i1', 'i4', 'i5'])
  })
})
