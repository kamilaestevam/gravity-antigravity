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
    operacao: new Set(OPERACOES_FILTRO_MAPA_INSIGHTS_PEDIDO),
    paises_origem: new Set(),
    paises_destino: new Set(),
    exportadores: new Set(),
    importadores: new Set(),
    status: new Set(),
  }
}

function dimensaoOptInSemRestricao(selecionados: ReadonlySet<string>, total: number): boolean {
  if (total === 0) return true
  return selecionados.size === 0 || selecionados.size >= total
}

/** Item aparece marcado quando a dimensão está em "todos" ou o id está no conjunto. */
export function itemFiltroMapaPedidoSelecionado(
  selecionados: ReadonlySet<string>,
  total: number,
  id: string,
): boolean {
  return dimensaoOptInSemRestricao(selecionados, total) || selecionados.has(id)
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
  const operacoesDesligadas = OPERACOES_FILTRO_MAPA_INSIGHTS_PEDIDO
    .filter((f) => !filtros.operacao.has(f)).length

  const totalOrigem = opcoes?.total_paises_origem ?? 0
  const totalDestino = opcoes?.total_paises_destino ?? 0
  const totalExportadores = opcoes?.total_exportadores ?? 0
  const totalImportadores = opcoes?.total_importadores ?? 0
  const totalStatus = opcoes?.total_status ?? 0

  const origemRestrita = !dimensaoOptInSemRestricao(filtros.paises_origem, totalOrigem)
  const destinoRestrito = !dimensaoOptInSemRestricao(filtros.paises_destino, totalDestino)
  const exportadorRestrito = !dimensaoOptInSemRestricao(filtros.exportadores, totalExportadores)
  const importadorRestrito = !dimensaoOptInSemRestricao(filtros.importadores, totalImportadores)
  const statusRestrito = !dimensaoOptInSemRestricao(filtros.status, totalStatus)

  return (
    operacoesDesligadas +
    (origemRestrita ? filtros.paises_origem.size : 0) +
    (destinoRestrito ? filtros.paises_destino.size : 0) +
    (exportadorRestrito ? filtros.exportadores.size : 0) +
    (importadorRestrito ? filtros.importadores.size : 0) +
    (statusRestrito ? filtros.status.size : 0)
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
  const vistos = new Set<string>()
  const itens: ItemListaFiltroMapaPedido[] = []

  for (const p of pedidos) {
    const pais = resolverPaisOrigemPedidoMapa(p, fornecedoresPorId)
    if (!pais) continue
    const id = normalizarChaveLista(pais)
    if (vistos.has(id)) continue
    vistos.add(id)
    itens.push({
      id,
      label: pais,
      flag: flagsPorPais.get(id) ?? '🌍',
    })
  }

  return itens.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
}

export function listarPaisesDestinoPedidoMapa(
  pedidos: readonly Pedido[],
  fornecedoresPorId: ReadonlyMap<string, FornecedorMapaGeo>,
  flagsPorPais: ReadonlyMap<string, string> = new Map(),
): ItemListaFiltroMapaPedido[] {
  const vistos = new Set<string>()
  const itens: ItemListaFiltroMapaPedido[] = []

  for (const p of pedidos) {
    const pais = resolverPaisDestinoPedidoMapa(p, fornecedoresPorId)
    if (!pais) continue
    const id = normalizarChaveLista(pais)
    if (vistos.has(id)) continue
    vistos.add(id)
    itens.push({
      id,
      label: pais,
      flag: flagsPorPais.get(id) ?? '🌍',
    })
  }

  return itens.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
}

export function listarExportadoresPedidoMapa(pedidos: readonly Pedido[]): ItemListaFiltroMapaPedido[] {
  const vistos = new Set<string>()
  const itens: ItemListaFiltroMapaPedido[] = []

  for (const p of pedidos) {
    const nome = p.nome_exportador?.trim()
    if (!nome) continue
    if (vistos.has(nome)) continue
    vistos.add(nome)
    itens.push({ id: nome, label: nome })
  }

  return itens.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
}

export function listarImportadoresPedidoMapa(pedidos: readonly Pedido[]): ItemListaFiltroMapaPedido[] {
  const vistos = new Set<string>()
  const itens: ItemListaFiltroMapaPedido[] = []

  for (const p of pedidos) {
    const nome = p.nome_importador?.trim()
    if (!nome) continue
    if (vistos.has(nome)) continue
    vistos.add(nome)
    itens.push({ id: nome, label: nome })
  }

  return itens.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
}

export function listarStatusPedidoMapa(
  pedidos: readonly Pedido[],
  rotulosPorStatus: ReadonlyMap<string, string> = new Map(),
  coresPorStatus: ReadonlyMap<string, string> = new Map(),
): Array<ItemListaFiltroMapaPedido & { cor: string }> {
  const vistos = new Set<string>()
  const itens: Array<ItemListaFiltroMapaPedido & { cor: string }> = []

  for (const p of pedidos) {
    const status = p.status?.trim()
    if (!status || vistos.has(status)) continue
    vistos.add(status)
    itens.push({
      id: status,
      label: rotulosPorStatus.get(status) ?? status.replace(/_/g, ' '),
      cor: coresPorStatus.get(status) ?? '#94a3b8',
    })
  }

  return itens.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
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
  const operacoesAtivas = OPERACOES_FILTRO_MAPA_INSIGHTS_PEDIDO.filter((f) => filtros.has(f))
  if (operacoesAtivas.length === OPERACOES_FILTRO_MAPA_INSIGHTS_PEDIDO.length) return true
  if (operacoesAtivas.length === 0) return false
  return operacoesAtivas.includes(p.tipo_operacao)
}

function pedidoAtendeFiltroOptIn(
  valor: string | null | undefined,
  selecionados: ReadonlySet<string>,
  total: number,
): boolean {
  if (dimensaoOptInSemRestricao(selecionados, total)) return true
  const chave = valor?.trim()
  if (!chave) return false
  return selecionados.has(chave)
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
  if (
    contarFiltrosMapaPedidoAtivos(filtros, opcoes) === 0
  ) {
    return [...pedidos]
  }

  const totalOrigem = opcoes?.total_paises_origem ?? listarPaisesOrigemPedidoMapa(pedidos, fornecedoresPorId).length
  const totalDestino = opcoes?.total_paises_destino ?? listarPaisesDestinoPedidoMapa(pedidos, fornecedoresPorId).length
  const totalExportadores = opcoes?.total_exportadores ?? listarExportadoresPedidoMapa(pedidos).length
  const totalImportadores = opcoes?.total_importadores ?? listarImportadoresPedidoMapa(pedidos).length
  const totalStatus = opcoes?.total_status ?? new Set(pedidos.map((p) => p.status)).size

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
