// Metadata visual de produtos Gravity — fonte única de verdade.

//

// Mapeia slug → ícone, cores, chaves de tradução e categoria de filtro.

// Ícones/cores: @nucleo/logo-produtos → iconeOficialProdutoGravity + visualProdutoGravityHub (SSOT = Hub refinado).

//

// Quando criar produto novo, adicionar entrada aqui + chaves em locales/*.json.



import React from 'react'

import {

  iconeOficialProdutoGravity,

  corOficialProdutoDim,

  corOficialProdutoGravity,

  resolverSlugProdutoGravity,

} from '@nucleo/logo-produtos'
import { STACK_ORDER_PRODUTOS_GRAVITY } from '../../shared/stack-order-produtos-gravity.js'
import { slugCatalogoParaPuzzle } from './status-produto-store'



export { iconeOficialBidFreteInternacional } from '@nucleo/logo-produtos'



function coresProduto(slug: string): Pick<ProductMeta, 'iconBg' | 'iconColor'> {

  const iconColor = corOficialProdutoGravity(slug)

  return { iconColor, iconBg: corOficialProdutoDim(slug, 0.15) }

}



function metaBase(

  slug: string,

  categoryKey: string,

  categoryFilter: string,

  nameKey: string,

  descKey: string,

  tagKeys: string[],

  iconSize = 28,

): ProductMeta {

  const slugCanonico = resolverSlugProdutoGravity(slug)

  return {

    ...coresProduto(slug),

    icon: iconeOficialProdutoGravity(slug, iconSize, {

      variant: slugCanonico === 'bid-frete' ? 'card' : 'default',

    }),

    categoryKey,

    categoryFilter,

    nameKey,

    descKey,

    tagKeys,

  }

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

  'bid-frete': metaBase(

    'bid-frete',

    'store.cat_logistica',

    'frete',

    'store.prod_bid_frete_nome',

    'store.prod_bid_frete_desc',

    ['store.tag_multi_carrier', 'store.tag_tempo_real', 'store.tag_relatorios', 'store.tag_api_integrada'],

  ),

  'bid-cambio': metaBase(

    'bid-cambio',

    'store.cat_financeiro',

    'cambio',

    'store.prod_bid_cambio_nome',

    'store.prod_bid_cambio_desc',

    ['store.tag_banco_central', 'store.tag_multi_moeda', 'store.tag_historico'],

  ),

  'nf-importacao': metaBase(

    'nf-importacao',

    'store.cat_fiscal_doc',

    'importacao',

    'store.prod_nf_importacao_nome',

    'store.prod_nf_importacao_desc',

    ['store.tag_sefaz', 'store.tag_calc_ncm', 'store.tag_xml_pdf'],

  ),

  'nf-import': metaBase(

    'nf-importacao',

    'store.cat_fiscal_doc',

    'importacao',

    'store.prod_nf_importacao_nome',

    'store.prod_nf_importacao_desc',

    ['store.tag_sefaz', 'store.tag_calc_ncm', 'store.tag_xml_pdf'],

  ),

  'pedido': metaBase(

    'pedido',

    'store.cat_comercial',

    'comercial',

    'store.prod_pedido_nome',

    'store.prod_pedido_desc',

    ['store.tag_aprov', 'store.tag_rastreamento', 'store.tag_integ_erp'],

  ),

  'simula-custo': metaBase(

    'simula-custo',

    'store.cat_comex',

    'importacao',

    'store.prod_simula_custo_nome',

    'store.prod_simula_custo_desc',

    ['store.tag_ncm_auto', 'store.tag_impostos', 'store.tag_comparativo'],

  ),

  'smart-read': metaBase(

    'smart-read',

    'store.cat_ia',

    'importacao',

    'store.prod_smart_read_nome',

    'store.prod_smart_read_desc',

    ['store.tag_ocr_ia', 'store.tag_invoice', 'store.tag_aduaneiro'],

  ),

  'bid-frete-internacional': metaBase(

    'bid-frete',

    'store.cat_logistica',

    'frete',

    'store.prod_bid_frete_nome',

    'store.prod_bid_frete_desc',

    ['store.tag_multi_carrier', 'store.tag_tempo_real', 'store.tag_relatorios', 'store.tag_api_integrada'],

  ),

  'smart-data': metaBase(

    'smart-data',

    'store.cat_ia',

    'importacao',

    'store.prod_smart_data_nome',

    'store.prod_smart_data_desc',

    ['store.tag_relatorios', 'store.tag_tempo_real'],

  ),

  'smart-transito': metaBase(

    'smart-transito',

    'store.cat_logistica',

    'frete',

    'store.prod_smart_transito_nome',

    'store.prod_smart_transito_desc',

    ['store.tag_rastreamento', 'store.tag_tempo_real'],

  ),

  'duimp': metaBase(

    'duimp',

    'store.cat_fiscal_avancado',

    'importacao',

    'store.prod_duimp_nome',

    'store.prod_duimp_desc',

    ['store.tag_aduaneiro', 'store.tag_regime_especial'],

  ),

  'lpco': metaBase(

    'lpco',

    'store.cat_fiscal_lic',

    'importacao',

    'store.prod_lpco_nome',

    'store.prod_lpco_desc',

    ['store.tag_siscomex', 'store.tag_saldo_auto', 'store.tag_rastreio'],

  ),

  'financeiro-comex': metaBase(

    'financeiro-comex',

    'store.cat_financeiro',

    'cambio',

    'store.prod_financeiro_comex_nome',

    'store.prod_financeiro_comex_desc',

    ['store.tag_multi_moeda', 'store.tag_relatorios'],

  ),

  'catalogo-produto': metaBase(

    'catalogo-produto',

    'store.cat_fiscal_doc',

    'importacao',

    'store.prod_catalogo_produto_nome',

    'store.prod_catalogo_produto_desc',

    ['store.tag_ncm_auto', 'store.tag_siscomex'],

  ),

}



