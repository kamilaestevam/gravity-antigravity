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
import { TooltipListaColuna } from './TooltipListaColuna'
import { TooltipRegrasColuna } from './TooltipRegrasColuna'
import {
  tituloTooltipCelulaPorColuna,
  tituloTooltipColunaFallback,
  tituloTooltipListaPorNivel,
} from './tituloTooltipLista'

export { tituloTooltipListaPorNivel } from './tituloTooltipLista'

/** Render original da célula — preservado para re-aplicar TooltipListaColuna sem duplo wrap. */
type ColunaComRenderListaBase<T> = GTColuna<T> & {
  renderListaBase?: GTColuna<T>['render']
}

/** Remove metadados que o núcleo usa para wrapTooltipRegraCelula — célula usa só TooltipListaColuna. */
function semMetadadosTooltipCelulaNucleo<T>(col: GTColuna<T>): GTColuna<T> {
  const {
    tooltipTituloItem: _ti,
    tooltipDescricaoItem: _di,
    tooltipTituloCelula: _tc,
    tooltipDescricaoCelula: _dc,
    tooltipNivelCelula: _nc,
    ...rest
  } = col
  return rest
}

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

function avisoImpactoPorColuna(
  t: TFunction,
  key: string,
  nivel: NivelColunaLista,
  avisoImpactoColuna?: string,
): string | undefined {
  if (key === 'valor_por_unidade_item' && nivel === 'item') {
    return t('pedido.lista.regras_coluna.valor_unitario_item_impacto_moeda')
  }
  if (key === 'valor_total_pedido' && (nivel === 'pai' || nivel === 'item')) {
    return t('pedido.lista.regras_coluna.valor_total_item_impacto_moeda_edicao')
  }
  if (key === 'quantidade_transferida_total') {
    return t('pedido.lista.regras_coluna.quantidade_transferida_edicao_via_transferir')
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

function pillsResolucaoLista(
  t: TFunction,
  key: string,
  nivel: NivelColunaLista,
  opts?: OpcoesMontarTooltipPills,
) {
  const res = obterPillsTooltipColuna(key, {
    modoDinamicoPedidoItem: opts?.modoDinamicoPedidoItem,
    colunaPersonalizada: opts?.colunaPersonalizada,
  })
  const nivelBloco = opts?.somenteBloco === 'item' ? 'item' : opts?.somenteBloco === 'pedido' ? 'pai' : nivel
  const pills = opts?.somenteBloco === 'item'
    ? res.item
    : opts?.somenteBloco === 'pedido'
      ? res.pedido
      : (nivel === 'item' ? res.item : res.pedido)
  return {
    res,
    pills,
    nivelBloco,
    avisoImpacto: avisoImpactoPorColuna(t, key, nivelBloco, opts?.avisoImpactoColuna),
    descricaoExtra: opts?.descricaoUsuario?.trim() || undefined,
  }
}

/** Corpo de pills (cabeçalho da coluna — núcleo ainda monta o shell). */
function montarTooltipPills(
  t: TFunction,
  key: string,
  opts?: OpcoesMontarTooltipPills,
  nivel: NivelColunaLista = 'pai',
): React.ReactNode {
  const { res, pills, nivelBloco, avisoImpacto, descricaoExtra } = pillsResolucaoLista(t, key, nivel, opts)

  if (res.dual && !opts?.somenteBloco) {
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
        descricaoExtra={descricaoExtra}
      />
    )
  }

  return (
    <TooltipRegrasColuna
      t={t}
      pillsPedido={pills}
      linkFormula={res.linkFormula}
      ghostSemCheckbox={res.ghostSemCheckbox && nivelBloco === 'pai'}
      numeroUnicoOrg={res.numeroUnicoOrg && nivelBloco === 'pai'}
      aviso={opts?.aviso}
      avisoImpacto={avisoImpacto}
      descricaoExtra={descricaoExtra}
    />
  )
}

/** Colunas com tooltip montada pelo Pedido (`tooltipInline`) — núcleo não envolve a célula. */
export const CHAVES_TOOLTIP_INLINE_LISTA = new Set([
  'moeda_pedido',
  'unidade_comercializada_pedido',
  'valor_por_unidade_item',
  'valor_total_pedido',
  'quantidade_total_pedido',
  'quantidade_pronta_itens_pedido_total',
  'quantidade_transferida_total',
  'quantidade_cancelada_total_pedido',
  'saldo_itens_do_pedido',
  'peso_liquido_total_pedido',
  'peso_bruto_total_pedido',
  'cubagem_total_pedido',
  'moeda_cambio_pedido',
  'taxa_cambio_estimada',
  'valor_total_cambio_pedido',
  'quantidade_volumes_pedido',
  'nome_importador',
  'nome_exportador',
])

/** Colunas bloqueadas na linha do item — cursor + tooltip inline com pills. */
export const CHAVES_COLUNA_INLINE_BLOQUEADA_ITEM = new Set([
  'quantidade_transferida_total',
  'quantidade_cancelada_total_pedido',
  'saldo_itens_do_pedido',
])

/** `cursor: not-allowed` na célula — bloqueio fixo ou condicional (`editavel` função). */
export function resolverCursorBloqueadoCelulaLista<T>(
  col: GTColuna<T>,
  row: T,
): boolean {
  if (col.editavel === false) return true
  if (typeof col.editavel === 'function') return !col.editavel(row)
  return false
}

/** Bloqueio na linha item via mapaColunasFilho (`editavel: false` ou chave SSOT). */
export function resolverCursorBloqueadoMapaFilho<C>(
  key: string,
  entry: GTMapaColunasFilho<C> | undefined,
  row: C,
): boolean {
  if (CHAVES_COLUNA_INLINE_BLOQUEADA_ITEM.has(key)) return true
  if (entry?.editavel === false) return true
  if (typeof entry?.editavel === 'function') return !entry.editavel(row)
  return false
}

const CHAVES_TITULO_CELULA_PILOTO = CHAVES_TOOLTIP_INLINE_LISTA

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
  return tituloTooltipColunaFallback(t, key, nivel, labelFallback)
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
  const tituloUnidadeLinhaPedido =
    key === 'unidade_comercializada_pedido'
      ? t('pedido.coluna_pai.unidade_comercializada_titulo_linha_pedido')
      : null
  const tituloQtdTransferidaLinhaPedido =
    key === 'quantidade_transferida_total'
      ? t('pedido.coluna_pai.quantidade_transferida_total_titulo_linha_pedido')
      : null
  const tituloSaldoLinhaPedido =
    key === 'saldo_itens_do_pedido'
      ? t('pedido.coluna_pai.saldo_itens_do_pedido_titulo_linha_pedido')
      : null
  const titulo = tituloValorTotalLinhaPedido
    ?? tituloValorUnitarioLinhaPedido
    ?? tituloMoedaLinhaPedido
    ?? tituloUnidadeLinhaPedido
    ?? tituloQtdTransferidaLinhaPedido
    ?? tituloSaldoLinhaPedido
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
          : key === 'unidade_comercializada_pedido'
            ? t('pedido.coluna_pai.unidade_comercializada_item_titulo')
            : key === 'quantidade_transferida_total'
              ? t('pedido.coluna_pai.quantidade_transferida_item_titulo')
              : key === 'saldo_itens_do_pedido'
                ? t('pedido.coluna_pai.saldo_item_titulo')
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

  const tooltipInterativo = regraTooltipEhInterativa(regraId) || col.tooltipInterativo
  const tooltipDescricaoCabecalho = usaPorNivel
    ? montarTooltipPills(t, key, { ...optsMontar, somenteBloco: 'pedido' })
    : montarTooltipPills(t, key, optsMontar)

  // Colunas piloto: célula = TooltipListaColuna; cabeçalho = tooltipTitulo + tooltipDescricao apenas.
  if (CHAVES_TOOLTIP_INLINE_LISTA.has(key) || CHAVES_COLUNA_INLINE_BLOQUEADA_PEDIDO.has(key)) {
    return aplicarRenderTooltipInlineLista(
      col,
      {
        ...col,
        tooltipTitulo: titulo,
        ...(tituloItem ? { tooltipTituloItem: tituloItem } : {}),
        tooltipDescricao: tooltipDescricaoCabecalho,
        tooltipInterativo,
      },
      t,
      {
        modoDinamicoPedidoItem: opts?.modoDinamicoPedidoItem,
        cursorBloqueado: (row: T) => resolverCursorBloqueadoCelulaLista(col, row),
      },
    )
  }

  const enriched: GTColuna<T> = {
    ...col,
    tooltipTitulo: titulo,
    tooltipTituloItem: tituloItem,
    ...(usaPorNivel
      ? { tooltipNivelCelula: (row: T) => (isLinhaItemLista(row) ? 'item' : 'pedido') }
      : {}),
    tooltipTituloCelula: (row) => tituloTooltipCelulaLista(t, key, row, titulo, tituloItem),
    tooltipDescricao: tooltipDescricaoCabecalho,
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
        || key === 'quantidade_transferida_total'
        || key === 'quantidade_cancelada_total_pedido'
        || key === 'saldo_itens_do_pedido'
        || key === 'peso_liquido_total_pedido'
        || key === 'peso_bruto_total_pedido'
        || key === 'cubagem_total_pedido'
        || key === 'moeda_cambio_pedido'
        || key === 'taxa_cambio_estimada'
        || key === 'valor_total_cambio_pedido'
        || key === 'quantidade_volumes_pedido'
        || key === 'nome_importador'
        || key === 'nome_exportador'
        || pillsRes.dual
      ) {
        if (isLinhaItemLista(row)) return tooltipCelulaItem
        return tooltipCelulaPedido
      }
      return undefined
    },
    tooltipInterativo,
  }

  return enriched
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

