import { describe, it, expect } from 'vitest'
import { calcularValorTotalItemPedido } from '../../../servicos-global/produto/processos-core/src/services/valorTotalItemPedido.js'

describe('calcularValorTotalItemPedido', () => {
  it('multiplica unitário × qtd. inicial com 2 casas', () => {
    expect(calcularValorTotalItemPedido(10.555, 100, 2)).toBe(1055.5)
  })

  it('usa default 2 casas quando config é null', () => {
    expect(calcularValorTotalItemPedido(3, 7, null)).toBe(21)
  })

  it('zero quando unitário ou qtd. é zero', () => {
    expect(calcularValorTotalItemPedido(0, 500, 2)).toBe(0)
    expect(calcularValorTotalItemPedido(12.5, 0, 2)).toBe(0)
  })
})
