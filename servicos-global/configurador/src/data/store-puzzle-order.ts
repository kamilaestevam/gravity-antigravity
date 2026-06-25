import { STACK_ORDER } from './product-meta'
import {
  encontrarProdutoNoCatalogoStore,
  slugCatalogoParaPuzzle,
  type CatalogoProdutoStore,
} from './status-produto-store'

/** Ordem do puzzle: STACK_ORDER + produtos do catálogo que ainda não entraram. */
export function ordenarSlugsPuzzleStore(catalogo: readonly CatalogoProdutoStore[]): string[] {
  const vistos = new Set<string>()
  const ordenados: string[] = []

  for (const stackSlug of STACK_ORDER) {
    const produto = encontrarProdutoNoCatalogoStore(stackSlug, catalogo)
    if (!produto) continue
    const exibir = slugCatalogoParaPuzzle(produto.slug)
    if (vistos.has(exibir)) continue
    vistos.add(exibir)
    ordenados.push(exibir)
  }

  for (const item of catalogo) {
    const exibir = slugCatalogoParaPuzzle(item.slug)
    if (vistos.has(exibir)) continue
    vistos.add(exibir)
    ordenados.push(exibir)
  }

  return ordenados
}

/** Catálogo da Store/HUB na mesma ordem do puzzle (STACK_ORDER + extras ao final). */
export function ordenarCatalogoPorStackOrder<T extends CatalogoProdutoStore>(
  catalogo: readonly T[],
): T[] {
  const slugOrder = ordenarSlugsPuzzleStore(catalogo)
  const rank = new Map(slugOrder.map((slug, index) => [slug, index]))
  return [...catalogo].sort((a, b) => {
    const pa = slugCatalogoParaPuzzle(a.slug)
    const pb = slugCatalogoParaPuzzle(b.slug)
    const ia = rank.get(pa) ?? rank.get(a.slug) ?? Number.MAX_SAFE_INTEGER
    const ib = rank.get(pb) ?? rank.get(b.slug) ?? Number.MAX_SAFE_INTEGER
    if (ia !== ib) return ia - ib
    return a.slug.localeCompare(b.slug, 'pt-BR')
  })
}