export type OpcoesWrapCelulaListaRegras = {
  key: string
  nivel: NivelColunaLista
  avisoImpactoColuna?: string
  modoDinamicoPedidoItem?: boolean
  colunaPersonalizada?: boolean
  descricaoUsuario?: string
  interativo?: boolean
  cursorBloqueado?: boolean
}

/** SSOT — tooltip completa de célula na lista (título + pills + aviso). */
export function wrapCelulaListaRegras(
  conteudo: React.ReactNode,
  t: TFunction,
  opts: OpcoesWrapCelulaListaRegras,
): React.ReactElement {
  const somenteBloco = opts.nivel === 'item' ? 'item' as const : 'pedido' as const
  const { res, pills, nivelBloco, avisoImpacto, descricaoExtra } = pillsResolucaoLista(
    t,
    opts.key,
    opts.nivel,
    {
      somenteBloco,
      avisoImpactoColuna: opts.avisoImpactoColuna,
      modoDinamicoPedidoItem: opts.modoDinamicoPedidoItem,
      colunaPersonalizada: opts.colunaPersonalizada,
      descricaoUsuario: opts.descricaoUsuario,
    },
  )

  return (
    <TooltipListaColuna
      colunaKey={opts.key}
      nivel={opts.nivel}
      t={t}
      pills={pills}
      linkFormula={res.linkFormula}
      ghostSemCheckbox={res.ghostSemCheckbox && nivelBloco === 'pai'}
      numeroUnicoOrg={res.numeroUnicoOrg && nivelBloco === 'pai'}
      avisoImpacto={avisoImpacto}
      descricaoExtra={descricaoExtra}
      interativo={opts.interativo}
      cursorBloqueado={opts.cursorBloqueado}
    >
      {conteudo}
    </TooltipListaColuna>
  )
}

