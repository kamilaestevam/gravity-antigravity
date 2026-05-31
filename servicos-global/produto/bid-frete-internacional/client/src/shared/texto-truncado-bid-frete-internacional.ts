/** Mesmo limite da lista BID e da lista Pedido (descrição / texto longo). */
export const LIMITE_TRUNCAR_TEXTO_BID_FRETE_INTERNACIONAL = 50

/** @deprecated use LIMITE_TRUNCAR_TEXTO_BID_FRETE_INTERNACIONAL */
export const LIMITE_TRUNCAR_DESCRICAO_LISTA = LIMITE_TRUNCAR_TEXTO_BID_FRETE_INTERNACIONAL

export function montarTextoTruncadoExibicao(
  texto: string,
  limiteCaracteres: number = LIMITE_TRUNCAR_TEXTO_BID_FRETE_INTERNACIONAL,
): { truncado: boolean; exibicao: string } {
  const valor = texto.trim()
  if (valor.length <= limiteCaracteres) {
    return { truncado: false, exibicao: valor }
  }
  return { truncado: true, exibicao: `${valor.slice(0, limiteCaracteres)}…` }
}
