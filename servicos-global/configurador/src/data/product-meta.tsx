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
  Receipt,
  ShoppingBag,
  FileMagnifyingGlass,
  Eye,
} from '@phosphor-icons/react'

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
    iconBg: 'rgba(16, 185, 129, 0.15)',
    iconColor: '#10b981',
    icon: <Truck weight="duotone" size={28} color="#10b981" />,
    categoryKey: 'store.cat_logistica',
    categoryFilter: 'frete',
    nameKey: 'store.prod_bid_frete_nome',
    descKey: 'store.prod_bid_frete_desc',
    tagKeys: ['store.tag_multi_carrier', 'store.tag_tempo_real', 'store.tag_relatorios', 'store.tag_api_integrada'],
  },
  'bid-cambio': {
    iconBg: 'rgba(16, 185, 129, 0.15)',
    iconColor: '#10b981',
    icon: <CurrencyDollar weight="duotone" size={28} color="#10b981" />,
    categoryKey: 'store.cat_financeiro',
    categoryFilter: 'cambio',
    nameKey: 'store.prod_bid_cambio_nome',
    descKey: 'store.prod_bid_cambio_desc',
    tagKeys: ['store.tag_banco_central', 'store.tag_multi_moeda', 'store.tag_historico'],
  },
  'nf-importacao': {
    iconBg: 'rgba(99, 102, 241, 0.15)',
    iconColor: '#818cf8',
    icon: <FileText weight="duotone" size={28} color="#818cf8" />,
    categoryKey: 'store.cat_fiscal_doc',
    categoryFilter: 'importacao',
    nameKey: 'store.prod_nf_importacao_nome',
    descKey: 'store.prod_nf_importacao_desc',
    tagKeys: ['store.tag_sefaz', 'store.tag_calc_ncm', 'store.tag_xml_pdf'],
  },
  'lpco': {
    iconBg: 'rgba(99, 102, 241, 0.15)',
    iconColor: '#818cf8',
    icon: <Receipt weight="duotone" size={28} color="#818cf8" />,
    categoryKey: 'store.cat_fiscal_lic',
    categoryFilter: 'importacao',
    nameKey: 'store.prod_lpco_nome',
    descKey: 'store.prod_lpco_desc',
    tagKeys: ['store.tag_siscomex', 'store.tag_saldo_auto', 'store.tag_rastreio'],
  },
  'pedido': {
    iconBg: 'rgba(245, 158, 11, 0.15)',
    iconColor: '#f59e0b',
    icon: <ShoppingBag weight="duotone" size={28} color="#f59e0b" />,
    categoryKey: 'store.cat_comercial',
    categoryFilter: 'comercial',
    nameKey: 'store.prod_pedido_nome',
    descKey: 'store.prod_pedido_desc',
    tagKeys: ['store.tag_aprov', 'store.tag_rastreamento', 'store.tag_integ_erp'],
  },
  'simula-custo': {
    iconBg: 'rgba(99, 102, 241, 0.15)',
    iconColor: '#818cf8',
    icon: <FileMagnifyingGlass weight="duotone" size={28} color="#818cf8" />,
    categoryKey: 'store.cat_comex',
    categoryFilter: 'importacao',
    nameKey: 'store.prod_simula_custo_nome',
    descKey: 'store.prod_simula_custo_desc',
    tagKeys: ['store.tag_ncm_auto', 'store.tag_impostos', 'store.tag_comparativo'],
  },
  'smart-read': {
    iconBg: 'rgba(139, 92, 246, 0.15)',
    iconColor: '#a78bfa',
    icon: <Eye weight="duotone" size={28} color="#a78bfa" />,
    categoryKey: 'store.cat_ia',
    categoryFilter: 'importacao',
    nameKey: 'store.prod_smart_read_nome',
    descKey: 'store.prod_smart_read_desc',
    tagKeys: ['store.tag_ocr_ia', 'store.tag_invoice', 'store.tag_aduaneiro'],
  },
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
export const STACK_ORDER = ['simula-custo', 'nf-importacao', 'lpco', 'bid-frete', 'bid-cambio', 'pedido']
