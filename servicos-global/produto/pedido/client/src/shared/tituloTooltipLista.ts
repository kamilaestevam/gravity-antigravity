/**
 * tituloTooltipLista.ts — SSOT de títulos de tooltip na lista (sem React).
 * Consumido por TooltipListaColuna e buildTooltipRegraLista.
 */

import type { TFunction } from 'i18next'
import type { NivelColunaLista } from './regrasTooltipColunaLista'

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