/** Meta visual para slug vindo do catálogo API (aceita alias admin ↔ puzzle). */
export function metaProdutoStore(slugCatalogo: string): ProductMeta | undefined {
  const puzzle = slugCatalogoParaPuzzle(slugCatalogo)
  return PRODUCT_META[puzzle] ?? PRODUCT_META[slugCatalogo] ?? PRODUCT_META[resolverSlugProdutoGravity(slugCatalogo)]
}

/**
 * Nome exibido — SSOT é o Admin (ProdutoGravity.nome_produto_gravity via API).
 * i18n (nameKey) só quando o catálogo não trouxer nome.
 */
export function nomeExibicaoProdutoGravity(
  slug: string,
  nomeCatalogo: string,
  t: (key: string, defaultValue?: string) => string,
): string {
  const doAdmin = nomeCatalogo?.trim()
  if (doAdmin) return doAdmin

  const chave = slugCatalogoParaPuzzle(slug === 'bid-frete-internacional' ? 'bid-frete' : slug)
  const meta = metaProdutoStore(chave) ?? metaProdutoStore(slug)
  if (meta?.nameKey) return t(meta.nameKey)
  return nomeCatalogo
}

/**
 * Rótulo curto nas peças do puzzle no HUB — prioriza nameKey i18n (Bid Frete Int., NF Import…)
 * em vez do nome longo do catálogo Admin, para caber no card quadrado.
 */
export function nomeExibicaoPecaPuzzleHub(
  slug: string,
  nomeCatalogo: string,
  t: (key: string, defaultValue?: string) => string,
): string {
  const chave = slugCatalogoParaPuzzle(slug === 'bid-frete-internacional' ? 'bid-frete' : slug)
  const meta = metaProdutoStore(chave) ?? metaProdutoStore(slug)
  if (meta?.nameKey) return t(meta.nameKey)
  const doAdmin = nomeCatalogo?.trim()
  if (doAdmin) return doAdmin
  return nomeCatalogo
}

/**
 * Descrição exibida — SSOT é descricao_produto_gravity do Admin; descKey só como fallback.
 */
export function descricaoExibicaoProdutoGravity(
  slug: string,
  descricaoCatalogo: string | null | undefined,
  t: (key: string, defaultValue?: string) => string,
  fallbackKey = 'store.produto_desc_fallback',
): string {
  const doAdmin = descricaoCatalogo?.trim()
  if (doAdmin) return doAdmin

  const meta = metaProdutoStore(slug)
  if (meta?.descKey) return t(meta.descKey)
  return t(fallbackKey)
}



export const RELACAO_ENTRE_PRODUTOS_GRAVITY: Record<string, string[]> = {

  'simula-custo':  ['nf-importacao', 'bid-frete'],

  'nf-importacao': ['simula-custo', 'bid-frete', 'pedido'],

  'bid-frete':     ['simula-custo', 'nf-importacao', 'bid-cambio', 'pedido'],

  'bid-cambio':    ['pedido', 'nf-importacao', 'bid-frete'],

  'pedido':        ['bid-cambio', 'bid-frete', 'nf-importacao'],

}



export const STACK_ORDER = STACK_ORDER_PRODUTOS_GRAVITY


