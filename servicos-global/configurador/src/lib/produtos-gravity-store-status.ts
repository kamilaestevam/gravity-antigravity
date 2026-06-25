/**
 * Regras de status de produto Gravity — SSOT com Admin (catálogo) + assinaturas (contratados).
 * Ordem do puzzle: STACK_ORDER em `data/product-meta.ts` (paridade Store + Hub).
 */

import type { TFunction } from 'i18next'
import { ordenarSlugsPuzzleStore } from '../data/store-puzzle-order'

export type StatusProdutoGravityStore = 'owned' | 'available' | 'soon'

export interface CatalogoProdutoGravityMin {
  slug: string
  name: string
  status: string
}

export interface AssinaturaProdutoGravityMin {
  product_key: string
  is_active: boolean
}

const STATUS_CATALOGO_VISIVEL = new Set(['ATIVO', 'Ativo', 'EM_BREVE'])

export function slugCanonicoProdutoGravity(slug: string): string {
  if (slug === 'bid-frete-internacional') return 'bid-frete'
  if (slug === 'nf-import') return 'nf-importacao'
  if (slug === 'smart-read-') return 'smart-read'
  return slug
}

/** Catálogo exibido na Store/HUB: Admin Produtos Gravity ATIVO + EM_BREVE (ordem da API). */
export function filtrarCatalogoProdutosGravityStore<T extends { status: string }>(
  catalogo: T[],
): T[] {
  return catalogo.filter(p => STATUS_CATALOGO_VISIVEL.has(p.status))
}

export function mapaCatalogoPorSlugCanonico<T extends { slug: string; status: string }>(
  catalogo: T[],
): Map<string, T> {
  const map = new Map<string, T>()
  for (const item of catalogo) {
    map.set(item.slug, item)
    map.set(slugCanonicoProdutoGravity(item.slug), item)
  }
  return map
}

export function mapaAssinaturaAtivaPorSlug(
  assinaturas: AssinaturaProdutoGravityMin[],
): Map<string, boolean> {
  const map = new Map<string, boolean>()
  for (const a of assinaturas) {
    if (!a.is_active) continue
    const canon = slugCanonicoProdutoGravity(a.product_key)
    map.set(a.product_key, true)
    map.set(canon, true)
  }
  return map
}

/** Status idêntico à Store: EM_BREVE prevalece; depois assinatura ativa (contratado). */
export function statusProdutoGravityStore(
  slug: string,
  catalogoPorSlug: Map<string, { status: string }>,
  assinaturaAtivaPorSlug: Map<string, boolean>,
): StatusProdutoGravityStore {
  const canon = slugCanonicoProdutoGravity(slug)
  const produto = catalogoPorSlug.get(slug) ?? catalogoPorSlug.get(canon)
  if (produto?.status === 'EM_BREVE') return 'soon'
  if (assinaturaAtivaPorSlug.get(slug) || assinaturaAtivaPorSlug.get(canon)) return 'owned'
  return 'available'
}

/**
 * Slugs do puzzle na ordem fixa STACK_ORDER (SSOT Store + Hub).
 * Um slug canônico por peça (ex.: bid-frete-internacional → bid-frete).
 */
export function slugsPuzzleStackProdutosGravity<T extends { slug: string; status: string }>(
  catalogo: T[],
): string[] {
  const filtrado = filtrarCatalogoProdutosGravityStore(catalogo)
  const ordenados = ordenarSlugsPuzzleStore(filtrado)
  const vistos = new Set<string>()
  const slugs: string[] = []
  for (const slug of ordenados) {
    const canon = slugCanonicoProdutoGravity(slug)
    if (vistos.has(canon)) continue
    vistos.add(canon)
    slugs.push(canon)
  }
  return slugs
}

/** Resolve item do catálogo para exibir peça (slug canônico do stack). */
export function itemCatalogoPorSlugStack<T extends { slug: string }>(
  catalogo: T[],
  slugStack: string,
): T | undefined {
  return catalogo.find(p => slugCanonicoProdutoGravity(p.slug) === slugStack)
}

export function contarProdutosOwnedGravityStore(
  catalogo: CatalogoProdutoGravityMin[],
  assinaturas: AssinaturaProdutoGravityMin[],
): number {
  const catalogoPorSlug = mapaCatalogoPorSlugCanonico(catalogo)
  const assinaturaAtiva = mapaAssinaturaAtivaPorSlug(assinaturas)
  return catalogo.filter(
    p => statusProdutoGravityStore(p.slug, catalogoPorSlug, assinaturaAtiva) === 'owned',
  ).length
}

export function contarOwnedNoStack(
  catalogo: CatalogoProdutoGravityMin[],
  assinaturas: AssinaturaProdutoGravityMin[],
): number {
  const catalogoPorSlug = mapaCatalogoPorSlugCanonico(catalogo)
  const assinaturaAtiva = mapaAssinaturaAtivaPorSlug(assinaturas)
  return slugsPuzzleStackProdutosGravity(catalogo).filter(
    slug => statusProdutoGravityStore(slug, catalogoPorSlug, assinaturaAtiva) === 'owned',
  ).length
}

/** Texto do contador do stack (ex.: "4 DE 5 MÓDULOS ATIVOS") — paridade Store. */
export function rotuloMeterStackProdutos(
  ownedNoStack: number,
  totalStack: number,
  t: TFunction,
): string {
  if (totalStack === 0) return ''
  if (ownedNoStack === 0) return t('store.stack_nenhum')
  if (ownedNoStack === totalStack) return t('store.stack_completo')
  return t('store.stack_parcial', { n: ownedNoStack, total: totalStack })
}
