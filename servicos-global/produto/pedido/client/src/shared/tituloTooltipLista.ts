/**
 * tituloTooltipLista.ts — SSOT de títulos de tooltip na lista (sem React).
 * Consumido por TooltipListaColuna e buildTooltipRegraLista.
 */

import type { TFunction } from 'i18next'
import type { NivelColunaLista } from './regrasTooltipColunaLista'
import { isChaveColunaAnexo } from './anexoColunaLista'

/** SSOT — datas replicáveis pedido→item na lista (ColunasPai + mapa filho Pedidos.tsx). */
export const CAMPOS_DATA_REPLICAVEIS_LISTA = [
  'data_prevista_pedido_pronto',
  'data_confirmada_pedido_pronto',
  'data_meta_pedido_pronto',
  'data_prevista_inspecao_pedido',
  'data_confirmada_inspecao_pedido',
  'data_meta_inspecao_pedido',
  'data_prevista_coleta_pedido',
  'data_confirmada_coleta_pedido',
  'data_meta_coleta_pedido',
  'data_consolidacao_pedido',
  'data_transferencia_saldo_pedido',
  'data_prevista_recebimento_rascunho_pedido',
  'data_confirmada_recebimento_rascunho_pedido',
  'data_meta_recebimento_rascunho_pedido',
  'data_prevista_aprovacao_rascunho_pedido',
  'data_confirmada_aprovacao_rascunho_pedido',
  'data_meta_aprovacao_rascunho_pedido',
  'data_documento_pedido',
  'data_documento_proforma',
  'data_documento_invoice',
  'data_prevista_recebimento_rascunho_proforma',
  'data_confirmada_recebimento_rascunho_proforma',
  'data_meta_recebimento_rascunho_proforma',
  'data_prevista_aprovacao_rascunho_proforma',
  'data_confirmada_aprovacao_rascunho_proforma',
  'data_meta_aprovacao_rascunho_proforma',
  'data_prevista_envio_original_proforma',
  'data_confirmada_envio_original_proforma',
  'data_meta_envio_original_proforma',
  'data_prevista_recebimento_original_proforma',
  'data_confirmada_recebimento_original_proforma',
  'data_meta_recebimento_original_proforma',
  'data_prevista_recebimento_rascunho_invoice',
  'data_confirmada_recebimento_rascunho_invoice',
  'data_meta_recebimento_rascunho_invoice',
  'data_prevista_aprovacao_rascunho_invoice',
  'data_confirmada_aprovacao_rascunho_invoice',
  'data_meta_aprovacao_rascunho_invoice',
  'data_prevista_envio_original_invoice',
  'data_confirmada_envio_original_invoice',
  'data_meta_envio_original_invoice',
  'data_prevista_recebimento_original_invoice',
  'data_confirmada_recebimento_original_invoice',
  'data_meta_recebimento_original_invoice',
] as const

export type CampoDataReplicavelLista = (typeof CAMPOS_DATA_REPLICAVEIS_LISTA)[number]

export function ehCampoDataReplicavelLista(key: string): key is CampoDataReplicavelLista {
  return (CAMPOS_DATA_REPLICAVEIS_LISTA as readonly string[]).includes(key)
}

export function tituloTooltipPedidoDataReplicavel(t: TFunction, key: string): string | undefined {
  const titulo = t(`pedido.coluna_pai.${key}_titulo`, { defaultValue: '' })
  return titulo.trim() ? titulo : undefined
}

/** Deriva título item a partir do título pedido quando não há `{key}_item_titulo` explícito. */
export function derivarTituloItemDeTituloPedido(tituloPedido: string): string {
  return tituloPedido
    .replace(/Pedido Pronto/g, 'Item Pronto')
    .replace(/Pedido Listo/g, 'Ítem Listo')
    .replace(/ do Pedido/g, ' do Item')
    .replace(/ del Pedido/g, ' del Ítem')
    .replace(/ de Pedido/g, ' de Ítem')
    .replace(/Draft Pedido/g, 'Draft Ítem')
    .replace(/Order Ready/g, 'Item Ready')
    .replace(/Draft Order/g, 'Draft Item')
    .replace(/Order Consolidation Date/g, 'Item Consolidation Date')
    .replace(/Order Document Date/g, 'Item Document Date')
    .replace(/ of the Order/g, ' of the Item')
}

export function tituloTooltipItemDataReplicavel(t: TFunction, key: string): string | undefined {
  const explicito = t(`pedido.coluna_pai.${key}_item_titulo`, { defaultValue: '' })
  if (explicito.trim()) return explicito
  const pedido = tituloTooltipPedidoDataReplicavel(t, key)
  if (!pedido) return undefined
  return derivarTituloItemDeTituloPedido(pedido)
}

export function tituloTooltipPedidoAnexo(t: TFunction, key: string): string | undefined {
  const titulo = t(`pedido.coluna_pai.${key}_titulo`, { defaultValue: '' })
  return titulo.trim() ? titulo : undefined
}

export function tituloTooltipItemAnexo(t: TFunction, key: string): string | undefined {
  const explicito = t(`pedido.coluna_pai.${key}_item_titulo`, { defaultValue: '' })
  if (explicito.trim()) return explicito
  const filho = t(`pedido.coluna_filho.${key}.tooltip_titulo_item`, { defaultValue: '' })
  if (filho.trim()) return filho
  const pedido = tituloTooltipPedidoAnexo(t, key)
  if (!pedido) return undefined
  return derivarTituloItemDeTituloPedido(pedido)
}

