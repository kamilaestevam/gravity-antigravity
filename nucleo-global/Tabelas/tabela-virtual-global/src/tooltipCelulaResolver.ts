/**
 * SSOT — resolução de tooltip de regra por célula (pedido vs item).
 *
 * Regra inviolável da GTV: `isFilhoRender === true` (linha expandida) → nível ITEM
 * para título e descrição base. `tooltipNivelCelula` só atua na linha pai (`isFilhoRender === false`).
 */

import type { ReactNode } from 'react'
import type { GTColuna } from './tipos'

export function resolverNivelTooltipCelula(
  col: GTColuna<unknown>,
  item: unknown,
  isFilhoRender: boolean,
): boolean {
  if (isFilhoRender) return true
  if (col.tooltipNivelCelula) {
    return col.tooltipNivelCelula(item) === 'item'
  }
  const descricaoOverride = col.tooltipDescricaoCelula?.(item)
  if (descricaoOverride != null && descricaoOverride !== '') {
    if (col.tooltipDescricaoItem != null && descricaoOverride === col.tooltipDescricaoItem) {
      return true
    }
    if (col.tooltipDescricao != null && descricaoOverride === col.tooltipDescricao) {
      return false
    }
  }
  return false
}

export function resolverTituloTooltipCelula(
  col: GTColuna<unknown>,
  item: unknown,
  isFilhoRender: boolean,
): string {
  const tituloItem = col.tooltipTituloItem?.trim()
  const tituloPedido = col.tooltipTitulo?.trim()

  if (isFilhoRender && tituloItem) {
    return tituloItem
  }

  if (col.tooltipTituloCelula) {
    const tituloCelula = col.tooltipTituloCelula(item)?.trim()
    if (tituloCelula) {
      const ehItem = resolverNivelTooltipCelula(col, item, isFilhoRender)
      if (ehItem && tituloItem && tituloPedido && tituloCelula === tituloPedido) {
        return tituloItem
      }
      return tituloCelula
    }
  }

  const ehItem = resolverNivelTooltipCelula(col, item, isFilhoRender)
  if (ehItem && tituloItem) return tituloItem
  // Linha filha GTV: nunca propagar título de pedido quando metadata de item ausente
  if (isFilhoRender) return col.label
  if (tituloPedido) return tituloPedido
  return col.label
}

export function resolverTituloFinalTooltipCelula(
  col: GTColuna<unknown>,
  regra: { titulo: string; descricao: ReactNode },
  isFilhoRender: boolean,
  tituloOverride?: string,
  item?: unknown,
): string {
  const tituloOverrideTrim = tituloOverride?.trim()
  const tituloItemCol = col.tooltipTituloItem?.trim()
  const tituloPedidoCol = col.tooltipTitulo?.trim()
  const ehNivelItem = isFilhoRender
    || (item != null && resolverNivelTooltipCelula(col, item, isFilhoRender))

  // Linha filha GTV / célula de item: título de item vence título de pedido.
  if (ehNivelItem) {
    if (tituloItemCol) return tituloItemCol
    if (tituloOverrideTrim && tituloOverrideTrim !== tituloPedidoCol) return tituloOverrideTrim
    if (item != null) {
      const tituloCelula = col.tooltipTituloCelula?.(item)?.trim()
      if (tituloCelula && tituloCelula !== tituloPedidoCol) return tituloCelula
      if (tituloCelula && tituloItemCol) return tituloItemCol
      const tituloResolvido = resolverTituloTooltipCelula(col, item, true)
      if (tituloResolvido && tituloResolvido !== tituloPedidoCol) return tituloResolvido
    }
    if (tituloItemCol) return tituloItemCol
    if (tituloOverrideTrim && tituloOverrideTrim !== tituloPedidoCol) return tituloOverrideTrim
  }

  if (tituloOverrideTrim) return tituloOverrideTrim

  if (tituloItemCol && col.tooltipDescricaoItem != null && regra.descricao === col.tooltipDescricaoItem) {
    return tituloItemCol
  }
  if (tituloItemCol && tituloPedidoCol && regra.titulo === tituloPedidoCol) return tituloItemCol
  if (ehNivelItem && tituloPedidoCol && regra.titulo === tituloPedidoCol) {
    return tituloItemCol ?? col.label
  }
  return regra.titulo
}

export function resolverTooltipRegraCelula(
  col: GTColuna<unknown>,
  item: unknown,
  isFilhoRender: boolean,
): { titulo: string; descricao: ReactNode; interativo?: boolean } | null {
  const ehItem = resolverNivelTooltipCelula(col, item, isFilhoRender)
  const descricaoOverride = col.tooltipDescricaoCelula?.(item)
  const descricaoBase = ehItem
    ? (col.tooltipDescricaoItem ?? col.tooltipDescricao)
    : col.tooltipDescricao
  const descricao = descricaoOverride ?? descricaoBase
  if (descricao == null || descricao === '') return null
  const regraParcial = {
    titulo: resolverTituloTooltipCelula(col, item, isFilhoRender),
    descricao,
  }
  return {
    titulo: resolverTituloFinalTooltipCelula(col, regraParcial, isFilhoRender, undefined, item),
    descricao,
    interativo: col.tooltipInterativo,
  }
}
