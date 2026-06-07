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
import { TooltipRegrasColuna } from './TooltipRegrasColuna'

type OpcoesMontarTooltipPills = {
  modoDinamicoPedidoItem?: boolean
  colunaPersonalizada?: boolean
  descricaoUsuario?: string
  aviso?: React.ReactNode
  /** Em coluna dual, renderiza só o bloco pedido ou item (ex.: célula da linha do pedido). */
  somenteBloco?: 'pedido' | 'item'
}

function isLinhaItemLista(row: unknown): boolean {
  if (row == null || typeof row !== 'object') return false
  const pedidoId = (row as { pedido_id?: unknown }).pedido_id
  return typeof pedidoId === 'string' && pedidoId.length > 0
}

function descricaoExtraPorColuna(t: TFunction, key: string, nivel: NivelColunaLista): string | undefined {
  if (key === 'valor_total_pedido' && nivel === 'item') {
    return t('pedido.lista.regras_coluna.valor_item_impacto_moeda')
  }
  return undefined
}

function montarTooltipPills(
  t: TFunction,
  key: string,
  opts?: OpcoesMontarTooltipPills,
  nivel: NivelColunaLista = 'pai',
): React.ReactNode {
  const res = obterPillsTooltipColuna(key, {
    modoDinamicoPedidoItem: opts?.modoDinamicoPedidoItem,
    colunaPersonalizada: opts?.colunaPersonalizada,
  })

  if (opts?.somenteBloco) {
    const nivelBloco = opts.somenteBloco === 'item' ? 'item' : 'pai'
    const pills = opts.somenteBloco === 'item' ? res.item : res.pedido
    return (
      <TooltipRegrasColuna
        t={t}
        pillsPedido={pills}
        linkFormula={res.linkFormula}
        ghostSemCheckbox={res.ghostSemCheckbox && nivelBloco === 'pai'}
        numeroUnicoOrg={res.numeroUnicoOrg && nivelBloco === 'pai'}
        aviso={opts?.aviso}
        descricaoExtra={opts?.descricaoUsuario?.trim() || descricaoExtraPorColuna(t, key, nivelBloco) || undefined}
      />
    )
  }

  if (res.dual) {
    return (
      <TooltipRegrasColuna
        t={t}
        dual
        pillsPedido={res.pedido}
        pillsItem={res.item}
        linkFormula={res.linkFormula}
        ghostSemCheckbox={res.ghostSemCheckbox}
        numeroUnicoOrg={res.numeroUnicoOrg}
        aviso={opts?.aviso}
        descricaoExtra={opts?.descricaoUsuario?.trim() || descricaoExtraPorColuna(t, key, 'item') || undefined}
      />
    )
  }

  const pills = nivel === 'item' ? res.item : res.pedido
  return (
    <TooltipRegrasColuna
      t={t}
      pillsPedido={pills}
      linkFormula={res.linkFormula}
      ghostSemCheckbox={res.ghostSemCheckbox && nivel === 'pai'}
      numeroUnicoOrg={res.numeroUnicoOrg && nivel === 'pai'}
      aviso={opts?.aviso}
      descricaoExtra={opts?.descricaoUsuario?.trim() || descricaoExtraPorColuna(t, key, nivel) || undefined}
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
  const tituloValorItem =
    key === 'valor_total_pedido' && col.label?.trim() ? col.label.trim() : null
  const titulo = tituloValorItem
    ?? (col.tooltipTitulo?.trim()
      ? col.tooltipTitulo
      : tituloTooltipColuna(t, key, 'pai', col.label))

  const pillsRes = obterPillsTooltipColuna(key, opts)
  const regraId = classificarRegraTooltipColuna(key, 'pai', opts)
  const optsMontar = {
    modoDinamicoPedidoItem: opts?.modoDinamicoPedidoItem,
    colunaPersonalizada: opts?.colunaPersonalizada,
    descricaoUsuario: opts?.descricaoUsuario,
  }
  const tooltipCelulaPedido = montarTooltipPills(t, key, {
    ...optsMontar,
    somenteBloco: pillsRes.dual ? 'pedido' : undefined,
  }, 'pai')
  const tooltipCelulaItem = montarTooltipPills(t, key, {
    ...optsMontar,
    modoDinamicoPedidoItem: opts?.modoDinamicoPedidoItem,
    somenteBloco: pillsRes.dual ? 'item' : undefined,
  }, 'item')

  return {
    ...col,
    tooltipTitulo: titulo,
    tooltipDescricao: montarTooltipPills(t, key, optsMontar),
    tooltipDescricaoItem: tooltipCelulaItem,
    tooltipDescricaoCelula: (row: T) => {
      const legado = col.tooltipDescricaoCelula?.(row)
      if (legado) return legado
      if (key === 'valor_total_pedido' || key === 'valor_por_unidade_item' || pillsRes.dual) {
        if (isLinhaItemLista(row)) return tooltipCelulaItem
        return tooltipCelulaPedido
      }
      return undefined
    },
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
