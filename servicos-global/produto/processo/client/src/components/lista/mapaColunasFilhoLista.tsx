/**
 * mapaColunasFilhoLista — mapa pedido/item para linhas filhas da lista 3 camadas.
 * Colunas avô vazias; colunas pedido preenchidas na linha PEDIDO; item via mapa do Pedido.
 */
import React from 'react'
import type { TFunction } from 'i18next'
import type { GTColuna, GTMapaColunasFilho } from '@nucleo/tabela-virtual-global'
import type { Pedido, PedidoItem } from '../../shared/lista/pedidoTypes'
import type { FilhoLinhaLista } from '../../shared/lista/mockListaHierarquica'
import { buildMapaColunasFilho } from './ColunasFilho'
import type { OpcoesUnidadesColunas } from './ColunasPai'
import { CAMPOS_DERIVADOS_PAI } from '../../shared/lista/processoListaColunasConfig'
import { getEditavel } from '../../shared/lista/columnBehaviorConfig'
import { enriquecerMapaColunasFilhoComRegraTooltip } from '../../shared/lista/buildTooltipRegraLista'
import { enriquecerItemComPai } from '../../shared/lista/useEdicaoListaProcesso'
import {
  COLUNA_AVO_PARA_CAMPO_ITEM,
  COLUNA_AVO_PARA_CAMPO_PEDIDO,
  COLUNAS_AVO_VAZIAS_EM_FILHO,
} from '../../shared/lista/processoColunaAvoFilhoMap'
import { CelulaIdentidadeItemLista } from './CelulaIdentidadeItemLista'

/** Coluna avô onde L3 exibe identidade do item (badge + PN + descrição). */
const CHAVE_AVO_IDENTIDADE_ITEM = 'numero_processo'

function celulaVaziaFilho() {
  return <span className="pl-celula-vazia">—</span>
}

function campoColunaPedido(col: GTColuna<Pedido>): string {
  const comCampo = col as GTColuna<Pedido> & { campo?: string }
  return comCampo.campo ?? (col.key as string)
}

function renderCelulaPedido(col: GTColuna<Pedido>, pedido: Pedido): React.ReactNode {
  if (col.render) {
    const campo = campoColunaPedido(col)
    const val = (pedido as Record<string, unknown>)[campo]
    return col.render(val, pedido)
  }
  const val = (pedido as Record<string, unknown>)[campoColunaPedido(col)]
  if (val == null || val === '') return celulaVaziaFilho()
  if (typeof val === 'object') return '—'
  return String(val)
}

function pedidoEditavel(colPedido: GTColuna<Pedido> | undefined, key: string, pedido: Pedido): boolean {
  if (!colPedido) return false
  if (CAMPOS_DERIVADOS_PAI.has(key)) return false
  const editavelCfg = getEditavel(key)
  if (typeof editavelCfg === 'function') return editavelCfg(pedido)
  if (editavelCfg === false) return false
  return colPedido.editavel !== false
}

function wrapEntradaMapa(
  key: string,
  entrada: GTMapaColunasFilho<PedidoItem> | undefined,
  colunasPedidoPorChave: Map<string, GTColuna<Pedido>>,
  resolverPedido: (id_pedido: string) => Pedido | undefined,
): GTMapaColunasFilho<FilhoLinhaLista> {
  const colPedido = colunasPedidoPorChave.get(key)
  const campoPedido = colPedido ? campoColunaPedido(colPedido) : key

  return {
    ...entrada,
    campo: entrada?.campo ?? campoPedido,
    opcoes: entrada?.opcoes ?? colPedido?.opcoes,
    unidades: entrada?.unidades ?? (colPedido as GTColuna<Pedido> & { unidades?: GTMapaColunasFilho<PedidoItem>['unidades'] })?.unidades,
    casasDecimais: entrada?.casasDecimais ?? (colPedido as GTColuna<Pedido> & { casasDecimais?: number })?.casasDecimais,
    editavel: (filho) => {
      if (filho.camada === 'pedido') return pedidoEditavel(colPedido, key, filho.pedido)
      if (!entrada?.editavel) return false
      const item = enriquecerItemComPai(filho.item, resolverPedido(filho.item.pedido_id) ?? filho.item as unknown as Pedido)
      return typeof entrada.editavel === 'function' ? entrada.editavel(item) : !!entrada.editavel
    },
    tooltipBloqueado: entrada?.tooltipBloqueado
      ? (filho) => {
          if (filho.camada === 'pedido') return undefined
          const pedido = resolverPedido(filho.item.pedido_id)
          if (!pedido) return undefined
          const item = enriquecerItemComPai(filho.item, pedido)
          return typeof entrada.tooltipBloqueado === 'function'
            ? entrada.tooltipBloqueado(item)
            : entrada.tooltipBloqueado
        }
      : undefined,
    getValorEditar: (filho) => {
      if (filho.camada === 'pedido') {
        if (colPedido?.getValorEditar) return colPedido.getValorEditar(filho.pedido)
        return (filho.pedido as Record<string, unknown>)[campoPedido]
      }
      if (!entrada?.getValorEditar) return undefined
      const pedido = resolverPedido(filho.item.pedido_id)
      if (!pedido) return undefined
      return entrada.getValorEditar(enriquecerItemComPai(filho.item, pedido))
    },
    render: (filho) => {
      if (filho.camada === 'pedido') {
        if (colPedido) return renderCelulaPedido(colPedido, filho.pedido)
        const val = (filho.pedido as Record<string, unknown>)[key]
        if (val == null || val === '') return celulaVaziaFilho()
        return String(val)
      }
      const pedido = resolverPedido(filho.item.pedido_id)
      if (entrada?.render && pedido) {
        return entrada.render(enriquecerItemComPai(filho.item, pedido))
      }
      const campo = entrada?.campo ?? key
      const val = (filho.item as Record<string, unknown>)[campo]
      if (val == null || val === '') return celulaVaziaFilho()
      if (typeof val === 'object') return '—'
      return String(val)
    },
  }
}

