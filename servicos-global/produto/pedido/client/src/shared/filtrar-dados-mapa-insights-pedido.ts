/**
 * Filtros do mapa Insights do Pedido — operação, origem/destino (país),
 * exportador, importador e status do pedido.
 */

import type { Pedido } from './types'
import {
  resolverPaisDestinoPedidoMapa,
  resolverPaisOrigemPedidoMapa,
  type FornecedorMapaGeo,
  type VisaoGeralMapaData,
} from './visaoGeralMapaPedido'

export type FiltroOperacaoMapaInsightsPedido = 'importacao' | 'exportacao'

export type FiltrosMapaInsightsPedido = {
  operacao: ReadonlySet<FiltroOperacaoMapaInsightsPedido>
  paises_origem: ReadonlySet<string>
  paises_destino: ReadonlySet<string>
  exportadores: ReadonlySet<string>
  importadores: ReadonlySet<string>
  status: ReadonlySet<string>
}

export interface ItemListaFiltroMapaPedido {
  id: string
  label: string
  flag?: string
  quantidade: number
}

export const FILTROS_OPERACAO_MAPA_INSIGHTS_PEDIDO: ReadonlyArray<{
  id: FiltroOperacaoMapaInsightsPedido
  label: string
  tooltipDescricao: string
}> = [
  {
    id: 'importacao',
    label: 'Importação',
    tooltipDescricao: 'Pedidos com origem fora do Brasil e destino no Brasil',
  },
  {
    id: 'exportacao',
    label: 'Exportação',
    tooltipDescricao: 'Pedidos com origem no Brasil e destino no exterior',
  },
]

export const OPERACOES_FILTRO_MAPA_INSIGHTS_PEDIDO = ['importacao', 'exportacao'] as const

export const SECOES_FILTRO_MAPA_INSIGHTS_PEDIDO = [
  'operacao',
  'origem',
  'destino',
  'exportador',
  'importador',
  'status',
] as const

export type SecaoFiltroMapaInsightsPedidoId = (typeof SECOES_FILTRO_MAPA_INSIGHTS_PEDIDO)[number]

export function filtrosMapaInsightsPedidoIniciais(): FiltrosMapaInsightsPedido {
  return {
    operacao: new Set(),
    paises_origem: new Set(),
    paises_destino: new Set(),
    exportadores: new Set(),
    importadores: new Set(),
    status: new Set(),
  }
}

/** Estado ainda não inicializado (antes do primeiro sync com todos os itens). */
export function estaFiltrosMapaPedidoSemInicializar(filtros: FiltrosMapaInsightsPedido): boolean {
  return (
    filtros.operacao.size === 0 &&
    filtros.paises_origem.size === 0 &&
    filtros.paises_destino.size === 0 &&
    filtros.exportadores.size === 0 &&
    filtros.importadores.size === 0 &&
    filtros.status.size === 0
  )
}

export function montarFiltrosMapaPedidoTodos(
  pedidos: readonly Pedido[],
  fornecedoresPorId: ReadonlyMap<string, FornecedorMapaGeo>,
  flagsPorPais: ReadonlyMap<string, string> = new Map(),
  rotulosPorStatus: ReadonlyMap<string, string> = new Map(),
  coresPorStatus: ReadonlyMap<string, string> = new Map(),
): FiltrosMapaInsightsPedido {
  const paisesOrigem = listarPaisesOrigemPedidoMapa(pedidos, fornecedoresPorId, flagsPorPais)
  const paisesDestino = listarPaisesDestinoPedidoMapa(pedidos, fornecedoresPorId, flagsPorPais)
  const exportadores = listarExportadoresPedidoMapa(pedidos)
  const importadores = listarImportadoresPedidoMapa(pedidos)
  const statusOpcoes = listarStatusPedidoMapa(pedidos, rotulosPorStatus, coresPorStatus)

  return {
    operacao: new Set(OPERACOES_FILTRO_MAPA_INSIGHTS_PEDIDO),
    paises_origem: new Set(paisesOrigem.map((item) => item.id)),
    paises_destino: new Set(paisesDestino.map((item) => item.id)),
    exportadores: new Set(exportadores.map((item) => item.id)),
    importadores: new Set(importadores.map((item) => item.id)),
    status: new Set(statusOpcoes.map((item) => item.id)),
  }
}

