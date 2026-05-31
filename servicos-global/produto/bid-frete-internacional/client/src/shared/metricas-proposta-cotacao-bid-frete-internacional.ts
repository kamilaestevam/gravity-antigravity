/**
 * Métricas de colocação e comparação entre propostas (detalhe / comparativo).
 */

import type { PropostaBidFreteInternacional, PropostaRankingBidFreteInternacional } from './types'

/** Critérios de exibição na aba Respostas do detalhe da cotação. */
export type CriterioOrdenacaoRespostaDetalhe =
  | 'ranking_geral'
  | 'valor_total_proposta_bid_frete_internacional'
  | 'dias_transito_proposta_bid_frete_internacional'
  | 'rating'
  | 'quantidade_transbordo_proposta_bid_frete_internacional'
  | 'dias_free_time_proposta_bid_frete_internacional'

export interface MetricasExibicaoProposta {
  posicaoGeral: number
  totalPropostas: number
  rankPreco: number
  rankTransito: number
  rankAvaliacao: number
  scoreGeral: number
  percentualVsMelhorPreco: number | null
  percentualVsMedia: number | null
  notaFornecedor: number | null
  tags: string[]
  melhorPreco: number
  mediaPreco: number
}

function percentualDelta(valor: number, referencia: number): number | null {
  if (referencia <= 0) return null
  return ((valor - referencia) / referencia) * 100
}

/** Mescla tags da API com destaques derivados do ranking (preço, trânsito, avaliação). */
function montarTagsExibicaoProposta(
  proposta: PropostaRankingBidFreteInternacional,
  rankPreco: number,
  rankTransito: number,
  rankAvaliacao: number,
): string[] {
  const tags = new Set<string>(proposta.tags ?? [])
  if (rankPreco === 1) tags.add('MELHOR_PRECO')
  if (rankTransito === 1) tags.add('MELHOR_TRANSIT')
  if (rankAvaliacao === 1) tags.add('MELHOR_AVALIACAO')
  return [...tags]
}

export function calcularMetricasPropostas(
  propostas: PropostaRankingBidFreteInternacional[],
): Map<string, MetricasExibicaoProposta> {
  const mapa = new Map<string, MetricasExibicaoProposta>()
  const total = propostas.length
  if (total === 0) return mapa

  const ordenadoScore = [...propostas].sort(
    (a, b) => (a.ranking_geral ?? 999) - (b.ranking_geral ?? 999),
  )
  const melhorPreco = Math.min(
    ...propostas.map((p) => p.valor_total_proposta_bid_frete_internacional),
  )
  const mediaPreco =
    propostas.reduce((acc, p) => acc + p.valor_total_proposta_bid_frete_internacional, 0) / total

  ordenadoScore.forEach((p, idx) => {
    const valor = p.valor_total_proposta_bid_frete_internacional
    const rankPreco = p.classificacao_valor_proposta_bid_frete_internacional ?? idx + 1
    const rankTransito = p.classificacao_transito_proposta_bid_frete_internacional ?? total
    const rankAvaliacao = p.classificacao_avaliacao_proposta_bid_frete_internacional ?? total
    mapa.set(p.id_proposta_bid_frete_internacional, {
      posicaoGeral: idx + 1,
      totalPropostas: total,
      rankPreco,
      rankTransito,
      rankAvaliacao,
      scoreGeral: p.ranking_geral ?? idx + 1,
      percentualVsMelhorPreco:
        total > 1 && valor === melhorPreco ? 0 : percentualDelta(valor, melhorPreco),
      percentualVsMedia: total > 1 ? percentualDelta(valor, mediaPreco) : null,
      notaFornecedor:
        p.nota_global_classificacao_bid_frete_internacional
        ?? p.fornecedor?.nota_global_classificacao_bid_frete_internacional
        ?? null,
      tags: montarTagsExibicaoProposta(p, rankPreco, rankTransito, rankAvaliacao),
      melhorPreco,
      mediaPreco,
    })
  })

  return mapa
}

