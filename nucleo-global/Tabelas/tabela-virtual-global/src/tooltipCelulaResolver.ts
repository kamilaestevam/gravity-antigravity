/**
 * SSOT — resolução de tooltip de regra por célula (pedido vs item).
 * O produto define `tooltipNivelCelula` + `tooltipTituloCelula` + `tooltipDescricaoCelula`
 * com o mesmo critério de linha; o núcleo não usa `isFilho` da renderização quando
 * `tooltipNivelCelula` está presente.
 */

import type { ReactNode } from 'react'
import type { GTColuna } from './tipos'

export function resolverNivelTooltipCelula(
  col: GTColuna<unknown>,
  item: unknown,
  isFilhoRender: boolean,
): boolean {
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
  return isFilhoRender
}

export function resolverTituloTooltipCelula(
  col: GTColuna<unknown>,
  item: unknown,
  isFilhoRender: boolean,
): string {
  const ehItem = resolverNivelTooltipCelula(col, item, isFilhoRender)
  const tituloPedido = col.tooltipTitulo?.trim()
  const tituloItem = col.tooltipTituloItem?.trim()

  if (col.tooltipTituloCelula) {
    const tituloCelula = col.tooltipTituloCelula(item)?.trim()
    if (tituloCelula) {
      if (ehItem && tituloItem && tituloPedido && tituloCelula === tituloPedido) {
        return tituloItem
      }
      return tituloCelula
    }
  }
  if (ehItem && tituloItem) return tituloItem
  if (tituloPedido) return tituloPedido
  return col.label
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
  return {
    titulo: resolverTituloTooltipCelula(col, item, isFilhoRender),
    descricao,
    interativo: col.tooltipInterativo,
  }
}
