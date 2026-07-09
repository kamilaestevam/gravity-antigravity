/**
 * Agregação de status de cotações filhas — SSOT para linha BID (lista) e persistência status_bid.
 * Regras idênticas às do Status Cotação (statusMaisAvancado); Status Cotação em si não é alterado aqui.
 */

export const PRIORIDADE_STATUS_COTACAO_BID_FRETE_INTERNACIONAL = [
  'APROVADA',
  'AGUARDANDO_APROVACAO',
  'EM_COTACAO',
  'ENVIADA_FORNECEDORES',
  'FALTA_INFORMACAO',
  'RASCUNHO',
  'REPROVADA',
  'CANCELADA',
  'EXPIRADA',
  'COTACAO_ALTERADA',
] as const

export type StatusCotacaoAgregadoBidFreteInternacional =
  (typeof PRIORIDADE_STATUS_COTACAO_BID_FRETE_INTERNACIONAL)[number]

export type StatusBidPersistidoBidFreteInternacional =
  | 'RASCUNHO'
  | 'EM_ANDAMENTO'
  | 'PARCIALMENTE_CONCLUIDO'
  | 'CONCLUIDO'
  | 'CANCELADO'

type CotacaoComStatus = {
  status_cotacao_bid_frete_internacional: string
}

export function statusMaisAvancadoCotacoesBidFreteInternacional(
  cotacoes: CotacaoComStatus[],
): StatusCotacaoAgregadoBidFreteInternacional {
  for (const status of PRIORIDADE_STATUS_COTACAO_BID_FRETE_INTERNACIONAL) {
    if (cotacoes.some(c => c.status_cotacao_bid_frete_internacional === status)) {
      return status
    }
  }
  const primeiro = cotacoes[0]?.status_cotacao_bid_frete_internacional
  if (
    primeiro &&
    PRIORIDADE_STATUS_COTACAO_BID_FRETE_INTERNACIONAL.includes(
      primeiro as StatusCotacaoAgregadoBidFreteInternacional,
    )
  ) {
    return primeiro as StatusCotacaoAgregadoBidFreteInternacional
  }
  return 'RASCUNHO'
}

const MAP_STATUS_COTACAO_UNICO_PARA_STATUS_BID: Partial<
  Record<StatusCotacaoAgregadoBidFreteInternacional, StatusBidPersistidoBidFreteInternacional>
> = {
  RASCUNHO: 'RASCUNHO',
  CANCELADA: 'CANCELADO',
  APROVADA: 'CONCLUIDO',
  REPROVADA: 'CONCLUIDO',
  EXPIRADA: 'EM_ANDAMENTO',
  ENVIADA_FORNECEDORES: 'EM_ANDAMENTO',
  EM_COTACAO: 'EM_ANDAMENTO',
  AGUARDANDO_APROVACAO: 'EM_ANDAMENTO',
  FALTA_INFORMACAO: 'EM_ANDAMENTO',
  COTACAO_ALTERADA: 'EM_ANDAMENTO',
}

/** Deriva status_bid persistido a partir das cotações filhas (mesma base do Status Cotação). */
export function resolverStatusBidPersistidoDeCotacoesBidFreteInternacional(
  cotacoes: CotacaoComStatus[],
): StatusBidPersistidoBidFreteInternacional {
  if (cotacoes.length === 0) return 'RASCUNHO'

  const statuses = new Set(cotacoes.map(c => c.status_cotacao_bid_frete_internacional))
  if (statuses.size > 1) return 'PARCIALMENTE_CONCLUIDO'

  const unico = [...statuses][0]
  if (unico === 'CANCELADA') return 'CANCELADO'
  if (unico === 'APROVADA') return 'CONCLUIDO'
  if (unico === 'RASCUNHO') return 'RASCUNHO'

  const mapeado = MAP_STATUS_COTACAO_UNICO_PARA_STATUS_BID[
    unico as StatusCotacaoAgregadoBidFreteInternacional
  ]
  return mapeado ?? 'EM_ANDAMENTO'
}
