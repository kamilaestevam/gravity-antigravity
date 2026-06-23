/**
 * Filtros do mapa Insights — operação, modal, origem, destino e status de cotação.
 */

import type {
  ArcRouteBidFrete,
  MapPinBidFrete,
} from './mapa-bid-frete-internacional-tipos'
import { STATUS_LABELS, type StatusCotacao } from './types'

export type FiltroOperacaoModalMapaInsights =
  | 'IMPORTACAO'
  | 'EXPORTACAO'
  | 'AEREO'
  | 'MARITIMO'
  | 'RODOVIARIO'

/** @deprecated Use FiltroOperacaoModalMapaInsights */
export type FiltroRankingsInsightsBidFrete = FiltroOperacaoModalMapaInsights

export type FiltrosMapaInsightsBidFreteInternacional = {
  operacaoModal: ReadonlySet<FiltroOperacaoModalMapaInsights>
  status: ReadonlySet<StatusCotacao>
  /** Códigos de terminal (portCode) selecionados como origem */
  codigos_origem: ReadonlySet<string>
  /** Códigos de terminal (portCode) selecionados como destino */
  codigos_destino: ReadonlySet<string>
}

export const FILTROS_OPERACAO_MODAL_MAPA_INSIGHTS: ReadonlyArray<{
  id: FiltroOperacaoModalMapaInsights
  label: string
  grupo: 'operacao' | 'modal'
  tooltipDescricao: string
}> = [
  {
    id: 'IMPORTACAO',
    label: 'Importação',
    grupo: 'operacao',
    tooltipDescricao: 'Cotações com origem fora do Brasil e destino no Brasil',
  },
  {
    id: 'EXPORTACAO',
    label: 'Exportação',
    grupo: 'operacao',
    tooltipDescricao: 'Cotações com origem no Brasil e destino no exterior',
  },
  {
    id: 'MARITIMO',
    label: 'Marítimo',
    grupo: 'modal',
    tooltipDescricao: 'Rotas com modal marítimo',
  },
  {
    id: 'AEREO',
    label: 'Aéreo',
    grupo: 'modal',
    tooltipDescricao: 'Rotas com modal aéreo',
  },
  {
    id: 'RODOVIARIO',
    label: 'Rodoviário',
    grupo: 'modal',
    tooltipDescricao: 'Rotas com modal rodoviário',
  },
]

/** @deprecated Use FILTROS_OPERACAO_MODAL_MAPA_INSIGHTS */
export const FILTROS_RANKINGS_INSIGHTS_BID_FRETE = FILTROS_OPERACAO_MODAL_MAPA_INSIGHTS

export const FILTROS_STATUS_MAPA_INSIGHTS: ReadonlyArray<{
  id: StatusCotacao
  label: string
  cor: string
}> = [
  { id: 'RASCUNHO', label: STATUS_LABELS.RASCUNHO, cor: '#94a3b8' },
  { id: 'ENVIADA_FORNECEDORES', label: 'Enviada', cor: '#60a5fa' },
  { id: 'EM_COTACAO', label: STATUS_LABELS.EM_COTACAO, cor: '#fbbf24' },
  { id: 'AGUARDANDO_APROVACAO', label: 'Aprovação', cor: '#818cf8' },
  { id: 'APROVADA', label: STATUS_LABELS.APROVADA, cor: '#10b981' },
  { id: 'REPROVADA', label: STATUS_LABELS.REPROVADA, cor: '#ef4444' },
]

export function filtrosMapaInsightsVazios(): FiltrosMapaInsightsBidFreteInternacional {
  return {
    operacaoModal: new Set(),
    status: new Set(),
    codigos_origem: new Set(),
    codigos_destino: new Set(),
  }
}

export type DimensaoIgnoradaFiltroMapaInsights = 'codigos_origem' | 'codigos_destino'

export function filtrosMapaInsightsIgnorandoDimensao(
  filtros: FiltrosMapaInsightsBidFreteInternacional,
  dimensao: DimensaoIgnoradaFiltroMapaInsights,
): FiltrosMapaInsightsBidFreteInternacional {
  if (dimensao === 'codigos_origem') {
    return { ...filtros, codigos_origem: new Set() }
  }
  return { ...filtros, codigos_destino: new Set() }
}

export function contarFiltrosMapaAtivos(
  filtros: FiltrosMapaInsightsBidFreteInternacional,
): number {
  return (
    filtros.operacaoModal.size +
    filtros.status.size +
    filtros.codigos_origem.size +
    filtros.codigos_destino.size
  )
}

export function listarTerminaisOrigemMapaInsights(
  pins: MapPinBidFrete[],
  routes: ArcRouteBidFrete[],
): MapPinBidFrete[] {
  const pinPorId = new Map(pins.map((p) => [p.id, p]))
  const codigosVistos = new Set<string>()
  const terminais: MapPinBidFrete[] = []

  for (const rota of routes) {
    const pin = pinPorId.get(rota.fromId)
    if (!pin || codigosVistos.has(pin.portCode)) continue
    codigosVistos.add(pin.portCode)
    terminais.push(pin)
  }

  return terminais.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
}

