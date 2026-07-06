import { describe, expect, it } from 'vitest'
import { calcularDataExpiracaoTokenDisparoBidFreteInternacional } from '../../../../servicos-global/produto/bid-frete-internacional/shared/calcular-data-expiracao-token-disparo-bid-frete-internacional.js'

describe('calcularDataExpiracaoTokenDisparoBidFreteInternacional', () => {
  it('retorna a mesma data limite da cotacao', () => {
    const limite = new Date('2026-08-08T23:59:00.000Z')
    const r = calcularDataExpiracaoTokenDisparoBidFreteInternacional(limite)
    expect(r.getTime()).toBe(limite.getTime())
  })

  it('falha quando prazo ausente', () => {
    expect(() => calcularDataExpiracaoTokenDisparoBidFreteInternacional(null)).toThrow(
      /obrigatoria/i,
    )
  })
})
