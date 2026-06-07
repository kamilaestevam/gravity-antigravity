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
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { obterPillsTooltipColuna, pillsParaNivelColuna } from './pillsTooltipColunaLista'
import { TooltipRegrasColuna } from './TooltipRegrasColuna'

type OpcoesMontarTooltipPills = {
  modoDinamicoPedidoItem?: boolean
  colunaPersonalizada?: boolean
  descricaoUsuario?: string
  aviso?: React.ReactNode
  /** Texto de aviso de impacto vindo da coluna (`avisoImpacto` — moeda, unidade, etc.). */
  avisoImpactoColuna?: string
  /** Em coluna dual, renderiza só o bloco pedido ou item (ex.: célula da linha do pedido). */
  somenteBloco?: 'pedido' | 'item'
}

/**
 * SSOT — pedido (pai) vs item (filho) na lista.
 * Usado por tooltipNivelCelula, tooltipDescricaoCelula e tooltipTituloCelula.
 * Sinais positivos de item têm prioridade (ex.: `_p` do PedidoItemEnriquecido).
 */
export function isLinhaItemLista(row: unknown): boolean {
  if (row == null || typeof row !== 'object') return false
  const r = row as Record<string, unknown>
  if (r._p != null && typeof r._p === 'object') return true
  if (typeof r.pedido_id === 'string' && r.pedido_id.length > 0) return true
  if (typeof r.sequencia_item === 'number') return true
  if (typeof r.part_number === 'string' && r.part_number.length > 0) return true
  if (typeof r.moeda_item === 'string' && r.moeda_item.length > 0) return true
  if (typeof r.numero_pedido === 'string' && r.numero_pedido.length > 0) return false
  return false
}

/** Título do tooltip de célula — mesma regra de nível que tooltipDescricaoCelula. */
export function tituloTooltipCelulaLista(
  t: TFunction,
  key: string,
  row: unknown,
  tituloPedido: string,
  tituloItem?: string,
): string {
  const ehItem = isLinhaItemLista(row)
  return tituloTooltipCelulaPorColuna(t, key, ehItem)
    ?? (ehItem && tituloItem ? tituloItem : tituloPedido)
}

function tituloTooltipCelulaPorColuna(
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
  return undefined
}

function avisoImpactoPorColuna(
  t: TFunction,
  key: string,
  nivel: NivelColunaLista,
  avisoImpactoColuna?: string,
): string | undefined {
  if (key === 'valor_por_unidade_item' && nivel === 'item') {
    return t('pedido.lista.regras_coluna.valor_unitario_item_impacto_moeda')
  }
  if (avisoImpactoColuna?.trim()) {
    return avisoImpactoColuna.trim()
  }
  return undefined
}

function nivelParaAvisoImpacto(
  opts: OpcoesMontarTooltipPills | undefined,
  nivel: NivelColunaLista,
): NivelColunaLista {
  if (opts?.somenteBloco === 'item') return 'item'
  if (opts?.somenteBloco === 'pedido') return 'pai'
  return nivel
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
        avisoImpacto={avisoImpactoPorColuna(t, key, nivelBloco, opts?.avisoImpactoColuna)}
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
        avisoImpacto={avisoImpactoPorColuna(t, key, nivelParaAvisoImpacto(opts, nivel), opts?.avisoImpactoColuna)}
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
      avisoImpacto={avisoImpactoPorColuna(t, key, nivel, opts?.avisoImpactoColuna)}
      descricaoExtra={opts?.descricaoUsuario?.trim() || descricaoExtraPorColuna(t, key, nivel) || undefined}
    />
  )
}

const CHAVES_TITULO_CELULA_PILOTO = new Set([
  'moeda_pedido',
  'valor_por_unidade_item',
  'valor_total_pedido',
  'quantidade_total_pedido',
  'quantidade_pronta_itens_pedido_total',
])

