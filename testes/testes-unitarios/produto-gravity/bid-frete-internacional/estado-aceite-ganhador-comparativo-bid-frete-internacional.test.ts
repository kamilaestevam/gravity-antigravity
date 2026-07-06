import { describe, it, expect } from 'vitest'
import {
  resolverEstadoAceiteGanhadorComparativoBidFreteInternacional,
  resolverPropostaGanhadoraCotacaoBidFreteInternacional,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/estado-aceite-ganhador-comparativo-bid-frete-internacional.js'

describe('estado-aceite-ganhador-comparativo-bid-frete-internacional', () => {
  const propostas = [
    {
      id_fornecedor_bid_frete_internacional: 'forn-1',
      status_proposta_bid_frete_internacional: 'APROVADA',
      fornecedor_nome: 'DHL',
    },
    {
      id_fornecedor_bid_frete_internacional: 'forn-2',
      status_proposta_bid_frete_internacional: 'REPROVADA',
      fornecedor_nome: 'ABC',
    },
  ]

  it('aguardando aceite quando cotação aprovada e proposta ainda APROVADA', () => {
    expect(
      resolverEstadoAceiteGanhadorComparativoBidFreteInternacional({
        status_cotacao_bid_frete_internacional: 'APROVADA',
        proposta_ganhadora: propostas[0],
      }),
    ).toBe('aguardando_aceite')
  })

  it('aceite confirmado quando proposta APROVACAO_RECEBIDA', () => {
    expect(
      resolverEstadoAceiteGanhadorComparativoBidFreteInternacional({
        status_cotacao_bid_frete_internacional: 'APROVADA',
        proposta_ganhadora: {
          ...propostas[0],
          status_proposta_bid_frete_internacional: 'APROVACAO_RECEBIDA',
          data_aceite_aprovacao_proposta_bid_frete_internacional: '2026-07-06T12:00:00.000Z',
        },
      }),
    ).toBe('aceite_confirmado')
  })

  it('fechada quando cotação FECHADA', () => {
    expect(
      resolverEstadoAceiteGanhadorComparativoBidFreteInternacional({
        status_cotacao_bid_frete_internacional: 'FECHADA',
        proposta_ganhadora: {
          ...propostas[0],
          status_proposta_bid_frete_internacional: 'APROVACAO_RECEBIDA',
        },
      }),
    ).toBe('fechada')
  })

  it('resolve ganhadora por id_fornecedor_vencedor', () => {
    const ganhadora = resolverPropostaGanhadoraCotacaoBidFreteInternacional(propostas, 'forn-1')
    expect(ganhadora?.fornecedor_nome).toBe('DHL')
  })
})
