/**
 * grade-produtos-contratados-hub.tsx — puzzle stack (paridade Gravity Store) no HUB.
 */

import type { TFunction } from 'i18next'
import React, { useMemo } from 'react'
import { Package } from '@phosphor-icons/react'
import {
  BarrasMeterPuzzleStackProdutos,
  pecasPuzzleStackProdutosGravity,
  PuzzleStackProdutosGravity,
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
  /** Contador exibido abaixo do título do painel (não duplicar no stack). */
  rotuloNoCabecalho?: boolean
  /** HUB: sessão de workspace + navegação direta ao módulo contratado. */
  onAbrirProdutoContratado?: (slug: string, rota: string) => void
}

export function GradeProdutosContratadosHub({
  catalogo,
  produtosContratados,
  t,
  onIrStore,
  rotuloNoCabecalho = false,
  onAbrirProdutoContratado,
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

  const temStack = slugsPuzzleStackProdutosGravity(catalogoMin).length > 0

  if (!temStack) {
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
    <PuzzleStackProdutosGravity
      catalogo={catalogoMin}
      assinaturas={assinaturas}
      t={t}
      escala="full"
      rotuloAbaixoTitulo={rotuloNoCabecalho}
      ocultarMeterNoStack={rotuloNoCabecalho}
      onAbrirProdutoContratado={onAbrirProdutoContratado}
      className="gs-stack--hub-contratados"
    />
  )
}

export interface BarrasMeterProdutosContratadosHubProps {
  catalogo: ProdutoCatalogoHubItem[]
  produtosContratados: ProdutoContratadoHubItem[]
  t: TFunction
}

/** Barrinhas + contador do puzzle no cabeçalho (paridade Store: meter + "N DE M"). */
export function BarrasMeterProdutosContratadosHub({
  catalogo,
  produtosContratados,
  t,
}: BarrasMeterProdutosContratadosHubProps) {
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

  const ownedNoStack = pecas.filter(p => p.status === 'owned').length

  return (
    <BarrasMeterPuzzleStackProdutos pecas={pecas} className="sw-hub-prod-head-meter">
      <span className="gs-stack__meter-label sw-hub-prod-stack-label">
        {rotuloMeterStackProdutos(ownedNoStack, pecas.length, t)}
      </span>
    </BarrasMeterPuzzleStackProdutos>
  )
}
