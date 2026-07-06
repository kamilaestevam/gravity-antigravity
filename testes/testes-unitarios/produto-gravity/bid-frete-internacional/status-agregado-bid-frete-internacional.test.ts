import { describe, expect, it } from 'vitest'
import {
  resolverStatusBidPersistidoDeCotacoesBidFreteInternacional,
  statusMaisAvancadoCotacoesBidFreteInternacional,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/status-agregado-bid-frete-internacional'

describe('status-agregado-bid-frete-internacional', () => {
  it('statusMaisAvancado prioriza APROVADA sobre RASCUNHO', () => {
    expect(
      statusMaisAvancadoCotacoesBidFreteInternacional([
        { status_cotacao_bid_frete_internacional: 'RASCUNHO' },
        { status_cotacao_bid_frete_internacional: 'APROVADA' },
      ]),
    ).toBe('APROVADA')
  })

  it('status_bid persistido fica PARCIALMENTE_CONCLUIDO com statuses mistos', () => {
    expect(
      resolverStatusBidPersistidoDeCotacoesBidFreteInternacional([
        { status_cotacao_bid_frete_internacional: 'RASCUNHO' },
        { status_cotacao_bid_frete_internacional: 'EM_COTACAO' },
      ]),
    ).toBe('PARCIALMENTE_CONCLUIDO')
  })

  it('status_bid persistido mapeia CANCELADA unica para CANCELADO', () => {
    expect(
      resolverStatusBidPersistidoDeCotacoesBidFreteInternacional([
        { status_cotacao_bid_frete_internacional: 'CANCELADA' },
      ]),
    ).toBe('CANCELADO')
  })

  it('status_bid persistido mapeia EM_COTACAO unica para EM_ANDAMENTO', () => {
    expect(
      resolverStatusBidPersistidoDeCotacoesBidFreteInternacional([
        { status_cotacao_bid_frete_internacional: 'EM_COTACAO' },
      ]),
    ).toBe('EM_ANDAMENTO')
  })
})
