/**
 * Ordem canônica do puzzle Hub + Gravity Store — SSOT cliente e API vitrine.
 * Alterar somente aqui; `product-meta.tsx` e `catalogo-vitrine-produto-gravity.ts` importam deste módulo.
 */
export const STACK_ORDER_PRODUTOS_GRAVITY = [
  'pedido',
  'smart-read',
  'smart-data',
  'bid-frete',
  'bid-cambio',
  'smart-transito',
  'duimp',
  'catalogo-produto',
  'nf-importacao',
  'nf-export',
  'financeiro-comex',
] as const

export type SlugStackProdutoGravity = (typeof STACK_ORDER_PRODUTOS_GRAVITY)[number]
