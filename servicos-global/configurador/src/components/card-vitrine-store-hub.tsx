import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Lightning, Package } from '@phosphor-icons/react'
import { PRODUCT_META, nomeExibicaoProdutoGravity } from '../data/product-meta'
import {
  filtrarCatalogoProdutosGravityStore,
  mapaAssinaturaAtivaPorSlug,
  mapaCatalogoPorSlugCanonico,
  slugCanonicoProdutoGravity,
  statusProdutoGravityStore,
  type AssinaturaProdutoGravityMin,
  type CatalogoProdutoGravityMin,
} from '../lib/produtos-gravity-store-status'

interface CardVitrineStoreHubProps {
  catalogo: CatalogoProdutoGravityMin[]
  produtosContratados: AssinaturaProdutoGravityMin[]
  onAbrirStore: () => void
}

function metaProdutoHub(slug: string) {
  const chave = slugCanonicoProdutoGravity(slug)
  return PRODUCT_META[chave] ?? PRODUCT_META[slug]
}

export function CardVitrineStoreHub({
  catalogo,
  produtosContratados,
  onAbrirStore,
}: CardVitrineStoreHubProps) {
  const { t } = useTranslation()
  const [indice, setIndice] = useState(0)
  const [pausado, setPausado] = useState(false)

  const catalogoPorSlug = useMemo(
    () => mapaCatalogoPorSlugCanonico(filtrarCatalogoProdutosGravityStore(catalogo)),
    [catalogo],
  )

  const assinaturaAtiva = useMemo(
    () => mapaAssinaturaAtivaPorSlug(produtosContratados),
    [produtosContratados],
  )

  const itensVitrine = useMemo(() => {
    const catalogoFiltrado = filtrarCatalogoProdutosGravityStore(catalogo)
    const vistos = new Set<string>()
    const itens: CatalogoProdutoGravityMin[] = []

    for (const produto of catalogoFiltrado) {
      const canon = slugCanonicoProdutoGravity(produto.slug)
      if (vistos.has(canon)) continue
      vistos.add(canon)

      const status = statusProdutoGravityStore(canon, catalogoPorSlug, assinaturaAtiva)
      if (status === 'available' || status === 'soon') {
        itens.push(produto)
      }
    }

    return itens
  }, [catalogo, catalogoPorSlug, assinaturaAtiva])

  useEffect(() => {
    setIndice(0)
  }, [itensVitrine.length])

  useEffect(() => {
    if (pausado || itensVitrine.length <= 1) return
    const timer = setInterval(() => {
      setIndice(prev => (prev + 1) % itensVitrine.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [pausado, itensVitrine.length])

  if (itensVitrine.length === 0) return null

  const produtoAtual = itensVitrine[indice] ?? itensVitrine[0]
  const meta = metaProdutoHub(produtoAtual.slug)
  const emBreve = statusProdutoGravityStore(
    produtoAtual.slug,
    catalogoPorSlug,
    assinaturaAtiva,
  ) === 'soon'

  return (
    <div
      className="sw-hub-store-vitrine"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      <button
        type="button"
        key={produtoAtual.slug}
        className={`gs-card sw-hub-store-vitrine-card hs-fade-up${emBreve ? ' gs-card--soon' : ' gs-card--available'}`}
        onClick={onAbrirStore}
        aria-label={nomeExibicaoProdutoGravity(produtoAtual.slug, produtoAtual.name, t)}
      >
        <div className="gs-card__top">
          <div
            className="gs-card__icon"
            style={{ background: meta?.iconBg ?? 'rgba(99,102,241,0.12)' }}
          >
            {meta?.icon ?? <Package weight="duotone" size={28} color="#818cf8" />}
          </div>
          <div className="gs-card__badges">
            {emBreve ? (
              <span className="gs-badge gs-badge--soon">
                <Lightning weight="fill" size={11} /> {t('store.badge_em_breve')}
              </span>
            ) : (
              <span className="gs-badge gs-badge--available">
                <span className="gs-badge__dot" /> {t('store.badge_disponivel')}
              </span>
            )}
          </div>
        </div>
        <div className="gs-card__body">
          <h3 className="gs-card__name">
            {nomeExibicaoProdutoGravity(produtoAtual.slug, produtoAtual.name, t)}
          </h3>
          {meta?.categoryKey && (
            <span className="gs-card__category" style={{ color: meta.iconColor }}>
              {t(meta.categoryKey)}
            </span>
          )}
          <p className="gs-card__desc">
            {meta?.descKey
              ? t(meta.descKey)
              : (produtoAtual.description ?? t('store.modulo_desc_fallback'))}
          </p>
          {meta?.tagKeys && (
            <div className="gs-card__tags">
              {meta.tagKeys.map(tagKey => (
                <span key={tagKey} className={`gs-tag${emBreve ? ' gs-tag--muted' : ''}`}>
                  {t(tagKey)}
                </span>
              ))}
            </div>
          )}
        </div>
      </button>

      {itensVitrine.length > 1 && (
        <div className="sw-hub-store-vitrine-dots" role="tablist" aria-label={t('sw.gravity_store', 'Gravity Store')}>
          {itensVitrine.map((produto, idx) => (
            <button
              key={produto.slug}
              type="button"
              role="tab"
              aria-selected={idx === indice}
              className={`sw-hub-store-vitrine-dot${idx === indice ? ' sw-hub-store-vitrine-dot--active' : ''}`}
              onClick={() => setIndice(idx)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
