import type {
  Cotacao,
  PropostaRankingBidFreteInternacional,
} from './types'

export interface EstadoPosAprovacaoCotacaoBidFreteInternacional {
  cotacao: Cotacao
  propostasRanking: PropostaRankingBidFreteInternacional[]
}

/**
 * Atualiza ranking local após POST /aprovar (API real ou simulação mock).
 * Preserva métricas de ranking quando possível; aplica status APROVADA/REPROVADA.
 */
export function sincronizarRankingPosAprovacao(
  rankingAtual: PropostaRankingBidFreteInternacional[],
  cotAtualizada: Cotacao,
): PropostaRankingBidFreteInternacional[] {
  const propostasCot = cotAtualizada.propostas_bid_frete_internacional ?? []

  if (propostasCot.length === 0 || rankingAtual.length === 0) {
    return rankingAtual
  }

  const statusPorId = new Map(
    propostasCot.map((p) => [p.id_proposta_bid_frete_internacional, p.status_proposta_bid_frete_internacional]),
  )
  const idGanhador = propostasCot.find(
    (p) => p.status_proposta_bid_frete_internacional === 'APROVADA',
  )?.id_proposta_bid_frete_internacional

  const idsRanking = new Set(rankingAtual.map((p) => p.id_proposta_bid_frete_internacional))
  const cotTemTodosIdsRanking = rankingAtual.every((p) =>
    propostasCot.some((c) => c.id_proposta_bid_frete_internacional === p.id_proposta_bid_frete_internacional),
  )
  const cotTemStatusFinal = idGanhador != null

  if (cotTemTodosIdsRanking && cotTemStatusFinal) {
    return rankingAtual.map((p) => {
      const status = statusPorId.get(p.id_proposta_bid_frete_internacional)
      if (status) {
        return { ...p, status_proposta_bid_frete_internacional: status }
      }
      return p
    })
  }

  return rankingAtual.map((p) => {
    const status = statusPorId.get(p.id_proposta_bid_frete_internacional)
    if (status) {
      return { ...p, status_proposta_bid_frete_internacional: status }
    }
    if (
      cotAtualizada.status_cotacao_bid_frete_internacional === 'APROVADA'
      && idGanhador
      && idsRanking.has(p.id_proposta_bid_frete_internacional)
    ) {
      return {
        ...p,
        status_proposta_bid_frete_internacional:
          p.id_proposta_bid_frete_internacional === idGanhador ? 'APROVADA' : 'REPROVADA',
      }
    }
    return p
  })
}

/** Mescla cotação + ranking após aprovação confirmada no modal. */
export function aplicarEstadoPosAprovacaoCotacao(
  cotacaoAtual: Cotacao | null,
  rankingAtual: PropostaRankingBidFreteInternacional[],
  cotAtualizada: Cotacao,
): EstadoPosAprovacaoCotacaoBidFreteInternacional {
  const cotacao = cotacaoAtual != null
    ? { ...cotacaoAtual, ...cotAtualizada }
    : cotAtualizada

  return {
    cotacao,
    propostasRanking: sincronizarRankingPosAprovacao(rankingAtual, cotAtualizada),
  }
}