/** Coluna com tooltip montada no render — núcleo não aplica segundo wrap (`tooltipInline`). */
export function aplicarRenderTooltipInlineLista<T>(
  col: GTColuna<T>,
  enriched: GTColuna<T>,
  t: TFunction,
  opts?: Pick<OpcoesEnriquecerTooltip, 'modoDinamicoPedidoItem'> & {
    cursorBloqueado?: boolean | ((row: T) => boolean)
  },
): GTColuna<T> {
  const colExt = col as ColunaComRenderListaBase<T>
  const renderBase = colExt.renderListaBase ?? enriched.render ?? col.render
  const key = String(col.key)
  const interativo = enriched.tooltipInterativo

  const tituloItemCol = enriched.tooltipTituloItem?.trim()
  const colInline: ColunaComRenderListaBase<T> = {
    ...semMetadadosTooltipCelulaNucleo(enriched),
    ...(tituloItemCol ? { tooltipTituloItem: tituloItemCol } : {}),
    tooltipInline: true,
    renderListaBase: renderBase,
    render: (val: unknown, row: T) => {
      const nivel: NivelColunaLista = isLinhaItemLista(row) ? 'item' : 'pai'
      const conteudo = renderBase ? renderBase(val, row) : null
      const bloqueado = typeof opts?.cursorBloqueado === 'function'
        ? opts.cursorBloqueado(row)
        : (opts?.cursorBloqueado ?? false)
      return wrapCelulaListaRegras(conteudo, t, {
        key,
        nivel,
        avisoImpactoColuna: col.avisoImpacto,
        modoDinamicoPedidoItem: opts?.modoDinamicoPedidoItem,
        interativo,
        cursorBloqueado: bloqueado,
      })
    },
  }
  return colInline
}

