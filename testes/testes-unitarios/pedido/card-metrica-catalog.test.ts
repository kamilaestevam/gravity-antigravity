/// <reference types="vitest/globals" />

import {
  encodeMetricaCard,
  decodeMetricaCard,
  isMetricaCard,
} from '../../../servicos-global/produto/pedido/client/src/shared/cardMetricaCatalog.js'

describe('cardMetricaCatalog', () => {
  it('encodeMetricaCard prefixa id do catálogo', () => {
    expect(encodeMetricaCard('pedidos_abertos')).toBe('metric:pedidos_abertos')
  })

  it('decodeMetricaCard lê prefixo metric:', () => {
    expect(decodeMetricaCard('metric:valor_total')).toBe('valor_total')
  })

  it('decodeMetricaCard aceita id puro do catálogo (compat)', () => {
    expect(decodeMetricaCard('qtd_total')).toBe('qtd_total')
  })

  it('decodeMetricaCard rejeita fórmula legada com operadores', () => {
    expect(decodeMetricaCard('valor_total_pedido + valor_total_item')).toBeNull()
  })

  it('isMetricaCard identifica métricas do catálogo', () => {
    expect(isMetricaCard('metric:pedidos_atrasados')).toBe(true)
    expect(isMetricaCard('valor_total_pedido + 1')).toBe(false)
  })
})
