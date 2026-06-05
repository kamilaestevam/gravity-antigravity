import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  Package,
  CheckCircle,
  SpinnerGap,
  ArrowRight,
  Lightning,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import {
  metaProdutoStore,
  nomeExibicaoProdutoGravity,
  descricaoExibicaoProdutoGravity,
} from '../data/product-meta'
import {
  statusExibicaoParaLegado,
  resolverStatusProdutoStore,
  type CatalogoProdutoStore,
  type AssinaturaProdutoStore,
} from '../data/status-produto-store'

export type StoreCardProduct = {
  id: string
  name: string
  slug: string
  description: string | null
  status: string
}

type Props = {
  produto: StoreCardProduct
  catalog: readonly CatalogoProdutoStore[]
  assinaturas: ReadonlyMap<string, AssinaturaProdutoStore>
  podeContratar: boolean
  subscribing: string | null
  onSubscribe: (slug: string) => void
  pulseDelay?: string
  animDelayClass?: string
}

export function StoreProductCard({
  produto: p,
  catalog,
  assinaturas,
  podeContratar,
  subscribing,
  onSubscribe,
  pulseDelay,
  animDelayClass = '',
}: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const meta = metaProdutoStore(p.slug)
  const legado = statusExibicaoParaLegado(
    resolverStatusProdutoStore(p.slug, catalog, assinaturas),
  )
  const isOwned = legado === 'owned'
  const isSoon = legado === 'soon'
  const isSubscribing = subscribing === p.slug

  return (
    <div
      id={`produto-${p.slug}`}
      className={`gs-card gs-card--store hs-fade-up ${animDelayClass}${isOwned ? ' gs-card--contratado gs-card--owned' : ''}${isSoon ? ' gs-card--soon' : ''}${!isOwned && !isSoon ? ' gs-card--disponivel gs-card--available' : ''}`}
      onClick={isOwned ? () => navigate(`/produto/${p.slug}`) : undefined}
      style={isOwned
        ? { cursor: 'pointer', ['--pulse-delay' as string]: pulseDelay } as React.CSSProperties
        : undefined}
    >
      <div className="gs-card__top">
        <div className="gs-card__icon" style={{ background: meta?.iconBg ?? 'rgba(99,102,241,0.12)' }}>
          {meta?.icon ?? <Package weight="duotone" size={20} color="#818cf8" />}
        </div>
        <div className="gs-card__badges">
          {isOwned ? (
            <span className="gs-badge gs-badge--contratado gs-badge--owned">
              <CheckCircle weight="fill" size={11} /> {t('store.badge_contratado')}
            </span>
          ) : isSoon ? (
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
          {nomeExibicaoProdutoGravity(p.slug, p.name, t)}
        </h3>
        {meta?.categoryKey && (
          <span className="gs-card__category" style={{ color: meta.iconColor }}>
            {t(meta.categoryKey)}
          </span>
        )}
        <p className="gs-card__desc">
          {descricaoExibicaoProdutoGravity(p.slug, p.description, t)}
        </p>
        <div
          className={`gs-card__tags gs-card__tags--rodape${!meta?.tagKeys?.length ? ' gs-card__tags--rodape-vazio' : ''}`}
          aria-hidden={!meta?.tagKeys?.length}
        >
          {meta?.tagKeys?.map(tk => (
            <span key={tk} className={`gs-tag${isSoon ? ' gs-tag--muted' : ''}`}>{t(tk)}</span>
          ))}
        </div>
      </div>
      <div className="gs-card__footer">
        <span />
        {isOwned ? (
          <BotaoGlobal
            variante="secundario"
            tamanho="pequeno"
            onClick={(e) => { e.stopPropagation(); navigate(`/produto/${p.slug}`) }}
          >
            {t('store.btn_acessar')}
          </BotaoGlobal>
        ) : isSoon ? (
          <BotaoGlobal variante="fantasma" tamanho="pequeno" disabled onClick={() => {}}>
            {t('store.btn_em_breve')}
          </BotaoGlobal>
        ) : podeContratar ? (
          <BotaoGlobal
            variante="primario"
            tamanho="pequeno"
            disabled={isSubscribing}
            onClick={(e) => { e.stopPropagation(); onSubscribe(p.slug) }}
          >
            {isSubscribing
              ? <><SpinnerGap size={14} className="hs-spin" /> {t('store.btn_contratando')}</>
              : <>{t('store.btn_ativar')} <ArrowRight weight="bold" size={13} /></>
            }
          </BotaoGlobal>
        ) : (
          <BotaoGlobal variante="fantasma" tamanho="pequeno" disabled onClick={() => {}}>
            {t('store.btn_ativar')}
          </BotaoGlobal>
        )}
      </div>
    </div>
  )
}
