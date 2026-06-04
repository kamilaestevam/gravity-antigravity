/**
 * Visual de card de produto (ícone + cor + fundo) — SSOT alinhado ao Hub refinado.
 * Textos/descrições ficam no i18n de cada tela (`hub.produto_visual_*`, `store.prod_*`).
 */
import React from 'react'
import { Package } from '@phosphor-icons/react'
import { corOficialProdutoDim, corOficialProdutoGravity } from './cores-produto-gravity'
import {
  DIM_PRODUTO_HUB_CARD,
  iconeOficialProdutoGravity,
} from './icone-produto-gravity'

/** Tamanho do ícone nos cards do Hub / Core (hb-prod-icon). */
export const TAMANHO_ICONE_PRODUTO_HUB = 26

export interface VisualProdutoGravity {
  color: string
  dim: string
  icon: React.ReactNode
}

/** Pacote visual completo para cards escuros do Hub — referência canônica da branch. */
export function visualProdutoGravityHub(
  slug: string,
  tamanhoIcone = TAMANHO_ICONE_PRODUTO_HUB,
): VisualProdutoGravity {
  return {
    color: corOficialProdutoGravity(slug),
    dim: corOficialProdutoDim(slug, DIM_PRODUTO_HUB_CARD),
    icon: iconeOficialProdutoGravity(slug, tamanhoIcone, { variant: 'card' }),
  }
}

/** Fallback para slug desconhecido (indigo Gravity). */
export function visualProdutoGravityFallback(tamanhoIcone = 24): VisualProdutoGravity {
  const color = '#6366f1'
  return {
    color,
    dim: 'rgba(99,102,241,0.12)',
    icon: <Package weight="duotone" size={tamanhoIcone} color={color} />,
  }
}
