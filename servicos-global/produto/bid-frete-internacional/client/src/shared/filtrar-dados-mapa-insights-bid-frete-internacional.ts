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

export const OPERACOES_FILTRO_MAPA_INSIGHTS = ['IMPORTACAO', 'EXPORTACAO'] as const
export const MODAIS_FILTRO_MAPA_INSIGHTS = ['MARITIMO', 'AEREO', 'RODOVIARIO'] as const

/**
 * Estado inicial dos filtros do mapa — operação/modal são opt-out:
 * todos os cards começam ativos (aceso = mostra; apagado = oculta).
 * Origem/destino/status seguem opt-in (vazio = sem restrição).
 */
export function filtrosMapaInsightsIniciais(): FiltrosMapaInsightsBidFreteInternacional {
  return {
    operacaoModal: new Set(FILTROS_OPERACAO_MODAL_MAPA_INSIGHTS.map((f) => f.id)),
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

/**
 * Conta restrições aplicadas. Operação/modal são opt-out: cada card
 * desligado conta como um filtro ativo (todos ligados = 0 restrições).
 */
export function contarFiltrosMapaAtivos(
  filtros: FiltrosMapaInsightsBidFreteInternacional,
): number {
  const operacoesDesligadas = OPERACOES_FILTRO_MAPA_INSIGHTS
    .filter((f) => !filtros.operacaoModal.has(f)).length
  const modaisDesligados = MODAIS_FILTRO_MAPA_INSIGHTS
    .filter((f) => !filtros.operacaoModal.has(f)).length
  return (
    operacoesDesligadas +
    modaisDesligados +
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

/**
 * Semântica opt-out: card ativo = mostra; card inativo = oculta.
 * Grupo com todos os cards ativos = sem restrição (inclui rotas sem
 * tipo de operação inferível). Grupo com todos inativos = oculta tudo.
 */
function rotaAtendeFiltrosOperacaoModal(
  rota: ArcRouteBidFrete,
  pinPorId: Map<number, MapPinBidFrete>,
  filtros: ReadonlySet<FiltroOperacaoModalMapaInsights>,
): boolean {
  const operacoesAtivas = OPERACOES_FILTRO_MAPA_INSIGHTS.filter((f) => filtros.has(f))
  const modaisAtivos = MODAIS_FILTRO_MAPA_INSIGHTS.filter((f) => filtros.has(f))
  const todasOperacoesAtivas = operacoesAtivas.length === OPERACOES_FILTRO_MAPA_INSIGHTS.length
  const todosModaisAtivos = modaisAtivos.length === MODAIS_FILTRO_MAPA_INSIGHTS.length

  if (todasOperacoesAtivas && todosModaisAtivos) return true

  const fromPin = pinPorId.get(rota.fromId)
  const toPin = pinPorId.get(rota.toId)
  const tipoOperacao =
    rota.tipo_operacao_cotacao_bid_frete_internacional ??
    inferirTipoOperacaoRotaMapa(fromPin, toPin)
  const modal = modalDaRota(rota)

  const operacaoOk =
    todasOperacoesAtivas ||
    (tipoOperacao != null && operacoesAtivas.includes(tipoOperacao))
  const modalOk = todosModaisAtivos || modaisAtivos.includes(modal)

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

/**
 * Compat com o formato legado (Set opt-in): grupo ausente no Set
 * significava «sem restrição» — expande para todos os cards do grupo.
 */
function normalizarOperacaoModalLegado(
  filtros: ReadonlySet<FiltroOperacaoModalMapaInsights>,
): Set<FiltroOperacaoModalMapaInsights> {
  const normalizado = new Set(filtros)
  if (!OPERACOES_FILTRO_MAPA_INSIGHTS.some((f) => normalizado.has(f))) {
    for (const f of OPERACOES_FILTRO_MAPA_INSIGHTS) normalizado.add(f)
  }
  if (!MODAIS_FILTRO_MAPA_INSIGHTS.some((f) => normalizado.has(f))) {
    for (const f of MODAIS_FILTRO_MAPA_INSIGHTS) normalizado.add(f)
  }
  return normalizado
}

export function filtrarDadosMapaInsightsBidFreteInternacional(
  pins: MapPinBidFrete[],
  routes: ArcRouteBidFrete[],
  filtros: FiltrosMapaInsightsBidFreteInternacional | ReadonlySet<FiltroOperacaoModalMapaInsights>,
): { pins: MapPinBidFrete[]; routes: ArcRouteBidFrete[] } {
  const filtrosNormalizados: FiltrosMapaInsightsBidFreteInternacional =
    filtros instanceof Set
      ? {
          operacaoModal: normalizarOperacaoModalLegado(filtros),
          status: new Set(),
          codigos_origem: new Set(),
          codigos_destino: new Set(),
        }
      : filtros

  if (contarFiltrosMapaAtivos(filtrosNormalizados) === 0) {
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
