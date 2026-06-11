import { describe, expect, it } from 'vitest'
import { valorTotalItemParaLista } from '../../../../servicos-global/produto/pedido/client/src/shared/valorTotalItemLista'
import type { PedidoItem } from '../../../../servicos-global/produto/pedido/client/src/shared/types'

function itemBase(parcial: Partial<PedidoItem>): PedidoItem {
  return {
    id: 'item-1',
    pedido_id: 'pedido-1',
    numero_item: 1,
    quantidade_inicial_pedido: 10,
    quantidade_atual_pedido: 10,
    quantidade_pronta_item: 0,
    quantidade_transferida_pedido: 0,
    quantidade_cancelada_pedido: 0,
    ...parcial,
  } as PedidoItem
}

describe('valorTotalItemParaLista', () => {
  it('usa valor_total_item persistido quando existir', () => {
    const total = valorTotalItemParaLista(itemBase({
      valor_total_item: 1500.5,
      valor_por_unidade_item: 1,
      quantidade_inicial_pedido: 10,
    }))
    expect(total).toBe(1500.5)
  })

  it('calcula unitário × qtd. inicial quando total não foi gravado', () => {
    const total = valorTotalItemParaLista(itemBase({
      valor_total_item: null,
      valor_por_unidade_item: 25,
      quantidade_inicial_pedido: 4,
    }))
    expect(total).toBe(100)
  })

  it('retorna null sem dados suficientes', () => {
    expect(valorTotalItemParaLista(itemBase({
      valor_total_item: null,
      valor_por_unidade_item: null,
    }))).toBeNull()
  })
})
