/**
 * Filtros do painel Rankings Globais (Insights) — operação e modal.
 */

import type { ArcRouteBidFrete, MapPinBidFrete } from './componentes/visao-geral-mapa-bid-frete'

export type FiltroRankingsInsightsBidFrete =
  | 'IMPORTACAO'
  | 'EXPORTACAO'
  | 'AEREO'
  | 'MARITIMO'
  | 'RODOVIARIO'

export const FILTROS_RANKINGS_INSIGHTS_BID_FRETE: ReadonlyArray<{
  id: FiltroRankingsInsightsBidFrete
  label: string
  tooltipDescricao: string
}> = [
  {
    id: 'IMPORTACAO',
    label: 'Importação',
    tooltipDescricao: 'Filtra cotações de cargas vindas de outros países',
  },
  {
    id: 'EXPORTACAO',
    label: 'Exportação',
    tooltipDescricao: 'Filtra cotações de cargas saindo do Brasil',
  },
  {
    id: 'AEREO',
    label: 'Aéreo',
    tooltipDescricao: 'Filtra rotas e bids com modal aéreo',
  },
  {
    id: 'MARITIMO',
    label: 'Marítimo',
    tooltipDescricao: 'Filtra rotas e bids com modal marítimo',
  },
  {
    id: 'RODOVIARIO',
    label: 'Rodoviário',
    tooltipDescricao: 'Filtra rotas e bids com modal rodoviário',
  },
]

function codigoPaisPorto(portCode: string): string {
  return portCode.trim().slice(0, 2).toUpperCase()
}

export function inferirTipoOperacaoRotaMapa(
  fromPin: MapPinBidFrete | undefined,
  toPin: MapPinBidFrete | undefined,
): 'IMPORTACAO' | 'EXPORTACAO' | null {
  if (!fromPin || !toPin) return null
  const origemPais = codigoPaisPorto(fromPin.portCode)
  const destinoPais = codigoPaisPorto(toPin.portCode)
  if (destinoPais === 'BR' && origemPais !== 'BR') return 'IMPORTACAO'
  if (origemPais === 'BR' && destinoPais !== 'BR') return 'EXPORTACAO'
  return null
}

function modalDaRota(rota: ArcRouteBidFrete): 'MARITIMO' | 'AEREO' | 'RODOVIARIO' {
  return rota.modal_cotacao_bid_frete_internacional ?? rota.mode
}

function rotaAtendeFiltros(
  rota: ArcRouteBidFrete,
  pinPorId: Map<number, MapPinBidFrete>,
  filtros: ReadonlySet<FiltroRankingsInsightsBidFrete>,
): boolean {
  if (filtros.size === 0) return true

  const filtrosOperacao = (['IMPORTACAO', 'EXPORTACAO'] as const).filter((f) => filtros.has(f))
  const filtrosModal = (['AEREO', 'MARITIMO', 'RODOVIARIO'] as const).filter((f) => filtros.has(f))

  const fromPin = pinPorId.get(rota.fromId)
  const toPin = pinPorId.get(rota.toId)
  const tipoOperacao =
    rota.tipo_operacao_cotacao_bid_frete_internacional ??
    inferirTipoOperacaoRotaMapa(fromPin, toPin)
  const modal = modalDaRota(rota)

  const operacaoOk =
    filtrosOperacao.length === 0 ||
    (tipoOperacao != null && filtrosOperacao.includes(tipoOperacao))
  const modalOk = filtrosModal.length === 0 || filtrosModal.includes(modal)

  return operacaoOk && modalOk
}

export function filtrarDadosMapaInsightsBidFreteInternacional(
  pins: MapPinBidFrete[],
  routes: ArcRouteBidFrete[],
  filtros: ReadonlySet<FiltroRankingsInsightsBidFrete>,
): { pins: MapPinBidFrete[]; routes: ArcRouteBidFrete[] } {
  if (filtros.size === 0) {
    return { pins, routes }
  }

  const pinPorId = new Map(pins.map((p) => [p.id, p]))
  const routesFiltradas = routes.filter((rota) => rotaAtendeFiltros(rota, pinPorId, filtros))

  const pinIdsVisiveis = new Set<number>()
  for (const rota of routesFiltradas) {
    pinIdsVisiveis.add(rota.fromId)
    pinIdsVisiveis.add(rota.toId)
  }

  const pinsFiltrados = pins.filter((p) => pinIdsVisiveis.has(p.id))

  return { pins: pinsFiltrados, routes: routesFiltradas }
}
