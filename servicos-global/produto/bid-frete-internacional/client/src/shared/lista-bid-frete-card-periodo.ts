import type { CardPeriodoCodigo } from './use-card-preferences'
import type { Cotacao } from './types'

/** Limite de cotações carregadas na lista (filtros KPI/tabela são client-side). */
export const COTACOES_LIMIT_LISTA = 500

export function calcularDataMinimaPeriodoCards(
  periodo: CardPeriodoCodigo,
  agoraMs = Date.now(),
): number | null {
  if (periodo === 'tudo') return null

  const agora = new Date(agoraMs)
  const inicio = new Date(agora)

  switch (periodo) {
    case '7d':
      inicio.setDate(inicio.getDate() - 7)
      break
    case '30d':
      inicio.setDate(inicio.getDate() - 30)
      break
    case '6m':
      inicio.setMonth(inicio.getMonth() - 6)
      break
    case '1a':
      inicio.setFullYear(inicio.getFullYear() - 1)
      break
    default:
      return null
  }

  return inicio.getTime()
}

export function cotacaoDentroPeriodoCards(
  cotacao: Cotacao,
  periodo: CardPeriodoCodigo,
  agoraMs = Date.now(),
): boolean {
  const minMs = calcularDataMinimaPeriodoCards(periodo, agoraMs)
  if (minMs == null) return true

  const criacaoMs = new Date(cotacao.data_criacao_cotacao_bid_frete_internacional).getTime()
  if (!Number.isFinite(criacaoMs)) return false

  return criacaoMs >= minMs && criacaoMs <= agoraMs
}

export function filtrarCotacoesPorPeriodoCards(
  cotacoes: Cotacao[],
  periodo: CardPeriodoCodigo,
  agoraMs = Date.now(),
): Cotacao[] {
  return cotacoes.filter(c => cotacaoDentroPeriodoCards(c, periodo, agoraMs))
}
