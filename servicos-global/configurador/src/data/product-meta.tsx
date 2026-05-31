// Metadata visual de produtos Gravity — fonte única de verdade.
//
// Mapeia slug → ícone, cores, chaves de tradução e categoria de filtro.
// Usado pelo Store (vitrine, cards completos com tags + "combina com")
// e pela Assinaturas (gestão, modo compacto).
//
// Quando criar produto novo, adicionar entrada aqui + chaves correspondentes
// em locales/*.json (cat_*, prod_*_nome, prod_*_desc, tag_*).

import React from 'react'
import {
  Truck,
  CurrencyDollar,
  FileText,
  ShoppingBag,
  FileMagnifyingGlass,
  Eye,
} from '@phosphor-icons/react'
import { corOficialProdutoDim, corOficialProdutoGravity } from '@nucleo/logo-produtos'

function coresProduto(slug: string): Pick<ProductMeta, 'iconBg' | 'iconColor'> {
  const iconColor = corOficialProdutoGravity(slug)
  return { iconColor, iconBg: corOficialProdutoDim(slug, 0.15) }
}

export interface ProductMeta {
  iconBg: string
  iconColor: string
  icon: React.ReactNode
  categoryKey: string
  categoryFilter: string
  nameKey?: string
  descKey: string
  tagKeys: string[]
}

export const PRODUCT_META: Record<string, ProductMeta> = {
  'bid-frete': {
    ...coresProduto('bid-frete'),
    icon: <Truck weight="duotone" size={28} color={corOficialProdutoGravity('bid-frete')} />,
    categoryKey: 'store.cat_logistica',
    categoryFilter: 'frete',
    nameKey: 'store.prod_bid_frete_nome',
    descKey: 'store.prod_bid_frete_desc',
    tagKeys: ['store.tag_multi_carrier', 'store.tag_tempo_real', 'store.tag_relatorios', 'store.tag_api_integrada'],
  },
  'bid-cambio': {
    ...coresProduto('bid-cambio'),
    icon: <CurrencyDollar weight="duotone" size={28} color={corOficialProdutoGravity('bid-cambio')} />,
    categoryKey: 'store.cat_financeiro',
    categoryFilter: 'cambio',
    nameKey: 'store.prod_bid_cambio_nome',
    descKey: 'store.prod_bid_cambio_desc',
    tagKeys: ['store.tag_banco_central', 'store.tag_multi_moeda', 'store.tag_historico'],
  },
  'nf-importacao': {
    ...coresProduto('nf-importacao'),
    icon: <FileText weight="duotone" size={28} color={corOficialProdutoGravity('nf-importacao')} />,
    categoryKey: 'store.cat_fiscal_doc',
    categoryFilter: 'importacao',
    nameKey: 'store.prod_nf_importacao_nome',
    descKey: 'store.prod_nf_importacao_desc',
    tagKeys: ['store.tag_sefaz', 'store.tag_calc_ncm', 'store.tag_xml_pdf'],
  },
  'pedido': {
    ...coresProduto('pedido'),
    icon: <ShoppingBag weight="duotone" size={28} color={corOficialProdutoGravity('pedido')} />,
    categoryKey: 'store.cat_comercial',
    categoryFilter: 'comercial',
    nameKey: 'store.prod_pedido_nome',
    descKey: 'store.prod_pedido_desc',
    tagKeys: ['store.tag_aprov', 'store.tag_rastreamento', 'store.tag_integ_erp'],
  },
  'simula-custo': {
    ...coresProduto('simula-custo'),
    icon: <FileMagnifyingGlass weight="duotone" size={28} color={corOficialProdutoGravity('simula-custo')} />,
    categoryKey: 'store.cat_comex',
    categoryFilter: 'importacao',
    nameKey: 'store.prod_simula_custo_nome',
    descKey: 'store.prod_simula_custo_desc',
    tagKeys: ['store.tag_ncm_auto', 'store.tag_impostos', 'store.tag_comparativo'],
  },
  'smart-read': {
    ...coresProduto('smart-read'),
    icon: <Eye weight="duotone" size={28} color={corOficialProdutoGravity('smart-read')} />,
    categoryKey: 'store.cat_ia',
    categoryFilter: 'importacao',
    nameKey: 'store.prod_smart_read_nome',
    descKey: 'store.prod_smart_read_desc',
    tagKeys: ['store.tag_ocr_ia', 'store.tag_invoice', 'store.tag_aduaneiro'],
  },
  'bid-frete-internacional': {
    ...coresProduto('bid-frete'),
    icon: <Truck weight="duotone" size={28} color={corOficialProdutoGravity('bid-frete')} />,
    categoryKey: 'store.cat_logistica',
    categoryFilter: 'frete',
    nameKey: 'store.prod_bid_frete_nome',
    descKey: 'store.prod_bid_frete_desc',
    tagKeys: ['store.tag_multi_carrier', 'store.tag_tempo_real', 'store.tag_relatorios', 'store.tag_api_integrada'],
  },
}

/** Nome de vitrine/hub — prioriza i18n (Bid) sobre valor persistido no catálogo (pode estar legado). */
export function nomeExibicaoProdutoGravity(
  slug: string,
  fallback: string,
  t: (key: string, defaultValue?: string) => string,
): string {
  const chave = slug === 'bid-frete-internacional' ? 'bid-frete' : slug
  const meta = PRODUCT_META[chave] ?? PRODUCT_META[slug]
  if (meta?.nameKey) return t(meta.nameKey)
  return fallback
}

// Relação entre produtos Gravity — quais módulos se complementam.
// Chave = slug, valor = slugs relacionados (cross-sell).
export const RELACAO_ENTRE_PRODUTOS_GRAVITY: Record<string, string[]> = {
  'simula-custo':  ['nf-importacao', 'bid-frete'],
  'nf-importacao': ['simula-custo', 'bid-frete', 'pedido'],
  'bid-frete':     ['simula-custo', 'nf-importacao', 'pedido'],
  'bid-cambio':    ['pedido', 'nf-importacao'],
  'pedido':        ['bid-cambio', 'bid-frete', 'nf-importacao'],
}

// Ordem lógica dos produtos no Stack Visualizer (fluxo de operação) — usado pela Store.
export const STACK_ORDER = ['simula-custo', 'nf-importacao', 'bid-frete', 'bid-cambio', 'pedido']
