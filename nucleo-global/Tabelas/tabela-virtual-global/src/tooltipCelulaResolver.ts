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
  if (tituloOverrideTrim) return tituloOverrideTrim

  const tituloItemCol = col.tooltipTituloItem?.trim()
  const tituloPedidoCol = col.tooltipTitulo?.trim()

  // Linha filha GTV: título de item vence sempre (mapa filho, coluna pai ou tooltipTituloCelula).
  if (isFilhoRender) {
    if (tituloItemCol) return tituloItemCol
    if (item != null) {
      const tituloCelula = col.tooltipTituloCelula?.(item)?.trim()
      if (tituloCelula) return tituloCelula
      const tituloResolvido = resolverTituloTooltipCelula(col, item, true)
      if (tituloResolvido) return tituloResolvido
    }
  }

  if (tituloItemCol && col.tooltipDescricaoItem != null && regra.descricao === col.tooltipDescricaoItem) {
    return tituloItemCol
  }
  if (tituloItemCol && tituloPedidoCol && regra.titulo === tituloPedidoCol) return tituloItemCol
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
