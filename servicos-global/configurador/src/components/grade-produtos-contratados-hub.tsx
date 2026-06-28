/**
 * grade-produtos-contratados-hub.tsx — puzzle stack (paridade Gravity Store) no HUB.
 */

import type { TFunction } from 'i18next'
import React, { useMemo } from 'react'
import { ArrowRight, Package, RocketLaunch, ShoppingBagOpen } from '@phosphor-icons/react'
import { StorePuzzleCarousel } from './store-puzzle-carousel'
import {
  BarrasMeterPuzzleStackProdutos,
  pecasPuzzleStackProdutosGravity,
  PuzzleStackProdutosGravity,
  type PecaPuzzleExtraHub,
} from './puzzle-stack-produtos-gravity'
import {
  filtrarCatalogoProdutosGravityStore,
  rotuloMeterStackProdutos,
  slugsPuzzleStackProdutosGravity,
  type CatalogoProdutoGravityMin,
  type AssinaturaProdutoGravityMin,
} from '../lib/produtos-gravity-store-status'

export interface ProdutoContratadoHubItem {
  product_key: string
  nome: string
  descricao?: string
  is_active: boolean
}

export interface ProdutoCatalogoHubItem {
  id: string
  slug: string
  name: string
  status: string
}

export interface GradeProdutosContratadosHubProps {
  catalogo: ProdutoCatalogoHubItem[]
  produtosContratados: ProdutoContratadoHubItem[]
  t: TFunction
  onIrStore?: () => void
  /** HUB: sessão de workspace + navegação direta ao módulo contratado. */
  onAbrirProdutoContratado?: (slug: string, rota: string) => void
  /** HUB: peça extra visão fornecedor BID (perm `visao_fornecedor:cotar`). */
  pecasExtras?: PecaPuzzleExtraHub[]
}

export function GradeProdutosContratadosHub({
  catalogo,
  produtosContratados,
  t,
  onIrStore,
  onAbrirProdutoContratado,
  pecasExtras = [],
}: GradeProdutosContratadosHubProps) {
  const catalogoStore = useMemo(
    () => filtrarCatalogoProdutosGravityStore(catalogo),
    [catalogo],
  )

  const catalogoMin: CatalogoProdutoGravityMin[] = useMemo(
    () => catalogoStore.map(p => ({ slug: p.slug, name: p.name, status: p.status })),
    [catalogoStore],
  )

  const assinaturas: AssinaturaProdutoGravityMin[] = useMemo(
    () =>
      produtosContratados.map(p => ({
        product_key: p.product_key,
        is_active: p.is_active,
      })),
    [produtosContratados],
  )

  const pecas = useMemo(
    () => pecasPuzzleStackProdutosGravity(catalogoMin, assinaturas),
    [catalogoMin, assinaturas],
  )

  const temStack = slugsPuzzleStackProdutosGravity(catalogoMin).length > 0
  const temExtras = pecasExtras.length > 0
  const ownedNoStack = pecas.filter(p => p.status === 'owned').length
  const totalStack = pecas.length
  const semProdutosContratados = ownedNoStack === 0

  if (!temStack && !temExtras) {
    return (
      <div className="sw-hub-prod-vazio">
        <Package weight="duotone" size={32} color="var(--sw-text-2)" />
        <p>{t('sw.sem_produtos_contratados', 'Nenhum produto ativo neste workspace.')}</p>
        {onIrStore && (
          <button type="button" className="sw-hub-prod-vazio-link" onClick={onIrStore}>
            {t('sw.ir_store_ativar', 'Ativar na Gravity Store')} →
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="gs-stack gs-stack--puzzle gs-stack--hub-paridade-store">
      {semProdutosContratados && onIrStore && (
        <div
          className="sw-hub-onboarding-store"
          role="region"
          aria-label={t('sw.hub_primeiro_modulo_titulo', 'Ative seu primeiro módulo')}
        >
          <span className="sw-hub-onboarding-store__icon" aria-hidden>
            <RocketLaunch size={22} weight="duotone" />
          </span>
          <div className="sw-hub-onboarding-store__copy">
            <p className="sw-hub-onboarding-store__kicker">
              {t('sw.hub_primeiro_modulo_kicker', 'Primeiro passo')}
            </p>
            <h3 className="sw-hub-onboarding-store__title">
              {t('sw.hub_primeiro_modulo_titulo', 'Ative seu primeiro módulo')}
            </h3>
            <p className="sw-hub-onboarding-store__desc">
              {t(
                'sw.hub_primeiro_modulo_desc',
                'Escolha na Gravity Store os produtos para sua operação de comércio exterior. Você também pode clicar em um módulo abaixo para ir direto à vitrine.',
              )}
            </p>
          </div>
          <button
            type="button"
            className="sw-hub-cta-primario sw-hub-onboarding-store__cta"
            onClick={onIrStore}
          >
            <ShoppingBagOpen size={16} weight="duotone" aria-hidden />
            {t('sw.hub_ir_gravity_store', 'Ir para Gravity Store')}
            <ArrowRight size={14} weight="bold" aria-hidden />
          </button>
        </div>
      )}

      <div className="gs-stack__head">
        <div>
          <h2 className="gs-stack__title">
            {t('sw.produtos_contratados', 'Seus Produtos Gravity')}
          </h2>
          <p className="gs-stack__sub">
            {semProdutosContratados
              ? t(
                  'sw.hub_primeiro_modulo_subtitulo_secao',
                  'Prévia dos módulos — ative na Gravity Store para começar',
                )
              : t('sw.produtos_contratados_desc')}
          </p>
        </div>
        <div className="gs-stack__head-actions">
          {onIrStore && (
            <button
              type="button"
              className={
                semProdutosContratados
                  ? 'sw-hub-cta-primario sw-hub-cta-primario--compact'
                  : 'sw-hub-link-pill'
              }
              onClick={onIrStore}
            >
              <ShoppingBagOpen size={13} weight="duotone" aria-hidden />
              {t('sw.ver_catalogo', 'Gravity Store')}
              <ArrowRight size={12} weight="bold" className="sw-hub-link-pill__arrow" aria-hidden />
            </button>
          )}
          {!semProdutosContratados && (
            <BarrasMeterPuzzleStackProdutos pecas={pecas}>
              <span className="gs-stack__meter-label">
                {rotuloMeterStackProdutos(ownedNoStack, totalStack, t)}
              </span>
            </BarrasMeterPuzzleStackProdutos>
          )}
        </div>
      </div>

      <div className="gs-stack__lanes">
        <StorePuzzleCarousel className="gs-puzzle-carousel--ativos">
          <PuzzleStackProdutosGravity
            catalogo={catalogoMin}
            assinaturas={assinaturas}
            t={t}
            escala="hub"
            embutidoParidadeStore
            ocultarMeterNoStack
            onAbrirProdutoContratado={onAbrirProdutoContratado}
            pecasExtras={pecasExtras}
            className="gs-stack--hub-contratados"
          />
        </StorePuzzleCarousel>
      </div>
    </div>
  )
}
