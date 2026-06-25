/**
 * Ícones oficiais dos produtos Gravity — SSOT alinhado ao Hub (/core, Produtos do workspace).
 *
 * Regra: logos SVG em PRODUTO_META (Bid Frete, Bid Câmbio, Smart Read, Financeiro COMEX);
 * Cores: corOficialProdutoGravity / corOficialProdutoDim — nunca duplicar hex em telas.
 */
import React from 'react'
import {
  ArrowsClockwise,
  Certificate,
  ChartLineUp,
  FileMagnifyingGlass,
  FileText,
  ListBullets,
  Package,
  GlobeHemisphereWest,
  Stamp,
} from '@phosphor-icons/react'
import { LogoBidCambio } from './logos/LogoBidCambio'
import { LogoBidFrete } from './logos/LogoBidFrete'
import { LogoFinanceiroComex } from './logos/LogoFinanceiroComex'
import { LogoSmartRead } from './logos/LogoSmartRead'
import { corOficialProdutoGravity, resolverSlugProdutoGravity } from './cores-produto-gravity'

export type IconeProdutoGravityOptions = {
  /** `card` = preenchimento forte em fundos escuros (Hub puzzle, vitrine). */
  variant?: 'default' | 'card'
}

function variantLogoProduto(
  key: string,
  options?: IconeProdutoGravityOptions,
): 'default' | 'card' {
  if (options?.variant) return options.variant
  return key === 'bid-frete' ? 'card' : 'default'
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
  'pedido': Package,
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
  const variant = variantLogoProduto(key, options)

  if (key === 'bid-frete') {
    return (
      <LogoBidFrete
        size={size}
        color={color}
        variant={variant}
      />
    )
  }

  if (key === 'bid-cambio') {
    return <LogoBidCambio size={size} color={color} variant={variant} />
  }

  if (key === 'smart-read') {
    return <LogoSmartRead size={size} color={color} variant={variant} />
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