function wrapEntradaMapaColunaAvo(
  chaveAvo: string,
  chavePedido: string,
  chaveItem: string | undefined,
  entrada: GTMapaColunasFilho<PedidoItem> | undefined,
  colunasPedidoPorChave: Map<string, GTColuna<Pedido>>,
  resolverPedido: (id_pedido: string) => Pedido | undefined,
): GTMapaColunasFilho<FilhoLinhaLista> {
  const base = wrapEntradaMapa(chavePedido, entrada, colunasPedidoPorChave, resolverPedido)
  return {
    ...base,
    /** TVG usa col.key (avô) na edição; handleEditarFilho resolve o alias */
    campo: chaveAvo,
    render: (filho) => {
      if (filho.camada === 'pedido') {
        const colPedido = colunasPedidoPorChave.get(chavePedido)
        const conteudo = colPedido
          ? renderCelulaPedido(colPedido, filho.pedido)
          : (() => {
              const val = (filho.pedido as Record<string, unknown>)[chavePedido]
              if (val == null || val === '') return celulaVaziaFilho()
              return String(val)
            })()
        if (chaveAvo === CHAVE_AVO_IDENTIDADE_ITEM) {
          return <span className="pl-pedido-identidade">{conteudo}</span>
        }
        return conteudo
      }
      if (chaveAvo === CHAVE_AVO_IDENTIDADE_ITEM) {
        return <CelulaIdentidadeItemLista item={filho.item} />
      }
      if (!chaveItem) return celulaVaziaFilho()
      const pedido = resolverPedido(filho.item.pedido_id)
      if (entrada?.render && pedido) {
        return entrada.render(enriquecerItemComPai(filho.item, pedido))
      }
      const val = (filho.item as Record<string, unknown>)[chaveItem]
      if (val == null || val === '') return celulaVaziaFilho()
      if (typeof val === 'object') return '—'
      return String(val)
    },
    getValorEditar: (filho) => {
      if (filho.camada === 'pedido') {
        const colPedido = colunasPedidoPorChave.get(chavePedido)
        if (colPedido?.getValorEditar) return colPedido.getValorEditar(filho.pedido)
        return (filho.pedido as Record<string, unknown>)[chavePedido]
      }
      if (!chaveItem) return undefined
      const pedido = resolverPedido(filho.item.pedido_id)
      if (entrada?.getValorEditar && pedido) {
        return entrada.getValorEditar(enriquecerItemComPai(filho.item, pedido))
      }
      return (filho.item as Record<string, unknown>)[chaveItem]
    },
    editavel: (filho) => {
      if (filho.camada === 'pedido') {
        const colPedido = colunasPedidoPorChave.get(chavePedido)
        return pedidoEditavel(colPedido, chavePedido, filho.pedido)
      }
      if (!chaveItem) return false
      if (entrada?.editavel) {
        const pedido = resolverPedido(filho.item.pedido_id)
        if (!pedido) return false
        const item = enriquecerItemComPai(filho.item, pedido)
        return typeof entrada.editavel === 'function' ? entrada.editavel(item) : !!entrada.editavel
      }
      return false
    },
  }
}

export function buildMapaColunasFilhoLista(
  t: TFunction,
  chavesAvo: ReadonlySet<string>,
  colunasPedido: GTColuna<Pedido>[],
  opcoes: OpcoesUnidadesColunas,
  resolverPedido: (id_pedido: string) => Pedido | undefined,
): Record<string, GTMapaColunasFilho<FilhoLinhaLista>> {
  const mapaItem = enriquecerMapaColunasFilhoComRegraTooltip(
    buildMapaColunasFilho(t, opcoes),
    t,
  )
  const colunasPedidoPorChave = new Map(colunasPedido.map(c => [c.key as string, c]))
  const resultado: Record<string, GTMapaColunasFilho<FilhoLinhaLista>> = {}

  for (const chave of chavesAvo) {
    if (COLUNAS_AVO_VAZIAS_EM_FILHO.has(chave)) {
      resultado[chave] = { render: () => celulaVaziaFilho() }
      continue
    }
    const chavePedido = COLUNA_AVO_PARA_CAMPO_PEDIDO[chave]
    if (chavePedido) {
      const chaveItem = COLUNA_AVO_PARA_CAMPO_ITEM[chave]
      resultado[chave] = wrapEntradaMapaColunaAvo(
        chave,
        chavePedido,
        chaveItem,
        mapaItem[chavePedido] ?? mapaItem[chaveItem ?? ''],
        colunasPedidoPorChave,
        resolverPedido,
      )
      continue
    }
    if (colunasPedidoPorChave.has(chave) || mapaItem[chave]) {
      resultado[chave] = wrapEntradaMapa(chave, mapaItem[chave], colunasPedidoPorChave, resolverPedido)
    } else {
      resultado[chave] = { render: () => celulaVaziaFilho() }
    }
  }

  const chavesPedido = new Set<string>([
    ...Object.keys(mapaItem),
    ...colunasPedido.map(c => c.key as string),
  ])

  for (const chave of chavesPedido) {
    if (chavesAvo.has(chave)) continue
    resultado[chave] = wrapEntradaMapa(chave, mapaItem[chave], colunasPedidoPorChave, resolverPedido)
  }

  return resultado
}
