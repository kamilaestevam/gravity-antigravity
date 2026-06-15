/// <reference types="vitest/globals" />

import { montarPayloadCriacaoCotacaoImportacaoBidFreteInternacional } from '../../../../servicos-global/produto/bid-frete-internacional/shared/montar-payload-criacao-cotacao-importacao-bid-frete-internacional'
import { normalizarLinhaImportacaoBid } from '../../../../servicos-global/produto/bid-frete-internacional/shared/normalizar-valor-importacao-bid-frete-internacional'
import { LINHA_EXEMPLO_TEMPLATE_IMPORTACAO_BID } from '../../../../servicos-global/produto/bid-frete-internacional/shared/parsear-planilha-importacao-bid-frete-internacional'
import { validarLinhaImportacaoBidFreteInternacional } from '../../../../servicos-global/produto/bid-frete-internacional/shared/validar-linha-importacao-bid-frete-internacional'

describe('montar-payload-criacao-cotacao-importacao-bid-frete-internacional', () => {
  const linhaNormalizada = normalizarLinhaImportacaoBid(LINHA_EXEMPLO_TEMPLATE_IMPORTACAO_BID)

  it('deriva rota a partir de porto/aeroporto do template Gravity (não origem_codigo legado)', () => {
    const payload = montarPayloadCriacaoCotacaoImportacaoBidFreteInternacional(linhaNormalizada)

    expect(payload.porto_origem_cotacao_bid_frete_internacional).toBe('BRSSZ')
    expect(payload.porto_destino_cotacao_bid_frete_internacional).toBe('CNSHA')
    expect(payload.origem_codigo_cotacao_bid_frete_internacional).toBe('BRSSZ')
    expect(payload.destino_codigo_cotacao_bid_frete_internacional).toBe('CNSHA')
  })

  it('preenche país de origem e destino (nunca string vazia)', () => {
    const payload = montarPayloadCriacaoCotacaoImportacaoBidFreteInternacional(linhaNormalizada)

    expect(payload.origem_pais_cotacao_bid_frete_internacional).toBe('BR')
    expect(payload.destino_pais_cotacao_bid_frete_internacional).toBe('CN')
  })

  it('linha exemplo passa validação com países derivados', () => {
    const erros = validarLinhaImportacaoBidFreteInternacional(linhaNormalizada)
    expect(erros).toEqual([])
  })

  it('rejeita linha sem país quando rota não deriva pais', () => {
    const erros = validarLinhaImportacaoBidFreteInternacional({
      ...linhaNormalizada,
      porto_origem_cotacao_bid_frete_internacional: '',
      aeroporto_origem_cotacao_bid_frete_internacional: '',
      origem_codigo_cotacao_bid_frete_internacional: '',
      origem_pais_cotacao_bid_frete_internacional: '',
      porto_destino_cotacao_bid_frete_internacional: '',
      aeroporto_destino_cotacao_bid_frete_internacional: '',
      destino_codigo_cotacao_bid_frete_internacional: '',
      destino_pais_cotacao_bid_frete_internacional: '',
    })

    expect(erros).toContain('origem obrigatoria')
    expect(erros).toContain('destino obrigatorio')
    expect(erros).toContain('origem_pais obrigatorio')
    expect(erros).toContain('destino_pais obrigatorio')
  })
})
