import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Lightning } from '@phosphor-icons/react'
import { StorePuzzleCarousel } from './store-puzzle-carousel'
import { StoreProductCard, type StoreCardProduct } from './store-product-card'
import {
  resolverStatusProdutoStore,
  type AssinaturaProdutoStore,
  type CatalogoProdutoStore,
  type StatusExibicaoProdutoStore,
} from '../data/status-produto-store'
import { metaProdutoStore } from '../data/product-meta'

/** Ordem visual dos carrosséis (menu segmentado permanece na toolbar). */
export const LINHAS_STORE = [
  { key: 'assinar', tituloKey: 'store.secao_assinar', carouselClass: 'gs-cards-carousel--assinar' },
  { key: 'ativo', tituloKey: 'store.secao_ativo', carouselClass: 'gs-cards-carousel--ativo' },
  { key: 'em_breve', tituloKey: 'store.secao_em_breve', carouselClass: 'gs-cards-carousel--em-breve' },
  { key: 'todos', tituloKey: 'store.secao_todos', carouselClass: '' },
] as const

export type StoreLinhaKey = (typeof LINHAS_STORE)[number]['key']

export function idSecaoStoreLinha(linha: StoreLinhaKey): string {
  return `store-linha-${linha}`
}

type LinhaKey = StoreLinhaKey

type Props = {
  /** Catálogo completo (combina com / status). */
  catalog: readonly CatalogoProdutoStore[]
  /** Após busca e categoria. */
  catalogoFiltrado: readonly StoreCardProduct[]
  assinaturas: ReadonlyMap<string, AssinaturaProdutoStore>
  podeContratar: boolean
  subscribing: string | null
  onSubscribe: (slug: string) => void
  pulseDelayFor: (slug: string) => string
}

function filtrarPorLinhaComCatalogo(
  catalog: readonly CatalogoProdutoStore[],
  itens: readonly StoreCardProduct[],
  assinaturas: ReadonlyMap<string, AssinaturaProdutoStore>,
  linha: LinhaKey,
): StoreCardProduct[] {
  if (linha === 'todos') return [...itens]
  const statusAlvo: StatusExibicaoProdutoStore =
    linha === 'ativo' ? 'contratado' :
    linha === 'assinar' ? 'disponivel' :
    'em_breve'
  return itens.filter(
    (p) => resolverStatusProdutoStore(p.slug, catalog, assinaturas) === statusAlvo,
  )
}

export function StoreCardsRows({
  catalog,
  catalogoFiltrado,
  assinaturas,
  podeContratar,
  subscribing,
  onSubscribe,
  pulseDelayFor,
}: Props) {
  const { t } = useTranslation()

  const linhas = useMemo(() => {
    const map = {} as Record<LinhaKey, StoreCardProduct[]>
    for (const def of LINHAS_STORE) {
      map[def.key] = filtrarPorLinhaComCatalogo(catalog, catalogoFiltrado, assinaturas, def.key)
    }
    return map
  }, [catalog, catalogoFiltrado, assinaturas])

  const temAlgumaLinha = LINHAS_STORE.some((def) => linhas[def.key].length > 0)

  if (!temAlgumaLinha) {
    return (
      <p className="gs-cards-rows__empty">{t('store.catalogo_vazio_filtro')}</p>
    )
  }

  return (
    <div className="gs-cards-rows">
      {LINHAS_STORE.map((def) => {
        const itens = linhas[def.key]
        if (itens.length === 0) return null
        return (
          <section
            key={def.key}
            id={idSecaoStoreLinha(def.key)}
            className={`gs-cards-row gs-cards-row--${def.key}`}
          >
            <div className="gs-section-label gs-cards-row__label">
              <span>
                {def.key === 'em_breve' && (
                  <Lightning weight="fill" size={12} className="gs-cards-row__icon-soon" />
                )}
                {t(def.tituloKey, { count: itens.length })}
              </span>
            </div>
            <StorePuzzleCarousel className={`gs-cards-carousel ${def.carouselClass}`.trim()}>
              {itens.map((p, idx) => {
                const delayClass = idx < 6 ? `hs-fade-up-d${Math.min(idx + 1, 4)}` : ''
                return (
                  <StoreProductCard
                    key={p.id}
                    produto={p}
                    catalog={catalog}
                    assinaturas={assinaturas}
                    podeContratar={podeContratar}
                    subscribing={subscribing}
                    onSubscribe={onSubscribe}
                    pulseDelay={pulseDelayFor(p.slug)}
                    animDelayClass={delayClass}
                  />
                )
              })}
            </StorePuzzleCarousel>
          </section>
        )
      })}
    </div>
  )
}

/** Busca + categoria (sem filtro de aba). */
export function filtrarCatalogoStoreBusca(
  catalog: readonly StoreCardProduct[],
  search: string,
  category: string,
): StoreCardProduct[] {
  const q = search.trim().toLowerCase()
  return catalog.filter((p) => {
    const meta = metaProdutoStore(p.slug)
    const matchesSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      (p.description ?? '').toLowerCase().includes(q)
    const matchesCategory = category === 'todas' || meta?.categoryFilter === category
    return matchesSearch && matchesCategory
  })
}
