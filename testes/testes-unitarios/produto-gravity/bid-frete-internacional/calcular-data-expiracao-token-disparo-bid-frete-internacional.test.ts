import { describe, it, expect } from 'vitest'
import {
  calcularDataExpiracaoTokenDisparoBidFreteInternacional,
  DIAS_EXPIRACAO_TOKEN_DISPARO_SEM_PRAZO_RESPOSTA_BID_FRETE_INTERNACIONAL,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/calcular-data-expiracao-token-disparo-bid-frete-internacional'

describe('calcularDataExpiracaoTokenDisparoBidFreteInternacional', () => {
  const agora = new Date('2026-07-05T12:00:00.000Z')

  it('usa a data limite de resposta quando informada', () => {
    const limite = '2026-08-08T23:59:59.000Z'
    expect(calcularDataExpiracaoTokenDisparoBidFreteInternacional(limite, agora).toISOString())
      .toBe(new Date(limite).toISOString())
  })

  it('sem prazo de resposta expira em 360 dias', () => {
    const expira = calcularDataExpiracaoTokenDisparoBidFreteInternacional(null, agora)
    const esperado = new Date(
      agora.getTime()
        + DIAS_EXPIRACAO_TOKEN_DISPARO_SEM_PRAZO_RESPOSTA_BID_FRETE_INTERNACIONAL * 24 * 60 * 60 * 1000,
    )
    expect(expira.toISOString()).toBe(esperado.toISOString())
  })

  it('ignora prazo inválido e cai no fallback de 360 dias', () => {
    const expira = calcularDataExpiracaoTokenDisparoBidFreteInternacional('data-invalida', agora)
    expect(expira.getTime()).toBeGreaterThan(agora.getTime())
  })
})