/** Todos os cards de operação ativos = sem restrição (opt-out, paridade BID Frete). */
function operacaoSemRestricao(filtros: ReadonlySet<FiltroOperacaoMapaInsightsPedido>): boolean {
  return OPERACOES_FILTRO_MAPA_INSIGHTS_PEDIDO.every((op) => filtros.has(op))
}

/** Operação marcada quando está no conjunto selecionado. */
export function operacaoFiltroMapaPedidoSelecionada(
  filtros: ReadonlySet<FiltroOperacaoMapaInsightsPedido>,
  id: FiltroOperacaoMapaInsightsPedido,
): boolean {
  return filtros.has(id)
}

function dimensaoOptInSemRestricao(selecionados: ReadonlySet<string>, total: number): boolean {
  if (total === 0) return true
  return selecionados.size >= total
}

function dimensaoComSelecaoRestrita(selecionados: ReadonlySet<string>, total: number): boolean {
  if (total === 0) return false
  return selecionados.size < total
}

/** Item marcado quando o id está explicitamente selecionado. */
export function itemFiltroMapaPedidoSelecionado(
  selecionados: ReadonlySet<string>,
  _total: number,
  id: string,
): boolean {
  return selecionados.has(id)
}

export function contarFiltrosMapaPedidoAtivos(
  filtros: FiltrosMapaInsightsPedido,
  opcoes?: {
    total_paises_origem?: number
    total_paises_destino?: number
    total_exportadores?: number
    total_importadores?: number
    total_status?: number
  },
): number {
  const operacoesDesligadas = OPERACOES_FILTRO_MAPA_INSIGHTS_PEDIDO.filter(
    (op) => !filtros.operacao.has(op),
  ).length

  const totalOrigem = opcoes?.total_paises_origem ?? 0
  const totalDestino = opcoes?.total_paises_destino ?? 0
  const totalExportadores = opcoes?.total_exportadores ?? 0
  const totalImportadores = opcoes?.total_importadores ?? 0
  const totalStatus = opcoes?.total_status ?? 0

  const origemRestrita = dimensaoComSelecaoRestrita(filtros.paises_origem, totalOrigem)
  const destinoRestrito = dimensaoComSelecaoRestrita(filtros.paises_destino, totalDestino)
  const exportadorRestrito = dimensaoComSelecaoRestrita(filtros.exportadores, totalExportadores)
  const importadorRestrito = dimensaoComSelecaoRestrita(filtros.importadores, totalImportadores)
  const statusRestrito = dimensaoComSelecaoRestrita(filtros.status, totalStatus)

  const pesoDimensao = (selecionados: ReadonlySet<string>, total: number): number => {
    if (total === 0 || selecionados.size >= total) return 0
    return selecionados.size === 0 ? total : selecionados.size
  }

  return (
    operacoesDesligadas +
    pesoDimensao(filtros.paises_origem, totalOrigem) +
    pesoDimensao(filtros.paises_destino, totalDestino) +
    pesoDimensao(filtros.exportadores, totalExportadores) +
    pesoDimensao(filtros.importadores, totalImportadores) +
    pesoDimensao(filtros.status, totalStatus)
  )
}

function normalizarChaveLista(valor: string): string {
  return valor.trim()
}

