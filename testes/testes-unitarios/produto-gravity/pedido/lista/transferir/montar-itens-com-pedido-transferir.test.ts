import { describe, it, expect } from 'vitest'
import {
  montarItensComPedidoParaTransferir,
  inicializarItensQuantidadesTransferir,
} from '../../../../../../servicos-global/produto/pedido/client/src/shared/montarItensComPedidoTransferir'
import type { Pedido, PedidoItem } from '../../../../../../servicos-global/produto/pedido/client/src/shared/types'

const pedidoPai: Pedido = {
  id: 'pedi_1',
  numero_pedido: 'DUPLIC0002',
  itens: [],
} as Pedido

const mkItem = (id: string, seq: number): PedidoItem => ({
  id,
  pedido_id: 'pedi_1',
  part_number: `PN-${seq}`,
  quantidade_atual_pedido: 100,
} as PedidoItem)

describe('montarItensComPedidoParaTransferir', () => {
  it('usa itensExplicitos quando pedido.itens está vazio (lista virtual)', () => {
    const seisItens = [1, 2, 3, 4, 5, 6].map(n => mkItem(`item_${n}`, n))
    const res = montarItensComPedidoParaTransferir([pedidoPai], seisItens, [pedidoPai])
    expect(res).toHaveLength(6)
    expect(res.map(r => r.item.id)).toEqual(seisItens.map(i => i.id))
  })

  it('sem itensExplicitos cai no fallback pedido.itens', () => {
    const pedidoComItens = {
      ...pedidoPai,
      itens: [mkItem('a', 1), mkItem('b', 2)],
    } as Pedido
    const res = montarItensComPedidoParaTransferir([pedidoComItens], undefined, undefined)
    expect(res).toHaveLength(2)
  })
})

describe('inicializarItensQuantidadesTransferir', () => {
  it('pré-seleciona todos os ids informados', () => {
    const ic = [1, 2, 3, 4, 5, 6].map(n => ({ item: mkItem(`item_${n}`, n), pedido: pedidoPai }))
    const mapa = inicializarItensQuantidadesTransferir(ic, ic.map(x => x.item.id))
    expect(mapa.size).toBe(6)
  })
})
