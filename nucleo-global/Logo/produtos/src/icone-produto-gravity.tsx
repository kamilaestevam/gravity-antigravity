/**
 * Ícones oficiais dos produtos Gravity — SSOT alinhado ao Hub (/core, Produtos do workspace).
 *
 * Regra: mesmos ícones Phosphor duotone + cor PRODUTO_META; Bid Frete usa LogoBidFrete (variant card em cards escuros).
 * Cores: corOficialProdutoGravity / corOficialProdutoDim — nunca duplicar hex em telas.
 */
import React from 'react'
import {
  ArrowsClockwise,
  Certificate,
  ChartLineUp,
  CurrencyDollar,
  FileMagnifyingGlass,
  FileText,
  ListBullets,
  MagnifyingGlass,
  Package,
  GlobeHemisphereWest,
  Stamp,
} from '@phosphor-icons/react'
import { LogoBidFrete } from './logos/LogoBidFrete'
import { LogoFinanceiroComex } from './logos/LogoFinanceiroComex'
import { corOficialProdutoGravity, resolverSlugProdutoGravity } from './cores-produto-gravity'

export type IconeProdutoGravityOptions = {
  /** Bid Frete: `card` = preenchimento forte (Hub, Store, vitrine escura). */
  variant?: 'default' | 'card'
}

type PhosphorIcon = React.ComponentType<{
  weight?: 'duotone' | 'bold' | 'fill' | 'light' | 'regular' | 'thin'
  size?: number
  color?: string
}>

function iconePhosphor(Icon: PhosphorIcon, slug: string, size: number): React.ReactNode {
  return <Icon weight="duotone" size={size} color={corOficialProdutoGravity(slug)} />
}

/** Slugs com ícone definido no Hub refinado — referência visual canônica. */
const ICONE_HUB_PHOSPHOR: Record<string, PhosphorIcon> = {
  'simula-custo': FileMagnifyingGlass,
  'nf-importacao': FileText,
  'processo': ArrowsClockwise,
  'bid-cambio': CurrencyDollar,
  'pedido': Package,
  'smart-read': MagnifyingGlass,
}

/** Produtos na Store/puzzle ainda sem card no Hub — extensão com mesma linguagem visual. */
const ICONE_STORE_PHOSPHOR: Record<string, PhosphorIcon> = {
  'smart-data': ChartLineUp,
  /** Rotas nacionais e internacionais — evitar Truck (leitura só rodoviário/doméstico). */
  'smart-transito': GlobeHemisphereWest,
  'duimp': Stamp,
  'lpco': Certificate,
  'catalogo-produto': ListBullets,
}

/** BID Frete Internacional — atalho (Hub / Core / menu). */
export function iconeOficialBidFreteInternacional(
  size: number,
  variant: IconeProdutoGravityOptions['variant'] = 'card',
): React.ReactNode {
  return iconeOficialProdutoGravity('bid-frete', size, { variant })
}

/**
 * Ícone oficial do produto — única API para Hub, Store, Selecionar Workspace, Core, etc.
 */
export function iconeOficialProdutoGravity(
  slug: string,
  size: number,
  options?: IconeProdutoGravityOptions,
): React.ReactNode {
  const key = resolverSlugProdutoGravity(slug)
  const color = corOficialProdutoGravity(slug)

  if (key === 'bid-frete') {
    return (
      <LogoBidFrete
        size={size}
        color={color}
        variant={options?.variant ?? 'card'}
      />
    )
  }

  const Phosphor = ICONE_HUB_PHOSPHOR[key] ?? ICONE_STORE_PHOSPHOR[key]
  if (Phosphor) {
    return iconePhosphor(Phosphor, key, size)
  }

  switch (key) {
    case 'financeiro-comex':
      return <LogoFinanceiroComex size={size} color={color} />
    default:
      return iconePhosphor(Package, key, size)
  }
}

/** Opacidade de fundo/glow em cards do Hub (hb-prod-card). */
export const DIM_PRODUTO_HUB_CARD = 0.28
