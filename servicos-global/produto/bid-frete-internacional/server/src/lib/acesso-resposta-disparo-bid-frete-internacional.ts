/**
 * Regras de acesso ao formulário de resposta (link público e portal).
 * Fornecedor pode criar ou editar até a cotação/proposta ser aprovada ou reprovada.
 */

export type ModoAcessoRespostaDisparoBidFreteInternacional = 'criar' | 'editar' | 'bloqueado'

export type CodigoBloqueioRespostaDisparoBidFreteInternacional =
  | 'TOKEN_INVALID'
  | 'TOKEN_EXPIRED'
  | 'COTACAO_APROVADA'
  | 'COTACAO_REPROVADA'
  | 'COTACAO_CANCELADA'
  | 'COTACAO_EXPIRADA'
  | 'PROPOSTA_APROVADA'
  | 'PROPOSTA_REPROVADA'
  | 'PRAZO_RESPOSTA_ENCERRADO'

export interface EntradaAcessoRespostaDisparoBidFreteInternacional {
  token_valido: boolean
  token_expirado: boolean
  status_cotacao_bid_frete_internacional: string | null | undefined
  status_proposta_bid_frete_internacional: string | null | undefined
  possui_proposta: boolean
  disparo_respondido: boolean
  data_limite_resposta_cotacao_bid_frete_internacional: Date | string | null | undefined
  agora?: Date
}

export interface ResultadoAcessoRespostaDisparoBidFreteInternacional {
  modo_acesso_resposta_disparo_bid_frete_internacional: ModoAcessoRespostaDisparoBidFreteInternacional
  codigo_bloqueio_resposta_disparo_bid_frete_internacional: CodigoBloqueioRespostaDisparoBidFreteInternacional | null
}

const STATUS_COTACAO_BLOQUEIA: ReadonlySet<string> = new Set([
  'APROVADA',
  'REPROVADA',
  'CANCELADA',
  'EXPIRADA',
])

const STATUS_PROPOSTA_BLOQUEIA: ReadonlySet<string> = new Set(['APROVADA', 'REPROVADA'])

function prazoRespostaEncerrado(
  dataLimite: Date | string | null | undefined,
  agora: Date,
): boolean {
  if (dataLimite == null) return false
  const limite = dataLimite instanceof Date ? dataLimite : new Date(dataLimite)
  if (Number.isNaN(limite.getTime())) return false
  return agora.getTime() > limite.getTime()
}

export function avaliarAcessoRespostaDisparoBidFreteInternacional(
  entrada: EntradaAcessoRespostaDisparoBidFreteInternacional,
): ResultadoAcessoRespostaDisparoBidFreteInternacional {
  const agora = entrada.agora ?? new Date()

  if (!entrada.token_valido) {
    return {
      modo_acesso_resposta_disparo_bid_frete_internacional: 'bloqueado',
      codigo_bloqueio_resposta_disparo_bid_frete_internacional: 'TOKEN_INVALID',
    }
  }

  if (entrada.token_expirado) {
    return {
      modo_acesso_resposta_disparo_bid_frete_internacional: 'bloqueado',
      codigo_bloqueio_resposta_disparo_bid_frete_internacional: 'TOKEN_EXPIRED',
    }
  }

  const statusCotacao = entrada.status_cotacao_bid_frete_internacional ?? null
  if (statusCotacao === 'APROVADA') {
    return bloqueado('COTACAO_APROVADA')
  }
  if (statusCotacao === 'REPROVADA') {
    return bloqueado('COTACAO_REPROVADA')
  }
  if (statusCotacao === 'CANCELADA') {
    return bloqueado('COTACAO_CANCELADA')
  }
  if (statusCotacao === 'EXPIRADA') {
    return bloqueado('COTACAO_EXPIRADA')
  }

  const statusProposta = entrada.status_proposta_bid_frete_internacional ?? null
  if (statusProposta === 'APROVADA') {
    return bloqueado('PROPOSTA_APROVADA')
  }
  if (statusProposta === 'REPROVADA') {
    return bloqueado('PROPOSTA_REPROVADA')
  }

  const jaRespondeu = entrada.possui_proposta || entrada.disparo_respondido
  if (
    !jaRespondeu
    && prazoRespostaEncerrado(entrada.data_limite_resposta_cotacao_bid_frete_internacional, agora)
  ) {
    return bloqueado('PRAZO_RESPOSTA_ENCERRADO')
  }

  if (jaRespondeu) {
    return {
      modo_acesso_resposta_disparo_bid_frete_internacional: 'editar',
      codigo_bloqueio_resposta_disparo_bid_frete_internacional: null,
    }
  }

  return {
    modo_acesso_resposta_disparo_bid_frete_internacional: 'criar',
    codigo_bloqueio_resposta_disparo_bid_frete_internacional: null,
  }
}

function bloqueado(
  codigo: CodigoBloqueioRespostaDisparoBidFreteInternacional,
): ResultadoAcessoRespostaDisparoBidFreteInternacional {
  return {
    modo_acesso_resposta_disparo_bid_frete_internacional: 'bloqueado',
    codigo_bloqueio_resposta_disparo_bid_frete_internacional: codigo,
  }
}

export function exigePropostaExistenteParaSalvar(
  modo: ModoAcessoRespostaDisparoBidFreteInternacional,
): boolean {
  return modo === 'editar'
}
