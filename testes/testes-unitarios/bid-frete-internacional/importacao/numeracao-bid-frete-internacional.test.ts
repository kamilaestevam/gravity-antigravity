/// <reference types="vitest/globals" />

import {
  gerarNumeroBidFreteInternacional,
  gerarNumeroCotacaoFreteInternacional,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/numeracao-bid-frete-internacional'

describe('numeracao-bid-frete-internacional', () => {
  it('gera prefixo COT- para cotação individual', () => {
    const numero = gerarNumeroCotacaoFreteInternacional()
    expect(numero).toMatch(/^COT-\d{8}-\d{4}$/)
  })

  it('gera prefixo BID- para agrupador', () => {
    const numero = gerarNumeroBidFreteInternacional()
    expect(numero).toMatch(/^BID-\d{8}-\d{4}$/)
  })

  it('não mistura prefixos entre funções', () => {
    expect(gerarNumeroCotacaoFreteInternacional()).toContain('COT-')
    expect(gerarNumeroBidFreteInternacional()).toContain('BID-')
    expect(gerarNumeroCotacaoFreteInternacional()).not.toContain('BID-')
  })
})
