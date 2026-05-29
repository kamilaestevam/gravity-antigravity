/**
 * Catálogo de métricas para cards KPI customizados (BID Frete Internacional).
 * Persistência em descKey: "metric:<id_do_catalogo>"
 */

import { CARDS_CATALOGO, type CardDefinicao } from './use-card-preferences'

export const METRICA_CARD_PREFIX = 'metric:'

export const METRICAS_CARD_DISPONIVEIS: CardDefinicao[] = CARDS_CATALOGO

export function encodeMetricaCard(catalogoId: string): string {
  return `${METRICA_CARD_PREFIX}${catalogoId}`
}

export function decodeMetricaCard(encoded: string): string | null {
  const raw = encoded.trim()
  if (!raw) return null

  if (raw.startsWith(METRICA_CARD_PREFIX)) {
    const id = raw.slice(METRICA_CARD_PREFIX.length)
    return CARDS_CATALOGO.some(c => c.id === id) ? id : null
  }

  if (CARDS_CATALOGO.some(c => c.id === raw) && !/[+\-*/()]/.test(raw)) {
    return raw
  }

  return null
}

export function obterDefMetricaCard(descKey: string): CardDefinicao | undefined {
  const id = decodeMetricaCard(descKey)
  if (!id) return undefined
  return CARDS_CATALOGO.find(c => c.id === id)
}
