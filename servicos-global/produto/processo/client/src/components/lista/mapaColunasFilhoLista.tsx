/**
 * mapaColunasFilhoLista — mapa pedido/item para linhas filhas da lista 3 camadas.
 * Colunas avô vazias; colunas pedido preenchidas na linha PEDIDO; item via mapa do Pedido.
 */
import React from 'react'
import type { GTColuna, GTMapaColunasFilho } from '@nucleo/tabela-virtual-global'
import type { Pedido, PedidoItem } from '../../shared/lista/pedidoTypes'
import type { FilhoLinhaLista } from '../../shared/lista/mockListaHierarquica'
import { buildMapaColunasFilho } from './ColunasFilho'
import type { OpcoesUnidadesColunas } from './ColunasPai'
import { CAMPOS_DERIVADOS_PAI } from '../../shared/lista/processoListaColunasConfig'

type ItemEnriquecido = PedidoItem & {
  _p?: Partial<Pedido> & { tipo_operacao?: string; nome_exportador?: string; nome_importador?: string; moeda_pedido?: string; status?: string }
}

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

function pedidoEditavel(colPedido: GTColuna<Pedido> | undefined, key: string): boolean {
  if (!colPedido) return false
  if (CAMPOS_DERIVADOS_PAI.has(key)) return false
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

  function enriquecerItem(item: PedidoItem): ItemEnriquecido {
    const pai = resolverPedido(item.pedido_id)
    return { ...item, _p: pai }
  }

  return {
    ...entrada,
    campo: entrada?.campo ?? campoPedido,
    opcoes: entrada?.opcoes ?? colPedido?.opcoes,
    unidades: entrada?.unidades ?? (colPedido as GTColuna<Pedido> & { unidades?: GTMapaColunasFilho<PedidoItem>['unidades'] })?.unidades,
    casasDecimais: entrada?.casasDecimais ?? (colPedido as GTColuna<Pedido> & { casasDecimais?: number })?.casasDecimais,
    editavel: (filho) => {
      if (filho.camada === 'pedido') return pedidoEditavel(colPedido, key)
      if (!entrada?.editavel) return false
      const item = enriquecerItem(filho.item)
      return typeof entrada.editavel === 'function' ? entrada.editavel(item) : !!entrada.editavel
    },
    tooltipBloqueado: entrada?.tooltipBloqueado
      ? (filho) => {
          if (filho.camada === 'pedido') return undefined
          const item = enriquecerItem(filho.item)
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
      return entrada.getValorEditar(enriquecerItem(filho.item))
    },
    render: (filho) => {
      if (filho.camada === 'pedido') {
        if (colPedido) return renderCelulaPedido(colPedido, filho.pedido)
        const val = (filho.pedido as Record<string, unknown>)[key]
        if (val == null || val === '') return celulaVaziaFilho()
        return String(val)
      }
      if (entrada?.render) {
        return entrada.render(enriquecerItem(filho.item))
      }
      const campo = entrada?.campo ?? key
      const val = (filho.item as Record<string, unknown>)[campo]
      if (val == null || val === '') return celulaVaziaFilho()
      if (typeof val === 'object') return '—'
      return String(val)
    },
  }
}

export function buildMapaColunasFilhoLista(
  chavesAvo: ReadonlySet<string>,
  colunasPedido: GTColuna<Pedido>[],
  opcoes: OpcoesUnidadesColunas,
  resolverPedido: (id_pedido: string) => Pedido | undefined,
): Record<string, GTMapaColunasFilho<FilhoLinhaLista>> {
  const mapaItem = buildMapaColunasFilho(opcoes)
  const colunasPedidoPorChave = new Map(colunasPedido.map(c => [c.key as string, c]))
  const resultado: Record<string, GTMapaColunasFilho<FilhoLinhaLista>> = {}

  for (const chave of chavesAvo) {
    resultado[chave] = { render: () => celulaVaziaFilho() }
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
