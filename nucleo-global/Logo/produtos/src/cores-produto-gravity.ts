/**
 * Cores oficiais dos produtos Gravity — SSOT em PRODUTO_META (design system cores.html).
 * Use em Hub (/core), Store, SelecionarWorkspace e demais cards de produto.
 */
import { PRODUTO_META } from './LogoProdutoGlobal'

/** Slugs legados ou alias de product_key → slug canônico em PRODUTO_META */
const SLUG_ALIASES: Record<string, string> = {
  'bid-frete-internacional': 'bid-frete',
  'nf-import': 'nf-importacao',
}

export function resolverSlugProdutoGravity(slug: string): string {
  return SLUG_ALIASES[slug] ?? slug
}

/** Produtos com cor oficial na Store mas sem entrada em PRODUTO_META (logos) */
const CORES_PRODUTO_EXTRAS: Record<string, string> = {
  'smart-data': '#38bdf8',
  'smart-transito': '#4ade80',
  'duimp': '#e879f9',
  'catalogo-produto': '#fb923c',
}

/** Cor de destaque hexadecimal (#RRGGBB) do produto */
export function corOficialProdutoGravity(slug: string): string {
  const key = resolverSlugProdutoGravity(slug)
  return PRODUTO_META[key]?.color ?? CORES_PRODUTO_EXTRAS[key] ?? '#818cf8'
}

/** Fundo suave para ícones/cards (padrão design system: ~12% opacidade) */
export function corOficialProdutoDim(slug: string, alpha = 0.12): string {
  const hex = corOficialProdutoGravity(slug)
  const h = hex.replace('#', '')
  if (h.length !== 6) return `rgba(129,140,248,${alpha})`
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
