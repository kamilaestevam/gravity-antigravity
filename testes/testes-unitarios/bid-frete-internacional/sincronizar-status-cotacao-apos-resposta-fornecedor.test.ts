import { describe, it, expect } from 'vitest'
import {
  resolverStatusCotacaoPosRespostaFornecedor,
} from '../../../servicos-global/produto/bid-frete-internacional/server/src/lib/sincronizar-status-cotacao-apos-resposta-fornecedor-bid-frete-internacional'

describe('resolverStatusCotacaoPosRespostaFornecedor', () => {
  it('passa para AGUARDANDO_APROVACAO com a primeira resposta parcial', () => {
    expect(
      resolverStatusCotacaoPosRespostaFornecedor({
        status_cotacao_bid_frete_internacional: 'ENVIADA_FORNECEDORES',
        total_disparos_respondidos: 1,
      }),
    ).toBe('AGUARDANDO_APROVACAO')
  })

  it('passa para AGUARDANDO_APROVACAO mesmo partindo de EM_COTACAO', () => {
    expect(
      resolverStatusCotacaoPosRespostaFornecedor({
        status_cotacao_bid_frete_internacional: 'EM_COTACAO',
        total_disparos_respondidos: 2,
      }),
    ).toBe('AGUARDANDO_APROVACAO')
  })

  it('nao altera status terminal da cotacao', () => {
    expect(
      resolverStatusCotacaoPosRespostaFornecedor({
        status_cotacao_bid_frete_internacional: 'APROVADA',
        total_disparos_respondidos: 1,
      }),
    ).toBeNull()
  })

  it('nao altera sem respostas', () => {
    expect(
      resolverStatusCotacaoPosRespostaFornecedor({
        status_cotacao_bid_frete_internacional: 'ENVIADA_FORNECEDORES',
        total_disparos_respondidos: 0,
      }),
    ).toBeNull()
  })
})
