import { describe, it, expect } from 'vitest'
import {
  aplicarEstadoPosAprovacaoCotacao,
  sincronizarRankingPosAprovacao,
} from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/sincronizar-estado-pos-aprovacao-cotacao-bid-frete-internacional'
import type {
  Cotacao,
  PropostaRankingBidFreteInternacional,
} from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/types'

function propostaMock(
  id: string,
  status: PropostaRankingBidFreteInternacional['status_proposta_bid_frete_internacional'] = 'ENVIADA',
): PropostaRankingBidFreteInternacional {
  return {
    id_proposta_bid_frete_internacional: id,
    id_cotacao_bid_frete_internacional: 'cot-1',
    id_organizacao: 'org-1',
    id_fornecedor_bid_frete_internacional: `forn-${id}`,
    moeda_proposta_bid_frete_internacional: 'USD',
    valor_frete_proposta_bid_frete_internacional: 500,
    taxas_origem_proposta_bid_frete_internacional: 50,
    taxas_destino_proposta_bid_frete_internacional: 50,
    valor_total_proposta_bid_frete_internacional: 600,
    dias_transito_proposta_bid_frete_internacional: 20,
    dias_free_time_proposta_bid_frete_internacional: 7,
    quantidade_transbordo_proposta_bid_frete_internacional: 0,
    quantidade_escala_proposta_bid_frete_internacional: 0,
    validade_proposta_bid_frete_internacional: '2026-06-30T00:00:00.000Z',
    observacoes_proposta_bid_frete_internacional: null,
    status_proposta_bid_frete_internacional: status,
    ranking_geral: 1,
    data_criacao_proposta_bid_frete_internacional: '2026-05-01T00:00:00.000Z',
    data_atualizacao_proposta_bid_frete_internacional: '2026-05-01T00:00:00.000Z',
  }
}

function cotacaoMock(
  propostas: PropostaRankingBidFreteInternacional[],
  status: Cotacao['status_cotacao_bid_frete_internacional'] = 'APROVADA',
): Cotacao {
  return {
    id_cotacao_bid_frete_internacional: 'cot-1',
    id_organizacao: 'org-1',
    numero_cotacao_bid_frete_internacional: 'BF-001',
    status_cotacao_bid_frete_internacional: status,
    propostas_bid_frete_internacional: propostas,
  } as Cotacao
}

describe('sincronizarRankingPosAprovacao', () => {
  it('aplica status APROVADA/REPROVADA quando a cotação retorna propostas completas', () => {
    const ranking = [propostaMock('p1'), propostaMock('p2'), propostaMock('p3')]
    const cotAtualizada = cotacaoMock([
      { ...propostaMock('p1'), status_proposta_bid_frete_internacional: 'APROVADA' },
      { ...propostaMock('p2'), status_proposta_bid_frete_internacional: 'REPROVADA' },
      { ...propostaMock('p3'), status_proposta_bid_frete_internacional: 'REPROVADA' },
    ])

    const resultado = sincronizarRankingPosAprovacao(ranking, cotAtualizada)

    expect(resultado.map((p) => p.status_proposta_bid_frete_internacional)).toEqual([
      'APROVADA',
      'REPROVADA',
      'REPROVADA',
    ])
    expect(resultado[0]?.ranking_geral).toBe(1)
  })

  it('infere reprovadas quando a API só informa o ganhador e status APROVADA da cotação', () => {
    const ranking = [propostaMock('p1'), propostaMock('p2')]
    const cotAtualizada = cotacaoMock([
      { ...propostaMock('p2'), status_proposta_bid_frete_internacional: 'APROVADA' },
    ])

    const resultado = sincronizarRankingPosAprovacao(ranking, cotAtualizada)

    expect(resultado.find((p) => p.id_proposta_bid_frete_internacional === 'p1')?.status_proposta_bid_frete_internacional).toBe('REPROVADA')
    expect(resultado.find((p) => p.id_proposta_bid_frete_internacional === 'p2')?.status_proposta_bid_frete_internacional).toBe('APROVADA')
  })
})

describe('aplicarEstadoPosAprovacaoCotacao', () => {
  it('mescla cotação e ranking após aprovação', () => {
    const cotacaoAtual = cotacaoMock([], 'AGUARDANDO_APROVACAO')
    const ranking = [propostaMock('p1'), propostaMock('p2')]
    const cotAtualizada = cotacaoMock([
      { ...propostaMock('p1'), status_proposta_bid_frete_internacional: 'APROVADA' },
      { ...propostaMock('p2'), status_proposta_bid_frete_internacional: 'REPROVADA' },
    ], 'APROVADA')

    const { cotacao, propostasRanking } = aplicarEstadoPosAprovacaoCotacao(
      cotacaoAtual,
      ranking,
      cotAtualizada,
    )

    expect(cotacao.status_cotacao_bid_frete_internacional).toBe('APROVADA')
    expect(propostasRanking.map((p) => p.status_proposta_bid_frete_internacional)).toEqual([
      'APROVADA',
      'REPROVADA',
    ])
  })
})
