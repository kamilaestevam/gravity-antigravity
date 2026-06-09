import { describe, expect, it } from 'vitest'
import {
  calcularMoedaCambioDivergente,
  referenciaMoedaComercialPedido,
} from '../../../servicos-global/produto/pedido/shared/pedidoDivergencias'

describe('calcularMoedaCambioDivergente', () => {
  it('sem moeda_pedido canônica — sem alerta na linha pedido', () => {
    expect(calcularMoedaCambioDivergente(
      [{ moeda_item: 'BRL' }],
      { moeda_cambio_pedido: 'USD' },
    )).toBe(false)
  })

  it('moeda_pedido igual em todos os itens — sem alerta', () => {
    expect(calcularMoedaCambioDivergente(
      [{ moeda_item: 'USD' }, { moeda_item: 'USD' }],
      { moeda_pedido: 'USD', moeda_cambio_pedido: 'USD' },
    )).toBe(false)
  })

  it('algum item com moeda_item diferente de moeda_pedido — alerta', () => {
    expect(calcularMoedaCambioDivergente(
      [{ moeda_item: 'USD' }, { moeda_item: 'BRL' }],
      { moeda_pedido: 'USD', moeda_cambio_pedido: 'USD' },
    )).toBe(true)
  })

  it('item sem moeda_item preenchida — não conta como divergência', () => {
    expect(calcularMoedaCambioDivergente(
      [{ moeda_item: 'USD' }, { moeda_item: null }],
      { moeda_pedido: 'USD' },
    )).toBe(false)
  })
})

describe('referenciaMoedaComercialPedido', () => {
  it('prioriza moeda_pedido sobre moeda_cambio', () => {
    expect(referenciaMoedaComercialPedido({ moeda_pedido: 'EUR', moeda_cambio_pedido: 'USD' })).toBe('EUR')
  })
})
