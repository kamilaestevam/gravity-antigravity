import type { Cotacao } from './types'

export interface CotacaoAcimaMetaDetalhe {
  id: string
  numero: string
  meta: number
  moeda: string
  valorReferencia: number
  percentualAcima: number
}

/** Valor usado para comparar com a meta (proposta aprovada ou melhor proposta recebida). */
export function obterValorComparacaoMeta(cotacao: Cotacao): number | null {
  const propostas = cotacao.propostas_bid_frete_internacional ?? []
  const aprovada = propostas.find(p => p.status_proposta_bid_frete_internacional === 'APROVADA')
  if (aprovada?.valor_total_proposta_bid_frete_internacional != null) {
    const v = Number(aprovada.valor_total_proposta_bid_frete_internacional)
    return Number.isFinite(v) && v > 0 ? v : null
  }

  if (cotacao.valor_aprovado_ganho_bid_frete_internacional != null) {
    const v = Number(cotacao.valor_aprovado_ganho_bid_frete_internacional)
    return Number.isFinite(v) && v > 0 ? v : null
  }

  if (propostas.length === 0) return null

  const valores = propostas
    .map(p => Number(p.valor_total_proposta_bid_frete_internacional))
    .filter(v => Number.isFinite(v) && v > 0)

  if (valores.length === 0) return null
  return Math.min(...valores)
}

export function cotacaoTemMetaAvaliavel(cotacao: Cotacao): boolean {
  const meta = cotacao.valor_meta_cotacao_bid_frete_internacional
  if (meta == null || meta <= 0) return false
  return obterValorComparacaoMeta(cotacao) != null
}

export function analisarCotacaoAcimaMeta(cotacao: Cotacao): CotacaoAcimaMetaDetalhe | null {
  const meta = cotacao.valor_meta_cotacao_bid_frete_internacional
  if (meta == null || meta <= 0) return null

  const valorReferencia = obterValorComparacaoMeta(cotacao)
  if (valorReferencia == null || valorReferencia <= meta) return null

  return {
    id: cotacao.id_cotacao_bid_frete_internacional,
    numero: cotacao.numero_cotacao_bid_frete_internacional,
    meta,
    moeda: cotacao.moeda_meta_cotacao_bid_frete_internacional ?? 'USD',
    valorReferencia,
    percentualAcima: ((valorReferencia - meta) / meta) * 100,
  }
}

export interface MetricasCotacoesAcimaMeta {
  quantidade: number
  percentualMedioAcima: number | null
  percentualDoTotalComMeta: number | null
  totalComMetaAvaliavel: number
  detalhes: CotacaoAcimaMetaDetalhe[]
}

export function calcularMetricasCotacoesAcimaMeta(cotacoes: Cotacao[]): MetricasCotacoesAcimaMeta {
  const totalComMetaAvaliavel = cotacoes.filter(cotacaoTemMetaAvaliavel).length
  const detalhes = cotacoes
    .map(analisarCotacaoAcimaMeta)
    .filter((item): item is CotacaoAcimaMetaDetalhe => item != null)
    .sort((a, b) => b.percentualAcima - a.percentualAcima)

  const quantidade = detalhes.length
  const percentualMedioAcima = quantidade > 0
    ? detalhes.reduce((acc, item) => acc + item.percentualAcima, 0) / quantidade
    : null
  const percentualDoTotalComMeta = totalComMetaAvaliavel > 0
    ? (quantidade / totalComMetaAvaliavel) * 100
    : null

  return {
    quantidade,
    percentualMedioAcima,
    percentualDoTotalComMeta,
    totalComMetaAvaliavel,
    detalhes,
  }
}