/** @deprecated Use aplicarRenderTooltipInlineLista */
export function aplicarRenderTooltipInlinePedido<T>(
  col: GTColuna<T>,
  enriched: GTColuna<T>,
  t: TFunction,
  opts?: Pick<OpcoesEnriquecerTooltip, 'modoDinamicoPedidoItem'>,
): GTColuna<T> {
  return aplicarRenderTooltipInlineLista(col, enriched, t, {
    ...opts,
    cursorBloqueado: true,
  })
}

/** Colunas calculadas/bloqueadas na linha do pedido — tooltip inline (padrão Qtd. Inicial). */
export const CHAVES_COLUNA_INLINE_BLOQUEADA_PEDIDO = new Set([
  'quantidade_total_pedido',
  'quantidade_pronta_itens_pedido_total',
  'valor_total_pedido',
  'valor_por_unidade_item',
  'quantidade_transferida_total',
  'quantidade_cancelada_total_pedido',
  'saldo_itens_do_pedido',
  'peso_liquido_total_pedido',
  'peso_bruto_total_pedido',
  'cubagem_total_pedido',
  'moeda_cambio_pedido',
  'taxa_cambio_estimada',
  'valor_total_cambio_pedido',
  'quantidade_volumes_pedido',
])

/** Aplica `TooltipListaColuna` no render de entradas do mapaColunasFilho (linha item). */
export function enriquecerMapaFilhoTooltipInline<C>(
  mapa: Record<string, GTMapaColunasFilho<C>>,
  t: TFunction,
  keys: Iterable<string> = CHAVES_TOOLTIP_INLINE_LISTA,
  avisosPorChave?: Record<string, string | undefined>,
): Record<string, GTMapaColunasFilho<C>> {
  const out: Record<string, GTMapaColunasFilho<C>> = { ...mapa }
  for (const key of keys) {
    const entry = out[key]
    if (!entry?.render) continue
    const renderBase = entry.render
    const aviso = avisosPorChave?.[key]
    const tituloItem = tituloTooltipListaPorNivel(t, key, 'item')
    const regraItem = classificarRegraTooltipColuna(key, 'item')
    const interativoItem = regraTooltipEhInterativa(regraItem)
    out[key] = {
      ...entry,
      ...(CHAVES_COLUNA_INLINE_BLOQUEADA_ITEM.has(key) ? { editavel: false as const } : {}),
      tooltipInline: true,
      tooltipTitulo: tituloItem,
      render: (row: C) => {
        const conteudo = renderBase(row)
        const bloqueado = resolverCursorBloqueadoMapaFilho(key, entry, row)
        return wrapCelulaListaRegras(conteudo, t, {
          key,
          nivel: 'item',
          avisoImpactoColuna: aviso,
          cursorBloqueado: bloqueado,
          interativo: interativoItem,
        })
      },
    }
  }
  return out
}

/** Enriquece coluna pai bloqueada + render inline com pills e cursor not-allowed. */
export function enriquecerColunaBloqueadaInlinePedido<T>(
  col: GTColuna<T>,
  t: TFunction,
  opts?: { label?: string; modoDinamicoPedidoItem?: boolean },
): GTColuna<T> {
  return enriquecerColunaComRegraTooltip(
    {
      ...col,
      ...(opts?.label ? { label: opts.label } : {}),
      editavel: false,
    },
    t,
    'pai',
    opts?.modoDinamicoPedidoItem ? { modoDinamicoPedidoItem: true } : undefined,
  )
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
