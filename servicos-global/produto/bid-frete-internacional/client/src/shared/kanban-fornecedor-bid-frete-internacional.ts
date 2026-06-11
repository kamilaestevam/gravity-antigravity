import type { Cotacao, DisparoCotacaoBidFreteInternacional } from './types'

export type StatusKanbanFornecedorBidFreteInternacional =
  | 'AGUARDANDO_RESPOSTA'
  | 'EM_ANALISE'
  | 'APROVADA'
  | 'REPROVADA'
  | 'EXPIRADA'

const STATUS_PROPOSTA_EM_ANALISE = new Set([
  'RECEBIDA',
  'EM_ANALISE',
  'MELHOR_PRECO',
  'MELHOR_TRANSIT',
  'MELHOR_AVALIACAO',
])

export function colunaKanbanFornecedorBidFrete(
  disparo: DisparoCotacaoBidFreteInternacional,
): StatusKanbanFornecedorBidFreteInternacional {
  if (disparo.status_disparo_cotacao_bid_frete_internacional === 'EXPIRADO') {
    return 'EXPIRADA'
  }

  const proposta = disparo.proposta
  if (proposta) {
    const st = (proposta.status_proposta_bid_frete_internacional ?? '').toUpperCase()
    if (st === 'APROVADA') return 'APROVADA'
    if (st === 'REPROVADA') return 'REPROVADA'
    if (STATUS_PROPOSTA_EM_ANALISE.has(st)) return 'EM_ANALISE'
    return 'EM_ANALISE'
  }

  if (
    disparo.status_disparo_cotacao_bid_frete_internacional === 'RESPONDIDO'
    || disparo.status_disparo_cotacao_bid_frete_internacional === 'VISUALIZADO'
    || disparo.status_disparo_cotacao_bid_frete_internacional === 'ENVIADO'
    || disparo.status_disparo_cotacao_bid_frete_internacional === 'PENDENTE'
  ) {
    return 'AGUARDANDO_RESPOSTA'
  }

  return 'EXPIRADA'
}

export function cotacaoKanbanFromDisparoFornecedor(
  disparo: DisparoCotacaoBidFreteInternacional,
): Cotacao | null {
  const base = disparo.cotacao
  if (!base) return null

  const statusKanban = colunaKanbanFornecedorBidFrete(disparo)
  const propostas = disparo.proposta ? [disparo.proposta] : []

  return {
    ...base,
    status_cotacao_bid_frete_internacional: statusKanban as unknown as Cotacao['status_cotacao_bid_frete_internacional'],
    propostas_bid_frete_internacional: propostas,
    referencia_interna_cotacao_bid_frete_internacional:
      base.referencia_interna_cotacao_bid_frete_internacional
      ?? disparo.id_disparo_cotacao_bid_frete_internacional.slice(0, 8),
  }
}