/** Fallback quando a API de ranking não estiver disponível. */
export function ranquearPropostasLocal(
  propostas: PropostaBidFreteInternacional[],
): PropostaRankingBidFreteInternacional[] {
  if (propostas.length === 0) return []

  const byPreco = [...propostas].sort(
    (a, b) => a.valor_total_proposta_bid_frete_internacional - b.valor_total_proposta_bid_frete_internacional,
  )
  const byTransit = [...propostas].sort(
    (a, b) => a.dias_transito_proposta_bid_frete_internacional - b.dias_transito_proposta_bid_frete_internacional,
  )

  return propostas.map((p) => {
    const rankPreco =
      byPreco.findIndex((x) => x.id_proposta_bid_frete_internacional === p.id_proposta_bid_frete_internacional) + 1
    const rankTransit =
      byTransit.findIndex((x) => x.id_proposta_bid_frete_internacional === p.id_proposta_bid_frete_internacional) + 1
    const rankAvaliacao = 1
    const tags: string[] = []
    if (rankPreco === 1) tags.push('MELHOR_PRECO')
    if (rankTransit === 1) tags.push('MELHOR_TRANSIT')
    if (rankAvaliacao === 1) tags.push('MELHOR_AVALIACAO')

    return {
      ...p,
      ranking_geral: Math.round(rankPreco * 0.4 + rankTransit * 0.3 + rankAvaliacao * 0.3),
      classificacao_valor_proposta_bid_frete_internacional: rankPreco,
      classificacao_transito_proposta_bid_frete_internacional: rankTransit,
      classificacao_avaliacao_proposta_bid_frete_internacional: rankAvaliacao,
      nota_global_classificacao_bid_frete_internacional: null,
      tags,
      fornecedor_nome: p.fornecedor?.nome_fornecedor_bid_frete_internacional,
    }
  }).sort((a, b) => a.ranking_geral - b.ranking_geral)
}

export function mesclarPropostasComRanking(
  propostas: PropostaBidFreteInternacional[],
  ranking: PropostaRankingBidFreteInternacional[],
): PropostaRankingBidFreteInternacional[] {
  if (propostas.length === 0) return []
  if (ranking.length === 0) return ranquearPropostasLocal(propostas)

  const porId = new Map(propostas.map((p) => [p.id_proposta_bid_frete_internacional, p]))
  const mescladas = ranking
    .map((r) => {
      const id = r.id_proposta_bid_frete_internacional
      if (!id) return null
      const base = porId.get(id)
      if (!base) return null
      return { ...base, ...r, id_proposta_bid_frete_internacional: id }
    })
    .filter((p): p is PropostaRankingBidFreteInternacional => p != null)

  if (mescladas.length === 0) return ranquearPropostasLocal(propostas)
  return mescladas
}

export function criterioOrdenacaoAscendentePorPadrao(
  criterio: CriterioOrdenacaoRespostaDetalhe,
): boolean {
  return (
    criterio === 'ranking_geral'
    || criterio === 'valor_total_proposta_bid_frete_internacional'
    || criterio === 'dias_transito_proposta_bid_frete_internacional'
    || criterio === 'quantidade_transbordo_proposta_bid_frete_internacional'
  )
}

export function valorOrdenacaoProposta(
  proposta: PropostaRankingBidFreteInternacional,
  criterio: CriterioOrdenacaoRespostaDetalhe,
): number {
  switch (criterio) {
    case 'ranking_geral':
      return proposta.ranking_geral ?? 999
    case 'valor_total_proposta_bid_frete_internacional':
      return proposta.valor_total_proposta_bid_frete_internacional
    case 'dias_transito_proposta_bid_frete_internacional':
      return proposta.dias_transito_proposta_bid_frete_internacional
    case 'rating':
      return (
        proposta.nota_global_classificacao_bid_frete_internacional
        ?? proposta.fornecedor?.nota_global_classificacao_bid_frete_internacional
        ?? 0
      )
    case 'quantidade_transbordo_proposta_bid_frete_internacional':
      return proposta.quantidade_transbordo_proposta_bid_frete_internacional
    case 'dias_free_time_proposta_bid_frete_internacional':
      return proposta.dias_free_time_proposta_bid_frete_internacional ?? 0
  }
}

export function ordenarPropostasPorCriterio(
  propostas: PropostaRankingBidFreteInternacional[],
  criterio: CriterioOrdenacaoRespostaDetalhe,
  ascendente = criterioOrdenacaoAscendentePorPadrao(criterio),
): PropostaRankingBidFreteInternacional[] {
  return [...propostas].sort((a, b) => {
    const va = valorOrdenacaoProposta(a, criterio)
    const vb = valorOrdenacaoProposta(b, criterio)
    if (va !== vb) return ascendente ? va - vb : vb - va
    return (a.ranking_geral ?? 999) - (b.ranking_geral ?? 999)
  })
}
