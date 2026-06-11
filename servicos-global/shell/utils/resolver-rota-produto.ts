/**
 * Resolve a rota canônica do frontend para um slug de produto Gravity.
 * Espelha redirects em configurador/src/App.tsx e SelecionarWorkspace.
 */

const ROTA_CANONICA_POR_SLUG: Record<string, string> = {
  'bid-frete-internacional': '/bid-frete',
  'bid-frete': '/bid-frete',
  'pedidos-de-compra': '/pedido',
  'smart-read': '/smart-read',
}

/** Slug usado em getProdutoMeta (@nucleo/logo-produtos). */
export function resolverSlugMetaProduto(slug: string): string {
  if (slug === 'bid-frete-internacional') return 'bid-frete'
  return slug
}

/** Compara slugs equivalentes (ex.: bid-frete ↔ bid-frete-internacional). */
export function slugsProdutoEquivalentes(a: string, b: string): boolean {
  if (a === b) return true
  const parBidFrete = new Set(['bid-frete', 'bid-frete-internacional'])
  return parBidFrete.has(a) && parBidFrete.has(b)
}

export function resolverRotaProdutoGravity(slug: string): string {
  return ROTA_CANONICA_POR_SLUG[slug] ?? `/${slug}`
}
