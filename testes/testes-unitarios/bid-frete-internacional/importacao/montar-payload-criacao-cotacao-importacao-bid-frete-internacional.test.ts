/// <reference types="vitest/globals" />

import { montarPayloadCriacaoCotacaoImportacaoBidFreteInternacional } from '../../../../servicos-global/produto/bid-frete-internacional/shared/montar-payload-criacao-cotacao-importacao-bid-frete-internacional'
import { normalizarLinhaImportacaoBid } from '../../../../servicos-global/produto/bid-frete-internacional/shared/normalizar-valor-importacao-bid-frete-internacional'
import { LINHA_EXEMPLO_TEMPLATE_IMPORTACAO_BID } from '../../../../servicos-global/produto/bid-frete-internacional/shared/parsear-planilha-importacao-bid-frete-internacional'
import type { ContextoCatalogoRota } from '../../../../servicos-global/produto/bid-frete-internacional/shared/rota-cotacao-bid-frete-internacional'
import { validarLinhaImportacaoBidFreteInternacional } from '../../../../servicos-global/produto/bid-frete-internacional/shared/validar-linha-importacao-bid-frete-internacional'

const CTX_CADASTROS: ContextoCatalogoRota = {
  portos: [
    {
      codigo_unlocode_porto: 'CNSHA',
      nome_porto: 'Shanghai',
      codigo_pais_porto: 'CN',
    },
    {
      codigo_unlocode_porto: 'BRSSZ',
      nome_porto: 'Santos',
      codigo_pais_porto: 'BR',
    },
  ],
  aeroportos: [],
}

describe('montar-payload-criacao-cotacao-importacao-bid-frete-internacional', () => {
  const linhaNormalizada = normalizarLinhaImportacaoBid(LINHA_EXEMPLO_TEMPLATE_IMPORTACAO_BID)

  it('deriva rota a partir de porto/aeroporto do template Gravity (não origem_codigo legado)', () => {
    const payload = montarPayloadCriacaoCotacaoImportacaoBidFreteInternacional(linhaNormalizada, undefined, CTX_CADASTROS)

    expect(payload.porto_origem_cotacao_bid_frete_internacional).toBe('BRSSZ')
    expect(payload.porto_destino_cotacao_bid_frete_internacional).toBe('CNSHA')
    expect(payload.origem_codigo_cotacao_bid_frete_internacional).toBe('BRSSZ')
    expect(payload.destino_codigo_cotacao_bid_frete_internacional).toBe('CNSHA')
  })

  it('preenche país de origem e destino (nunca string vazia)', () => {
    const payload = montarPayloadCriacaoCotacaoImportacaoBidFreteInternacional(linhaNormalizada, undefined, CTX_CADASTROS)

    expect(payload.origem_pais_cotacao_bid_frete_internacional).toBe('BR')
    expect(payload.destino_pais_cotacao_bid_frete_internacional).toBe('CN')
  })

  it('linha exemplo passa validação com países derivados', () => {
    const erros = validarLinhaImportacaoBidFreteInternacional(linhaNormalizada, CTX_CADASTROS)
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
    }, CTX_CADASTROS)

    expect(erros).toContain('origem obrigatoria')
    expect(erros).toContain('destino obrigatorio')
    expect(erros).toContain('origem_pais obrigatorio')
    expect(erros).toContain('destino_pais obrigatorio')
  })

  it('não infere SH/SA a partir de nomes livres de porto — rejeita ou resolve via catálogo', () => {
    const linhaNomesLivres = normalizarLinhaImportacaoBid({
      ...LINHA_EXEMPLO_TEMPLATE_IMPORTACAO_BID,
      porto_origem_cotacao_bid_frete_internacional: 'shangai',
      porto_destino_cotacao_bid_frete_internacional: 'santos',
      origem_pais_cotacao_bid_frete_internacional: '',
      destino_pais_cotacao_bid_frete_internacional: '',
    })

    const payloadSemCatalogo = montarPayloadCriacaoCotacaoImportacaoBidFreteInternacional(linhaNomesLivres)
    expect(payloadSemCatalogo.origem_pais_cotacao_bid_frete_internacional).toBe('')
    expect(payloadSemCatalogo.destino_pais_cotacao_bid_frete_internacional).toBe('')

    const payloadComCatalogo = montarPayloadCriacaoCotacaoImportacaoBidFreteInternacional(
      linhaNomesLivres,
      undefined,
      CTX_CADASTROS,
    )
    expect(payloadComCatalogo.porto_destino_cotacao_bid_frete_internacional).toBe('BRSSZ')
    expect(payloadComCatalogo.destino_pais_cotacao_bid_frete_internacional).toBe('BR')

    const erros = validarLinhaImportacaoBidFreteInternacional(linhaNomesLivres, CTX_CADASTROS)
    expect(erros).toContain('porto_origem invalido')
    expect(erros).not.toContain('destino_pais obrigatorio')
  })

  it('resolve porto pelo nome exato quando digitado corretamente', () => {
    const linha = normalizarLinhaImportacaoBid({
      ...LINHA_EXEMPLO_TEMPLATE_IMPORTACAO_BID,
      porto_origem_cotacao_bid_frete_internacional: 'Shanghai',
      porto_destino_cotacao_bid_frete_internacional: 'Santos',
      origem_pais_cotacao_bid_frete_internacional: '',
      destino_pais_cotacao_bid_frete_internacional: '',
    })

    const payload = montarPayloadCriacaoCotacaoImportacaoBidFreteInternacional(linha, undefined, CTX_CADASTROS)
    expect(payload.porto_origem_cotacao_bid_frete_internacional).toBe('CNSHA')
    expect(payload.porto_destino_cotacao_bid_frete_internacional).toBe('BRSSZ')
    expect(payload.origem_pais_cotacao_bid_frete_internacional).toBe('CN')
    expect(payload.destino_pais_cotacao_bid_frete_internacional).toBe('BR')
  })

  it('usa país explícito da planilha quando porto não resolve país', () => {
    const linha = normalizarLinhaImportacaoBid({
      ...LINHA_EXEMPLO_TEMPLATE_IMPORTACAO_BID,
      porto_origem_cotacao_bid_frete_internacional: 'shangai',
      porto_destino_cotacao_bid_frete_internacional: 'porto-inexistente-xyz',
      origem_pais_cotacao_bid_frete_internacional: 'US — Estados Unidos',
      destino_pais_cotacao_bid_frete_internacional: 'JP — Japão',
    })

    const payload = montarPayloadCriacaoCotacaoImportacaoBidFreteInternacional(linha, undefined, CTX_CADASTROS)
    expect(payload.origem_pais_cotacao_bid_frete_internacional).toBe('US')
    expect(payload.destino_pais_cotacao_bid_frete_internacional).toBe('JP')
  })
})