export function listarPaisesOrigemPedidoMapa(
  pedidos: readonly Pedido[],
  fornecedoresPorId: ReadonlyMap<string, FornecedorMapaGeo>,
  flagsPorPais: ReadonlyMap<string, string> = new Map(),
): ItemListaFiltroMapaPedido[] {
  const contagens = new Map<string, { label: string; flag: string; quantidade: number }>()

  for (const p of pedidos) {
    const pais = resolverPaisOrigemPedidoMapa(p, fornecedoresPorId)
    if (!pais) continue
    const id = normalizarChaveLista(pais)
    const existente = contagens.get(id)
    if (existente) {
      existente.quantidade += 1
      continue
    }
    contagens.set(id, {
      label: pais,
      flag: flagsPorPais.get(id) ?? '🌍',
      quantidade: 1,
    })
  }

  return [...contagens.entries()]
    .map(([id, item]) => ({
      id,
      label: item.label,
      flag: item.flag,
      quantidade: item.quantidade,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
}

export function listarPaisesDestinoPedidoMapa(
  pedidos: readonly Pedido[],
  fornecedoresPorId: ReadonlyMap<string, FornecedorMapaGeo>,
  flagsPorPais: ReadonlyMap<string, string> = new Map(),
): ItemListaFiltroMapaPedido[] {
  const contagens = new Map<string, { label: string; flag: string; quantidade: number }>()

  for (const p of pedidos) {
    const pais = resolverPaisDestinoPedidoMapa(p, fornecedoresPorId)
    if (!pais) continue
    const id = normalizarChaveLista(pais)
    const existente = contagens.get(id)
    if (existente) {
      existente.quantidade += 1
      continue
    }
    contagens.set(id, {
      label: pais,
      flag: flagsPorPais.get(id) ?? '🌍',
      quantidade: 1,
    })
  }

  return [...contagens.entries()]
    .map(([id, item]) => ({
      id,
      label: item.label,
      flag: item.flag,
      quantidade: item.quantidade,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
}

export function listarExportadoresPedidoMapa(pedidos: readonly Pedido[]): ItemListaFiltroMapaPedido[] {
  const contagens = new Map<string, number>()

  for (const p of pedidos) {
    const nome = p.nome_exportador?.trim()
    if (!nome) continue
    contagens.set(nome, (contagens.get(nome) ?? 0) + 1)
  }

  return [...contagens.entries()]
    .map(([nome, quantidade]) => ({ id: nome, label: nome, quantidade }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
}

export function listarImportadoresPedidoMapa(pedidos: readonly Pedido[]): ItemListaFiltroMapaPedido[] {
  const contagens = new Map<string, number>()

  for (const p of pedidos) {
    const nome = p.nome_importador?.trim()
    if (!nome) continue
    contagens.set(nome, (contagens.get(nome) ?? 0) + 1)
  }

  return [...contagens.entries()]
    .map(([nome, quantidade]) => ({ id: nome, label: nome, quantidade }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
}

export function listarStatusPedidoMapa(
  pedidos: readonly Pedido[],
  rotulosPorStatus: ReadonlyMap<string, string> = new Map(),
  coresPorStatus: ReadonlyMap<string, string> = new Map(),
): Array<ItemListaFiltroMapaPedido & { cor: string }> {
  const contagens = new Map<string, number>()

  for (const p of pedidos) {
    const status = p.status?.trim()
    if (!status) continue
    contagens.set(status, (contagens.get(status) ?? 0) + 1)
  }

  return [...contagens.entries()]
    .map(([status, quantidade]) => ({
      id: status,
      label: rotulosPorStatus.get(status) ?? status.replace(/_/g, ' '),
      cor: coresPorStatus.get(status) ?? '#94a3b8',
      quantidade,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
}

export function contarPedidosPorOperacaoMapaPedido(
  pedidos: readonly Pedido[],
): ReadonlyMap<FiltroOperacaoMapaInsightsPedido, number> {
  const contagens = new Map<FiltroOperacaoMapaInsightsPedido, number>()
  for (const p of pedidos) {
    const operacao = p.tipo_operacao
    if (operacao !== 'importacao' && operacao !== 'exportacao') continue
    contagens.set(operacao, (contagens.get(operacao) ?? 0) + 1)
  }
  return contagens
}

export function filtrarItensListaMapaPedidoPorBusca(
  itens: readonly ItemListaFiltroMapaPedido[],
  busca: string,
): ItemListaFiltroMapaPedido[] {
  const termos = busca
    .trim()
    .split(/[\s,;]+/)
    .map((termo) => termo.trim().toLowerCase())
    .filter(Boolean)

  if (termos.length === 0) return [...itens]

  return itens.filter((item) => {
    const texto = item.label.toLowerCase()
    return termos.every((termo) => texto.includes(termo))
  })
}

function pedidoAtendeFiltroOperacao(
  p: Pedido,
  filtros: ReadonlySet<FiltroOperacaoMapaInsightsPedido>,
): boolean {
  if (operacaoSemRestricao(filtros)) return true
  if (filtros.size === 0) return false
  return filtros.has(p.tipo_operacao)
}

function pedidoAtendeFiltroOptIn(
  valor: string | null | undefined,
  selecionados: ReadonlySet<string>,
  total: number,
): boolean {
  if (dimensaoOptInSemRestricao(selecionados, total)) return true
  if (selecionados.size === 0) return false
  const chave = valor?.trim()
  if (!chave) return false
  return selecionados.has(chave)
}

export function resolverTotaisFiltroMapaPedido(
  pedidos: readonly Pedido[],
  fornecedoresPorId: ReadonlyMap<string, FornecedorMapaGeo>,
  opcoes?: {
    total_paises_origem?: number
    total_paises_destino?: number
    total_exportadores?: number
    total_importadores?: number
    total_status?: number
  },
) {
  return {
    total_paises_origem:
      opcoes?.total_paises_origem ?? listarPaisesOrigemPedidoMapa(pedidos, fornecedoresPorId).length,
    total_paises_destino:
      opcoes?.total_paises_destino ?? listarPaisesDestinoPedidoMapa(pedidos, fornecedoresPorId).length,
    total_exportadores:
      opcoes?.total_exportadores ?? listarExportadoresPedidoMapa(pedidos).length,
    total_importadores:
      opcoes?.total_importadores ?? listarImportadoresPedidoMapa(pedidos).length,
    total_status:
      opcoes?.total_status ?? new Set(pedidos.map((p) => p.status?.trim()).filter(Boolean)).size,
  }
}

export function filtrarPedidosMapaInsights(
  pedidos: readonly Pedido[],
  filtros: FiltrosMapaInsightsPedido,
  fornecedoresPorId: ReadonlyMap<string, FornecedorMapaGeo>,
  opcoes?: {
    total_paises_origem?: number
    total_paises_destino?: number
    total_exportadores?: number
    total_importadores?: number
    total_status?: number
  },
): Pedido[] {
  const totais = resolverTotaisFiltroMapaPedido(pedidos, fornecedoresPorId, opcoes)

  if (contarFiltrosMapaPedidoAtivos(filtros, totais) === 0) {
    return [...pedidos]
  }

  const {
    total_paises_origem: totalOrigem,
    total_paises_destino: totalDestino,
    total_exportadores: totalExportadores,
    total_importadores: totalImportadores,
    total_status: totalStatus,
  } = totais

  return pedidos.filter((p) => {
    if (!pedidoAtendeFiltroOperacao(p, filtros.operacao)) return false

    const paisOrigem = resolverPaisOrigemPedidoMapa(p, fornecedoresPorId)
    if (!pedidoAtendeFiltroOptIn(paisOrigem, filtros.paises_origem, totalOrigem)) return false

    const paisDestino = resolverPaisDestinoPedidoMapa(p, fornecedoresPorId)
    if (!pedidoAtendeFiltroOptIn(paisDestino, filtros.paises_destino, totalDestino)) return false

    if (!pedidoAtendeFiltroOptIn(p.nome_exportador, filtros.exportadores, totalExportadores)) return false
    if (!pedidoAtendeFiltroOptIn(p.nome_importador, filtros.importadores, totalImportadores)) return false
    if (!pedidoAtendeFiltroOptIn(p.status, filtros.status, totalStatus)) return false

    return true
  })
}

export function montarFlagsPorPaisMapaPedido(mapa: VisaoGeralMapaData): Map<string, string> {
  const flags = new Map<string, string>()
  for (const pin of mapa.pins) {
    const id = pin.country.trim()
    if (!id || flags.has(id)) continue
    flags.set(id, pin.flag)
  }
  return flags
}
