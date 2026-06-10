import { describe, it, expect } from 'vitest'
import {
  somaCubagemItensLista,
  somaPesoBrutoItensLista,
  somaPesoLiquidoItensLista,
  somaQuantidadeTotalPedidoLocal,
  somaValorTotalPedidoLocal,
} from '../../../servicos-global/produto/pedido/client/src/shared/agregadosFisicosLista'
import type { PedidoItem } from '../../../servicos-global/produto/pedido/client/src/shared/types'

function item(partial: Partial<PedidoItem>): PedidoItem {
  return {
    id: '1',
    tenant_id: 't',
    company_id: 'c',
    pedido_id: 'p',
    sequencia_item: 1,
    part_number: 'PN',
    ncm: '0000',
    descricao_item: 'x',
    quantidade_inicial_pedido: 10,
    quantidade_atual_pedido: 10,
    quantidade_pronta_item: 0,
    quantidade_transferida_pedido: 0,
    quantidade_cancelada_pedido: 0,
    casas_decimais_quantidade_item: 2,
    moeda_item: 'USD',
    valor_total_item: 100,
    casas_decimais_valor_item: 2,
    ...partial,
  }
}

describe('agregadosFisicosLista', () => {
  it('soma peso líquido como unitário × qtd. inicial', () => {
    const itens = [
      item({ peso_liquido_unitario: 2, quantidade_inicial_pedido: 100 }),
      item({ peso_liquido_unitario: 0.5, quantidade_inicial_pedido: 40 }),
    ]
    expect(somaPesoLiquidoItensLista(itens)).toBe(220)
  })

  it('soma valor total do pedido quando moedas homogêneas', () => {
    const itens = [
      item({ valor_total_item: 100, moeda_item: 'USD' }),
      item({ valor_total_item: 50, moeda_item: 'USD' }),
    ]
    expect(somaValorTotalPedidoLocal(itens)).toBe(150)
  })

  it('valor total do pedido null quando moedas divergentes', () => {
    const itens = [
      item({ valor_total_item: 100, moeda_item: 'USD' }),
      item({ valor_total_item: 50, moeda_item: 'EUR' }),
    ]
    expect(somaValorTotalPedidoLocal(itens)).toBeNull()
  })

  it('quantidade total null quando unidades divergentes', () => {
    const itens = [
      item({ quantidade_inicial_pedido: 10, unidade_comercializada_item: 'UN' }),
      item({ quantidade_inicial_pedido: 5, unidade_comercializada_item: 'CX' }),
    ]
    expect(somaQuantidadeTotalPedidoLocal(itens)).toBeNull()
  })

  it('soma cubagem como unitário × qtd. inicial', () => {
    const itens = [item({ cubagem_unitaria: 1.2, quantidade_inicial_pedido: 50 })]
    expect(somaCubagemItensLista(itens)).toBe(60)
    expect(somaPesoBrutoItensLista([item({ peso_bruto_unitario: 3, quantidade_inicial_pedido: 10 })])).toBe(30)
  })
})