function usaTooltipPorNivelColuna(key: string, dual: boolean): boolean {
  return dual || CHAVES_TITULO_CELULA_PILOTO.has(key)
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
  const tituloValorTotalLinhaPedido =
    key === 'valor_total_pedido'
      ? t('pedido.coluna_pai.valor_total_pedido_titulo_linha_pedido')
      : null
  const tituloValorUnitarioLinhaPedido =
    key === 'valor_por_unidade_item'
      ? t('pedido.coluna_pai.valor_unitario_item_titulo_linha_pedido')
      : null
  const tituloMoedaLinhaPedido =
    key === 'moeda_pedido'
      ? t('pedido.coluna_pai.moeda_pedido_titulo_linha_pedido')
      : null
  const titulo = tituloValorTotalLinhaPedido
    ?? tituloValorUnitarioLinhaPedido
    ?? tituloMoedaLinhaPedido
    ?? (col.tooltipTitulo?.trim()
      ? col.tooltipTitulo
      : tituloTooltipColuna(t, key, 'pai', col.label))
  const tituloItem =
    key === 'valor_por_unidade_item'
      ? t('pedido.coluna_pai.valor_unitario_item_titulo')
      : key === 'valor_total_pedido'
        ? t('pedido.coluna_pai.valor_total_item_titulo')
        : key === 'moeda_pedido'
          ? t('pedido.coluna_pai.moeda_item_titulo')
          : undefined

  const pillsRes = obterPillsTooltipColuna(key, opts)
  const regraId = classificarRegraTooltipColuna(key, 'pai', opts)
  const optsMontar = {
    modoDinamicoPedidoItem: opts?.modoDinamicoPedidoItem,
    colunaPersonalizada: opts?.colunaPersonalizada,
    descricaoUsuario: opts?.descricaoUsuario,
    avisoImpactoColuna: col.avisoImpacto,
  }
  const usaPorNivel = usaTooltipPorNivelColuna(key, pillsRes.dual)
  const tooltipCelulaPedido = montarTooltipPills(t, key, {
    ...optsMontar,
    somenteBloco: usaPorNivel ? 'pedido' : undefined,
  }, 'pai')
  const tooltipCelulaItem = montarTooltipPills(t, key, {
    ...optsMontar,
    modoDinamicoPedidoItem: opts?.modoDinamicoPedidoItem,
    somenteBloco: usaPorNivel ? 'item' : undefined,
  }, 'item')

  return {
    ...col,
    tooltipTitulo: titulo,
    tooltipTituloItem: tituloItem,
    ...(usaPorNivel
      ? { tooltipNivelCelula: (row: T) => (isLinhaItemLista(row) ? 'item' : 'pedido') }
      : {}),
    tooltipTituloCelula: (row) => tituloTooltipCelulaLista(t, key, row, titulo, tituloItem),
    tooltipDescricao: usaPorNivel
      ? montarTooltipPills(t, key, { ...optsMontar, somenteBloco: 'pedido' })
      : montarTooltipPills(t, key, optsMontar),
    tooltipDescricaoItem: tooltipCelulaItem,
    tooltipDescricaoCelula: (row: T) => {
      const legado = col.tooltipDescricaoCelula?.(row)
      if (legado) return legado
      if (
        key === 'valor_total_pedido'
        || key === 'valor_por_unidade_item'
        || key === 'moeda_pedido'
        || key === 'quantidade_total_pedido'
        || key === 'quantidade_pronta_itens_pedido_total'
        || pillsRes.dual
      ) {
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

/** Tooltip inline na linha do pedido (célula bloqueada — padrão Tipo de Operação / Workspace no item). */
export function wrapCelulaPedidoBloqueadoLista(
  conteudo: React.ReactNode,
  t: TFunction,
  titulo: string,
  key: string,
  opts?: Pick<OpcoesMontarTooltipPills, 'avisoImpactoColuna' | 'modoDinamicoPedidoItem'>,
): React.ReactElement {
  return (
    <TooltipGlobal
      titulo={titulo}
      descricao={montarTooltipPills(t, key, {
        somenteBloco: 'pedido',
        avisoImpactoColuna: opts?.avisoImpactoColuna,
        modoDinamicoPedidoItem: opts?.modoDinamicoPedidoItem,
      }, 'pai')}
      cursorBloqueado
    >
      <span
        style={{
          display: 'flex',
          flex: 1,
          alignSelf: 'stretch',
          alignItems: 'center',
          justifyContent: 'inherit',
          minWidth: 0,
          width: '100%',
          cursor: 'not-allowed',
        }}
      >
        {conteudo}
      </span>
    </TooltipGlobal>
  )
}

/** Coluna pai bloqueada: render com tooltip inline + flag para o núcleo não duplicar wrap. */
export function aplicarRenderTooltipInlinePedido<T>(
  col: GTColuna<T>,
  enriched: GTColuna<T>,
  t: TFunction,
  opts?: Pick<OpcoesEnriquecerTooltip, 'modoDinamicoPedidoItem'>,
): GTColuna<T> {
  const renderBase = enriched.render ?? col.render
  const titulo = enriched.tooltipTitulo?.trim() || col.label
  const key = String(col.key)
  return {
    ...enriched,
    tooltipInline: true,
    render: (val: unknown, row: T) => wrapCelulaPedidoBloqueadoLista(
      renderBase ? renderBase(val, row) : null,
      t,
      titulo,
      key,
      {
        avisoImpactoColuna: col.avisoImpacto,
        modoDinamicoPedidoItem: opts?.modoDinamicoPedidoItem,
      },
    ),
  }
}

/** Tooltip da moeda na linha item — título e pills fixos (bypass do resolver do núcleo). */
export function montarTooltipMoedaItemLista(t: TFunction, avisoImpactoColuna?: string): React.ReactNode {
  return montarTooltipPills(t, 'moeda_pedido', {
    somenteBloco: 'item',
    avisoImpactoColuna,
  }, 'item')
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
