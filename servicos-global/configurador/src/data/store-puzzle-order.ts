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
