import { corOficialProdutoDim, corOficialProdutoGravity } from '@nucleo/logo-produtos'

export interface ProdVisualBase {
  color: string
  dim: string
}

/**
 * Resolve visual de card de produto no Hub: mapa explícito (ícone/descrição)
 * + cores sempre do SSOT (PRODUTO_META) quando o slug não está no mapa.
 */
export function resolverProdVisualHub<T extends ProdVisualBase>(
  slug: string,
  map: Record<string, T>,
  fallback: T,
  altKey?: string,
): T {
  const mapped = map[slug] ?? (altKey ? map[altKey] : undefined)
  if (mapped) return mapped
  return {
    ...fallback,
    color: corOficialProdutoGravity(slug),
    dim: corOficialProdutoDim(slug),
  }
}
