import type { PropostaRankingBidFreteInternacional } from './types'

/** IDs gerados por mock-respostas-cotacao-APAGAR-ANTES-COMMIT.ts — não existem no banco. */
export function isPropostaRespostaDemonstracao(
  proposta: Pick<
    PropostaRankingBidFreteInternacional,
    'id_proposta_bid_frete_internacional' | 'id_disparo_cotacao_bid_frete_internacional'
  >,
): boolean {
  return proposta.id_proposta_bid_frete_internacional.startsWith('mock-resposta-temp-')
    || (proposta.id_disparo_cotacao_bid_frete_internacional?.startsWith('mock-disparo-temp-') ?? false)
}

export function propostaPermiteAprovacaoReal(
  proposta: PropostaRankingBidFreteInternacional,
): boolean {
  if (isPropostaRespostaDemonstracao(proposta)) return false
  const status = proposta.status_proposta_bid_frete_internacional
  return status !== 'APROVADA' && status !== 'REPROVADA'
}
