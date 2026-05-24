/** Slugs de URL canônicos do BID Frete (Configurador monta em `/bid-frete/*`). */
export const BID_FRETE_URL_SLUGS = ['bid-frete', 'bid-frete-internacional'] as const

/** Slugs de produtos Gravity servidos em `/produto/<slug>/*` ou `/<slug>/*`. */
export const PRODUCT_URL_SLUGS = [...BID_FRETE_URL_SLUGS, 'pedido'] as const

/**
 * Extrai segmentos relativos ao produto a partir do pathname.
 * Suporta `/bid-frete/...`, `/bid-frete-internacional/...` e `/produto/<slug>/...`.
 */
export function resolveRouteKey(
  pathname: string,
  slugs: readonly string[] = PRODUCT_URL_SLUGS,
): string {
  const segments = pathname.split('/').filter(Boolean)
  const produtoIdx = segments.findIndex(s => s === 'produto')
  if (produtoIdx >= 0) {
    return segments.slice(produtoIdx + 2).join('/')
  }
  const slugIdx = segments.findIndex(s => slugs.includes(s))
  if (slugIdx >= 0) {
    return segments.slice(slugIdx + 1).join('/')
  }
  return segments.join('/')
}
