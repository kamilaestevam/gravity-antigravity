import { describe, it, expect } from 'vitest'
import { validarLocaisPropostaRespostaBidFreteInternacional } from '../../../../../servicos-global/produto/bid-frete-internacional/server/src/lib/validar-locais-proposta-resposta-bid-frete-internacional.js'
import type { ContextoLocaisOpcionaisCotacaoBidFrete } from '../../../../../servicos-global/produto/bid-frete-internacional/shared/opcao-porto-aeroporto-cotacao-bid-frete-internacional.js'

const ctxComOpcionais: ContextoLocaisOpcionaisCotacaoBidFrete = {
  modal_cotacao_bid_frete_internacional: 'MARITIMO',
  porto_origem_cotacao_bid_frete_internacional: 'BRSSZ',
  porto_destino_cotacao_bid_frete_internacional: 'NLRTM',
  habilitar_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional: true,
  codigos_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional: ['BRPNG'],
  habilitar_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional: false,
  codigos_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional: [],
}

describe('validarLocaisPropostaRespostaBidFreteInternacional', () => {
  it('exige origem quando há opcionais habilitados', () => {
    expect(() => validarLocaisPropostaRespostaBidFreteInternacional(ctxComOpcionais, {})).toThrow(
      /origem utilizado/i,
    )
  })

  it('rejeita código fora das opções elegíveis', () => {
    expect(() => validarLocaisPropostaRespostaBidFreteInternacional(ctxComOpcionais, {
      codigo_porto_aeroporto_origem_proposta_bid_frete_internacional: 'XXXXX',
    })).toThrow(/nao esta entre as opcoes/i)
  })

  it('aceita principal ou opcional elegível', () => {
    expect(() => validarLocaisPropostaRespostaBidFreteInternacional(ctxComOpcionais, {
      codigo_porto_aeroporto_origem_proposta_bid_frete_internacional: 'BRPNG',
    })).not.toThrow()
    expect(() => validarLocaisPropostaRespostaBidFreteInternacional(ctxComOpcionais, {
      codigo_porto_aeroporto_origem_proposta_bid_frete_internacional: 'BRSSZ',
    })).not.toThrow()
  })
})
