/**
 * Resolve a rota canônica do frontend para um slug de produto Gravity.
 * Espelha redirects em configurador/src/App.tsx e SelecionarWorkspace.
 */

/** Entrada padrão do Smart Read — `/smart-read` exato não casa com splat no configurador. */
export const ROTA_ENTRADA_SMART_READ = '/smart-read/lista' as const

const ROTA_CANONICA_POR_SLUG: Record<string, string> = {
  'bid-frete-internacional': '/bid-frete',
  'bid-frete': '/bid-frete',
  'pedidos-de-compra': '/pedido',
  'smart-read': ROTA_ENTRADA_SMART_READ,
  /** Typo legado no catálogo Admin (slug com hífen solto no final). */
  'smart-read-': ROTA_ENTRADA_SMART_READ,
}

/** Slug usado em getProdutoMeta (@nucleo/logo-produtos). */
export function resolverSlugMetaProduto(slug: string): string {
  if (slug === 'bid-frete-internacional') return 'bid-frete'
  if (slug === 'smart-read-') return 'smart-read'
  return slug
}

/** Compara slugs equivalentes (ex.: bid-frete ↔ bid-frete-internacional, smart-read ↔ smart-read-). */
export function slugsProdutoEquivalentes(a: string, b: string): boolean {
  return resolverSlugMetaProduto(a) === resolverSlugMetaProduto(b)
}

export function resolverRotaProdutoGravity(slug: string): string {
  const canon = resolverSlugMetaProduto(slug)
  return ROTA_CANONICA_POR_SLUG[slug] ?? ROTA_CANONICA_POR_SLUG[canon] ?? `/${canon}`
}
