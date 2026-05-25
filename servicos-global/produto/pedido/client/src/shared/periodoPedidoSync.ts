/**
 * Sincroniza período entre cards da Lista e Dashboard (mesma chave localStorage).
 */

import type { CardPeriodoCodigo } from './lista-card-schemas'

export const PERIODO_CARDS_LISTA_KEY = 'pedido:cards-periodo'
export const PERIODO_CARDS_SYNC_EVENT = 'pedido:cards-updated'

const PERIODOS_LISTA = new Set<string>(['7d', '30d', '6m', '1a', 'tudo'])

/** Períodos exclusivos do Dashboard — não sobrescrevem preferência da Lista. */
const PERIODOS_SOMENTE_DASHBOARD = new Set([
  '90d', '12m', 'ytd', 'current_month', 'current_year',
])

export function lerPeriodoCardsLista(): CardPeriodoCodigo {
  try {
    const raw = localStorage.getItem(PERIODO_CARDS_LISTA_KEY) as CardPeriodoCodigo | null
    if (raw && PERIODOS_LISTA.has(raw)) return raw
  } catch { /* ignore */ }
  return '30d'
}

export function salvarPeriodoCardsLista(periodo: CardPeriodoCodigo): void {
  localStorage.setItem(PERIODO_CARDS_LISTA_KEY, periodo)
  window.dispatchEvent(new CustomEvent(PERIODO_CARDS_SYNC_EVENT))
}

/** Lista → Dashboard (1a e 12m são equivalentes no backend). */
export function mapearPeriodoListaParaDashboard(periodo: CardPeriodoCodigo): string {
  if (periodo === '1a') return '1a'
  return periodo
}

/** Dashboard → Lista quando o período existe nos cards. */
export function mapearPeriodoDashboardParaLista(periodo: string): CardPeriodoCodigo | null {
  if (periodo === '12m') return '1a'
  if (PERIODOS_LISTA.has(periodo)) return periodo as CardPeriodoCodigo
  return null
}

export function periodoDashboardEhSomenteDashboard(periodo: string): boolean {
  return periodo.startsWith('custom:') || PERIODOS_SOMENTE_DASHBOARD.has(periodo)
}
