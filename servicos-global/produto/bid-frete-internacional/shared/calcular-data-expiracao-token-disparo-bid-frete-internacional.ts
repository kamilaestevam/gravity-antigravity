/**
 * Expiração do link público de resposta — alinhada ao prazo de resposta da cotação (obrigatório).
 */
export function calcularDataExpiracaoTokenDisparoBidFreteInternacional(
  dataLimiteResposta: Date | string | null | undefined,
): Date {
  if (dataLimiteResposta == null || String(dataLimiteResposta).trim() === '') {
    throw new Error(
      'data_limite_resposta_cotacao_bid_frete_internacional obrigatoria para expiracao do token',
    )
  }
  const limite = dataLimiteResposta instanceof Date
    ? new Date(dataLimiteResposta.getTime())
    : new Date(dataLimiteResposta)
  if (Number.isNaN(limite.getTime())) {
    throw new Error('data_limite_resposta_cotacao_bid_frete_internacional invalida')
  }
  return limite
}
