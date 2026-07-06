/** Link público e constantes do aceite "Recebi e estou de acordo" (ganhador). */

export const DIAS_VALIDADE_TOKEN_ACEITE_APROVACAO_BID_FRETE_INTERNACIONAL = 30

export const ROTA_PUBLICA_ACEITE_APROVACAO_PROPOSTA_BID_FRETE_INTERNACIONAL =
  'aceite-aprovacao-proposta-bid-frete-internacional/publico'

export function montarLinkAceiteAprovacaoPropostaBidFreteInternacional(
  appUrl: string,
  token: string,
): string {
  const base = appUrl.replace(/\/$/, '')
  return `${base}/bid-frete/${ROTA_PUBLICA_ACEITE_APROVACAO_PROPOSTA_BID_FRETE_INTERNACIONAL}/${token}`
}