export function listarTerminaisDestinoMapaInsights(
  pins: MapPinBidFrete[],
  routes: ArcRouteBidFrete[],
): MapPinBidFrete[] {
  const pinPorId = new Map(pins.map((p) => [p.id, p]))
  const codigosVistos = new Set<string>()
  const terminais: MapPinBidFrete[] = []

  for (const rota of routes) {
    const pin = pinPorId.get(rota.toId)
    if (!pin || codigosVistos.has(pin.portCode)) continue
    codigosVistos.add(pin.portCode)
    terminais.push(pin)
  }

  return terminais.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
}

/** Filtra terminais por um ou mais termos (espaço, vírgula ou ponto-e-vírgula). */
export function filtrarTerminaisMapaInsightsPorBusca(
  terminais: MapPinBidFrete[],
  busca: string,
): MapPinBidFrete[] {
  const termos = busca
    .trim()
    .split(/[\s,;]+/)
    .map((termo) => termo.trim().toLowerCase())
    .filter(Boolean)

  if (termos.length === 0) return terminais

  return terminais.filter((terminal) => {
    const texto = `${terminal.label} ${terminal.portCode} ${terminal.country}`.toLowerCase()
    return termos.every((termo) => texto.includes(termo))
  })
}

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

function rotaAtendeFiltrosOperacaoModal(
  rota: ArcRouteBidFrete,
  pinPorId: Map<number, MapPinBidFrete>,
  filtros: ReadonlySet<FiltroOperacaoModalMapaInsights>,
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

function rotaAtendeFiltrosStatus(
  rota: ArcRouteBidFrete,
  filtrosStatus: ReadonlySet<StatusCotacao>,
): boolean {
  if (filtrosStatus.size === 0) return true
  const statuses = rota.statuses_cotacao_bid_frete_internacional ?? []
  if (statuses.length === 0) return true
  return statuses.some((status) => filtrosStatus.has(status))
}

function rotaAtendeFiltrosLocais(
  rota: ArcRouteBidFrete,
  pinPorId: Map<number, MapPinBidFrete>,
  codigosOrigem: ReadonlySet<string>,
  codigosDestino: ReadonlySet<string>,
): boolean {
  if (codigosOrigem.size === 0 && codigosDestino.size === 0) return true

  const fromPin = pinPorId.get(rota.fromId)
  const toPin = pinPorId.get(rota.toId)
  if (!fromPin || !toPin) return false

  const origemOk =
    codigosOrigem.size === 0 || codigosOrigem.has(fromPin.portCode)
  const destinoOk =
    codigosDestino.size === 0 || codigosDestino.has(toPin.portCode)

  return origemOk && destinoOk
}

export function filtrarDadosMapaInsightsBidFreteInternacional(
  pins: MapPinBidFrete[],
  routes: ArcRouteBidFrete[],
  filtros: FiltrosMapaInsightsBidFreteInternacional | ReadonlySet<FiltroOperacaoModalMapaInsights>,
): { pins: MapPinBidFrete[]; routes: ArcRouteBidFrete[] } {
  const filtrosNormalizados: FiltrosMapaInsightsBidFreteInternacional =
    filtros instanceof Set
      ? {
          operacaoModal: filtros,
          status: new Set(),
          codigos_origem: new Set(),
          codigos_destino: new Set(),
        }
      : filtros

  if (
    filtrosNormalizados.operacaoModal.size === 0 &&
    filtrosNormalizados.status.size === 0 &&
    filtrosNormalizados.codigos_origem.size === 0 &&
    filtrosNormalizados.codigos_destino.size === 0
  ) {
    return { pins, routes }
  }

  const pinPorId = new Map(pins.map((p) => [p.id, p]))
  const routesFiltradas = routes.filter(
    (rota) =>
      rotaAtendeFiltrosOperacaoModal(rota, pinPorId, filtrosNormalizados.operacaoModal) &&
      rotaAtendeFiltrosStatus(rota, filtrosNormalizados.status) &&
      rotaAtendeFiltrosLocais(
        rota,
        pinPorId,
        filtrosNormalizados.codigos_origem,
        filtrosNormalizados.codigos_destino,
      ),
  )

  const pinIdsVisiveis = new Set<number>()
  for (const rota of routesFiltradas) {
    pinIdsVisiveis.add(rota.fromId)
    pinIdsVisiveis.add(rota.toId)
  }

  const pinsFiltrados = pins.filter((p) => pinIdsVisiveis.has(p.id))

  return { pins: pinsFiltrados, routes: routesFiltradas }
}
