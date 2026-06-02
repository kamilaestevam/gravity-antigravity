/**
 * buildTooltipRegraLista.tsx — Tooltips da lista com pílulas de regra (ícone + cor + texto).
 */

import React from 'react'
import type { TFunction } from 'i18next'
import type { GTColuna, GTMapaColunasFilho } from '@nucleo/tabela-virtual-global'
import {
  classificarRegraTooltipColuna,
  regraTooltipEhInterativa,
  type NivelColunaLista,
  type RegraTooltipId,
} from './regrasTooltipColunaLista'
import { obterPillsTooltipColuna, pillsParaNivelColuna } from './pillsTooltipColunaLista'
import type { RegraPillId } from './pillsTooltipColunaLista'
import { TooltipRegrasColuna } from './TooltipRegrasColuna'

function montarTooltipPills(
  t: TFunction,
  key: string,
  opts?: {
    modoDinamicoPedidoItem?: boolean
    colunaPersonalizada?: boolean
    descricaoUsuario?: string
    aviso?: React.ReactNode
  },
): React.ReactNode {
  const res = obterPillsTooltipColuna(key, {
    modoDinamicoPedidoItem: opts?.modoDinamicoPedidoItem,
    colunaPersonalizada: opts?.colunaPersonalizada,
  })

  return (
    <TooltipRegrasColuna
      t={t}
      dual={res.dual}
      pillsPedido={res.pedido}
      pillsItem={res.item}
      linkFormula={res.linkFormula}
      ghostSemCheckbox={res.ghostSemCheckbox}
      numeroUnicoOrg={res.numeroUnicoOrg}
      aviso={opts?.aviso}
      descricaoExtra={opts?.descricaoUsuario?.trim() || undefined}
    />
  )
}

/** Título padrão: label da coluna ou i18n legado. */
export function tituloTooltipColuna(
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

export type OpcoesEnriquecerTooltip = {
  modoDinamicoPedidoItem?: boolean
  descricaoUsuario?: string
  colunaPersonalizada?: boolean
}

/** Aplica tooltip de regras UX na coluna (cabeçalho e células alinhadas). */
export function enriquecerColunaComRegraTooltip<T>(
  col: GTColuna<T>,
  t: TFunction,
  _nivel: NivelColunaLista,
  opts?: OpcoesEnriquecerTooltip,
): GTColuna<T> {
  const key = String(col.key)
  const titulo = col.tooltipTitulo?.trim()
    ? col.tooltipTitulo
    : tituloTooltipColuna(t, key, 'pai', col.label)

  const pillsRes = obterPillsTooltipColuna(key, opts)
  const regraId = classificarRegraTooltipColuna(key, 'pai', opts)

  return {
    ...col,
    tooltipTitulo: titulo,
    tooltipDescricao: montarTooltipPills(t, key, {
      modoDinamicoPedidoItem: opts?.modoDinamicoPedidoItem,
      colunaPersonalizada: opts?.colunaPersonalizada,
      descricaoUsuario: opts?.descricaoUsuario,
    }),
    tooltipDescricaoItem: pillsRes.dual
      ? (
        <TooltipRegrasColuna
          t={t}
          pillsPedido={pillsRes.item}
          linkFormula={pillsRes.linkFormula}
        />
      )
      : montarTooltipPills(t, key, { ...opts, modoDinamicoPedidoItem: false }),
    tooltipInterativo: regraTooltipEhInterativa(regraId) || col.tooltipInterativo,
  }
}

export function enriquecerColunasComRegraTooltip<T>(
  colunas: GTColuna<T>[],
  t: TFunction,
  nivel: NivelColunaLista,
  opts?: OpcoesEnriquecerTooltip,
): GTColuna<T>[] {
  return colunas.map(c => enriquecerColunaComRegraTooltip(c, t, nivel, opts))
}

/** Texto plano para tooltipBloqueado em células de item. */
export function textoRegraTooltipPlain(t: TFunction, key: string, nivel: NivelColunaLista = 'item'): string {
  const pills = pillsParaNivelColuna(key, nivel)
  return pills.map(id => t(`pedido.lista.regras_pill.${id}`)).join(' · ')
}

const REGRAS_BLOQUEIO_ITEM = new Set<RegraTooltipId>([
  'item_nao_editavel_saldo',
  'item_nao_editavel_transferencia',
  'item_nao_editavel_cancelamento',
  'item_nao_editavel_padrao',
  'item_cond_exportador',
  'item_cond_importador',
])

/** Mensagem em células de item bloqueadas. */
export function enriquecerMapaColunasFilhoComRegraTooltip<C>(
  mapa: Record<string, GTMapaColunasFilho<C>>,
  t: TFunction,
): Record<string, GTMapaColunasFilho<C>> {
  const out: Record<string, GTMapaColunasFilho<C>> = { ...mapa }
  for (const key of Object.keys(out)) {
    const entry = out[key]
    if (!entry || entry.tooltipBloqueado != null) continue
    const regraId = classificarRegraTooltipColuna(key, 'item')
    if (!REGRAS_BLOQUEIO_ITEM.has(regraId)) continue
    out[key] = {
      ...entry,
      tooltipBloqueado: textoRegraTooltipPlain(t, key, 'item'),
    }
  }
  return out
}

/** Monta tooltip de célula com aviso de divergência + pílulas. */
export function montarTooltipCelulaComAviso(
  t: TFunction,
  key: string,
  aviso: React.ReactNode,
  opts?: OpcoesEnriquecerTooltip,
): React.ReactNode {
  return montarTooltipPills(t, key, { ...opts, aviso })
}
