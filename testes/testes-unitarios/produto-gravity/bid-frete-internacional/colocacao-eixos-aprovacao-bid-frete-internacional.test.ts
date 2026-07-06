import { describe, it, expect } from 'vitest'
import {
  derivarQuantidadeEscalaPropostaColocacaoEmail,
  formatarValorRotaColocacaoEmail,
  montarEixosColocacaoEmailAprovacaoBidFrete,
  rotuloOrdinalColocacaoEmail,
  type PropostaColocacaoEmailBidFreteInternacional,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/colocacao-eixos-aprovacao-bid-frete-internacional'

const propostas: PropostaColocacaoEmailBidFreteInternacional[] = [
  {
    id_proposta_bid_frete_internacional: 'p1',
    fornecedor_nome: 'DHL',
    valor_total_proposta_bid_frete_internacional: 100,
    valor_frete_proposta_bid_frete_internacional: 90,
    taxas_origem_proposta_bid_frete_internacional: 5,
    taxas_destino_proposta_bid_frete_internacional: 5,
    moeda_proposta_bid_frete_internacional: 'BRL',
    dias_transito_proposta_bid_frete_internacional: 10,
    dias_prazo_pagamento_proposta_bid_frete_internacional: 30,
    quantidade_escala_proposta_bid_frete_internacional: 0,
    quantidade_transbordo_proposta_bid_frete_internacional: 0,
    ranking_geral: 1,
  },
  {
    id_proposta_bid_frete_internacional: 'p2',
    fornecedor_nome: 'ABC',
    valor_total_proposta_bid_frete_internacional: 200,
    valor_frete_proposta_bid_frete_internacional: 180,
    taxas_origem_proposta_bid_frete_internacional: 10,
    taxas_destino_proposta_bid_frete_internacional: 10,
    moeda_proposta_bid_frete_internacional: 'BRL',
    dias_transito_proposta_bid_frete_internacional: 20,
    dias_prazo_pagamento_proposta_bid_frete_internacional: null,
    quantidade_escala_proposta_bid_frete_internacional: 1,
    quantidade_transbordo_proposta_bid_frete_internacional: 0,
    ranking_geral: 2,
  },
]

describe('colocacao-eixos-aprovacao-bid-frete-internacional', () => {
  it('rotuloOrdinalColocacaoEmail formata ordinal', () => {
    expect(rotuloOrdinalColocacaoEmail(2)).toBe('2º')
  })

  it('formatarValorRotaColocacaoEmail retorna Direto ou escalas', () => {
    expect(formatarValorRotaColocacaoEmail(propostas[0])).toBe('Direto')
    expect(formatarValorRotaColocacaoEmail(propostas[1])).toContain('escala')
  })

  it('derivarQuantidadeEscalaPropostaColocacaoEmail lê string numérica', () => {
    expect(
      derivarQuantidadeEscalaPropostaColocacaoEmail({ escalas_proposta_bid_frete_internacional: '2' }),
    ).toBe(2)
  })

  it('montarEixosColocacaoEmail marca melhor no frete total do líder', () => {
    const eixos = montarEixosColocacaoEmailAprovacaoBidFrete(propostas, 'p1')
    const frete = eixos.find((e) => e.id === 'frete_total')
    expect(frete?.melhor).toBe(true)
    expect(frete?.rank).toBe(1)
  })

  it('montarEixosColocacaoEmail perdedor não marca melhor no frete total', () => {
    const eixos = montarEixosColocacaoEmailAprovacaoBidFrete(propostas, 'p2')
    const frete = eixos.find((e) => e.id === 'frete_total')
    expect(frete?.melhor).toBe(false)
    expect(frete?.rank).toBe(2)
  })
})
