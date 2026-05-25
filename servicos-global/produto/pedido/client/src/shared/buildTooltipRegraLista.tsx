/**
 * buildTooltipRegraLista.tsx — Textos de tooltip com regras de edição/alerta/cálculo.
 * Toda coluna da lista recebe tooltipTitulo + tooltipDescricao (desligável via shell).
 */

import React from 'react'
import { Trans } from 'react-i18next'
import type { TFunction } from 'i18next'
import type { GTColuna, GTMapaColunasFilho } from '@nucleo/tabela-virtual-global'
import {
  classificarRegraTooltipColuna,
  regraTooltipEhInterativa,
  type NivelColunaLista,
  type RegraTooltipId,
} from './regrasTooltipColunaLista'

const URL_FORMULA = '/produto/pedido/configuracoes?tab=colunas-campos-calculados'

const REGRAS_INTERATIVAS = new Set<RegraTooltipId>([
  'pai_saldo_formula',
  'item_nao_editavel_saldo',
  'dinamico_saldo',
])

function chaveI18nExiste(t: TFunction, key: string): boolean {
  const v = t(key, { defaultValue: '__missing__' })
  return v !== '__missing__' && v !== key
}

function descricaoRegra(t: TFunction, id: RegraTooltipId): React.ReactNode {
  const key = `pedido.lista.regras_coluna.${id}`
  if (REGRAS_INTERATIVAS.has(id)) {
    return (
      <span>
        <Trans i18nKey={key} components={{ a: <a href={URL_FORMULA} /> }} />
      </span>
    )
  }
  return <span>{t(key)}</span>
}

/** Textos legados (coluna_pai / coluna_filho) — cobertura total enquanto regras novas expandem. */
export function descricaoLegadaColuna(
  t: TFunction,
  key: string,
  _nivel: NivelColunaLista,
): string | null {
  const candidatos = [
    `pedido.coluna_pai.${key}_desc`,
    `pedido.coluna_filho.${key}.tooltip_descricao`,
    `pedido.coluna_filho.mapa_${key}.tooltip_descricao`,
  ]
  for (const k of candidatos) {
    if (chaveI18nExiste(t, k)) return t(k)
  }
  return null
}

function resolverDescricaoTooltip<T>(
  col: GTColuna<T>,
  t: TFunction,
  key: string,
  nivel: NivelColunaLista,
  regraId: RegraTooltipId,
  opts?: { descricaoUsuario?: string },
): React.ReactNode {
  const descricaoUsuario = opts?.descricaoUsuario?.trim()
    ?? (typeof col.tooltipDescricao === 'string' ? col.tooltipDescricao.trim() : '')

  const usarRegra = regraId !== 'generico' && chaveI18nExiste(t, `pedido.lista.regras_coluna.${regraId}`)
  if (usarRegra) {
    const base = descricaoRegra(t, regraId)
    if (descricaoUsuario && regraId === 'pai_coluna_personalizada') {
      return (
        <span>
          {base} — {descricaoUsuario}
        </span>
      )
    }
    return base
  }

  const legado = descricaoLegadaColuna(t, key, nivel)
  if (legado) return legado

  if (descricaoUsuario) {
    return (
      <span>
        {t('pedido.lista.regras_coluna.pai_coluna_personalizada')} — {descricaoUsuario}
      </span>
    )
  }

  return descricaoRegra(t, 'generico')
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
  /** Descrição da coluna personalizada (Configurador). */
  descricaoUsuario?: string
  /** Coluna criada pelo usuário — prioriza regra de coluna personalizada. */
  colunaPersonalizada?: boolean
}

/** Aplica tooltip de regras UX na coluna (cabeçalho — vale para pedido e itens alinhados). */
export function enriquecerColunaComRegraTooltip<T>(
  col: GTColuna<T>,
  t: TFunction,
  nivel: NivelColunaLista,
  opts?: OpcoesEnriquecerTooltip,
): GTColuna<T> {
  const key = String(col.key)
  const regraId = classificarRegraTooltipColuna(key, nivel, {
    modoDinamicoPedidoItem: opts?.modoDinamicoPedidoItem,
  })
  const idFinal: RegraTooltipId = opts?.colunaPersonalizada ? 'pai_coluna_personalizada' : regraId

  const titulo = col.tooltipTitulo?.trim()
    ? col.tooltipTitulo
    : tituloTooltipColuna(t, key, nivel, col.label)

  const regraIdItem = classificarRegraTooltipColuna(key, 'item', {
    modoDinamicoPedidoItem: opts?.modoDinamicoPedidoItem,
  })

  return {
    ...col,
    tooltipTitulo: titulo,
    tooltipDescricao: resolverDescricaoTooltip(col, t, key, nivel, idFinal, {
      descricaoUsuario: opts?.descricaoUsuario,
    }),
    tooltipDescricaoItem: resolverDescricaoTooltip(col, t, key, 'item', regraIdItem, {
      descricaoUsuario: opts?.descricaoUsuario,
    }),
    tooltipInterativo:
      regraTooltipEhInterativa(idFinal)
      || regraTooltipEhInterativa(regraIdItem)
      || col.tooltipInterativo,
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

/** Texto plano da regra (sem HTML) — para tooltipBloqueado em células de item. */
export function textoRegraTooltipPlain(t: TFunction, id: RegraTooltipId): string {
  return t(`pedido.lista.regras_coluna.${id}`).replace(/<[^>]+>/g, '').trim()
}

const REGRAS_BLOQUEIO_ITEM = new Set<RegraTooltipId>([
  'item_nao_editavel_saldo',
  'item_nao_editavel_transferencia',
  'item_nao_editavel_cancelamento',
  'item_nao_editavel_padrao',
  'item_cond_exportador',
  'item_cond_importador',
])

/** Mensagem extra em células de item bloqueadas (prioridade no núcleo sobre tooltipDescricaoItem). */
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
    const legado = descricaoLegadaColuna(t, key, 'item')
    out[key] = {
      ...entry,
      tooltipBloqueado: legado ?? textoRegraTooltipPlain(t, regraId),
    }
  }
  return out
}