/** Texto explicativo abaixo das pills no tooltip de colunas anexo. */
export function descricaoTooltipColunaAnexo(t: TFunction, key: string): string | undefined {
  const desc = t(`pedido.coluna_pai.${key}_desc`, { defaultValue: '' })
  return desc.trim() ? desc : undefined
}

export function tituloTooltipCelulaPorColuna(
  t: TFunction,
  key: string,
  isFilho: boolean,
): string | undefined {
  if (key === 'moeda_pedido') {
    return isFilho
      ? t('pedido.coluna_pai.moeda_item_titulo')
      : t('pedido.coluna_pai.moeda_pedido_titulo_linha_pedido')
  }
  if (key === 'valor_por_unidade_item') {
    return isFilho
      ? t('pedido.coluna_pai.valor_unitario_item_titulo')
      : t('pedido.coluna_pai.valor_unitario_item_titulo_linha_pedido')
  }
  if (key === 'valor_total_pedido') {
    return isFilho
      ? t('pedido.coluna_pai.valor_total_item_titulo')
      : t('pedido.coluna_pai.valor_total_pedido_titulo_linha_pedido')
  }
  if (key === 'unidade_comercializada_pedido') {
    return isFilho
      ? t('pedido.coluna_pai.unidade_comercializada_item_titulo')
      : t('pedido.coluna_pai.unidade_comercializada_titulo_linha_pedido')
  }
  if (key === 'quantidade_transferida_total') {
    return isFilho
      ? t('pedido.coluna_pai.quantidade_transferida_item_titulo')
      : t('pedido.coluna_pai.quantidade_transferida_total_titulo_linha_pedido')
  }
  if (key === 'saldo_itens_do_pedido') {
    return isFilho
      ? t('pedido.coluna_pai.saldo_item_titulo')
      : t('pedido.coluna_pai.saldo_itens_do_pedido_titulo_linha_pedido')
  }
  if (key === 'quantidade_cancelada_total_pedido') {
    return isFilho
      ? t('pedido.coluna_pai.quantidade_cancelada_item_titulo')
      : t('pedido.coluna_pai.quantidade_cancelada_total_pedido_titulo_linha_pedido')
  }
  if (key === 'quantidade_volumes_pedido') {
    return isFilho
      ? t('pedido.coluna_pai.quantidade_volumes_pedido_item_titulo')
      : t('pedido.coluna_pai.quantidade_volumes_pedido_titulo')
  }
  if (key === 'tipo_volume_pedido') {
    return isFilho
      ? t('pedido.coluna_pai.tipo_volume_pedido_item_titulo')
      : t('pedido.coluna_pai.tipo_volume_pedido_titulo')
  }
  if (key === 'cobertura_cambial') {
    return isFilho
      ? t('pedido.coluna_pai.cobertura_cambial_item_titulo')
      : t('pedido.coluna_pai.cobertura_cambial_titulo_linha_pedido')
  }
  if (key === 'condicao_pagamento') {
    return isFilho
      ? t('pedido.coluna_pai.condicao_pagamento_item_titulo')
      : t('pedido.coluna_pai.condicao_pagamento_titulo_linha_pedido')
  }
  if (ehCampoDataReplicavelLista(key)) {
    return isFilho
      ? tituloTooltipItemDataReplicavel(t, key)
      : tituloTooltipPedidoDataReplicavel(t, key)
  }
  if (key === 'condicao_pagamento_siscomex') {
    return isFilho
      ? t('pedido.coluna_pai.condicao_pagamento_siscomex_item_titulo')
      : t('pedido.coluna_pai.condicao_pagamento_siscomex_titulo_linha_pedido')
  }
  if (key === 'peso_liquido_total_pedido') {
    return isFilho
      ? t('pedido.coluna_pai.peso_liquido_item_titulo')
      : t('pedido.coluna_pai.peso_liquido_total_pedido_titulo')
  }
  if (key === 'peso_bruto_total_pedido') {
    return isFilho
      ? t('pedido.coluna_pai.peso_bruto_item_titulo')
      : t('pedido.coluna_pai.peso_bruto_total_pedido_titulo')
  }
  if (isChaveColunaAnexo(key)) {
    return isFilho
      ? tituloTooltipItemAnexo(t, key)
      : tituloTooltipPedidoAnexo(t, key)
  }
  return undefined
}

export function tituloTooltipColunaFallback(
  t: TFunction,
  key: string,
  nivel: NivelColunaLista,
  labelFallback?: string,
): string {
  const prefix = nivel === 'pai' ? 'pedido.coluna_pai' : 'pedido.lista.coluna_item'
  const legadoTitulo = t(`${prefix}.${key}_titulo`, { defaultValue: '' })
  if (legadoTitulo) return legadoTitulo
  const legadoPai = t(`pedido.coluna_pai.${key}_titulo`, { defaultValue: '' })
  if (legadoPai) return legadoPai
  const legadoFilho = t(`pedido.coluna_filho.${key}.tooltip_titulo`, { defaultValue: '' })
  if (legadoFilho) return legadoFilho
  return labelFallback ?? t(`pedido.coluna_pai.${key}`, { defaultValue: key })
}

/** Título por coluna e nível — não usa heurística de row. */
export function tituloTooltipListaPorNivel(
  t: TFunction,
  key: string,
  nivel: NivelColunaLista,
): string {
  const isFilho = nivel === 'item'
  return tituloTooltipCelulaPorColuna(t, key, isFilho)
    ?? tituloTooltipColunaFallback(t, key, isFilho ? 'item' : 'pai')
}
