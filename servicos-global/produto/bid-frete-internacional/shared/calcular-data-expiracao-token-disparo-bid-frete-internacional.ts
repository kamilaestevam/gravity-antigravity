/** Prazo padrão do link público quando a cotação não tem data limite de resposta. */
export const DIAS_EXPIRACAO_TOKEN_DISPARO_SEM_PRAZO_RESPOSTA_BID_FRETE_INTERNACIONAL = 360

const MS_POR_DIA = 24 * 60 * 60 * 1000

/**
 * Calcula `data_expiracao_token_disparo_cotacao_bid_frete_internacional` no disparo.
 * Com prazo de resposta → expira na mesma data (fim do prazo).
 * Sem prazo → expira em 360 dias (link de longa duração, não 7 dias fixos).
 */
export function calcularDataExpiracaoTokenDisparoBidFreteInternacional(
  data_limite_resposta_cotacao_bid_frete_internacional: Date | string | null | undefined,
  agora: Date = new Date(),
): Date {
  if (
    data_limite_resposta_cotacao_bid_frete_internacional != null
    && String(data_limite_resposta_cotacao_bid_frete_internacional).trim() !== ''
  ) {
    const limite = data_limite_resposta_cotacao_bid_frete_internacional instanceof Date
      ? new Date(data_limite_resposta_cotacao_bid_frete_internacional.getTime())
      : new Date(data_limite_resposta_cotacao_bid_frete_internacional)
    if (!Number.isNaN(limite.getTime())) {
      return limite
    }
  }

  return new Date(
    agora.getTime()
      + DIAS_EXPIRACAO_TOKEN_DISPARO_SEM_PRAZO_RESPOSTA_BID_FRETE_INTERNACIONAL * MS_POR_DIA,
  )
}
