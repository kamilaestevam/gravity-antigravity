/**
 * cardMetricaCatalog.ts — Cards personalizados baseados em métricas do catálogo
 *
 * Persistência: formula_expressao = "metric:<id_do_catalogo>"
 */

import { CARDS_CATALOGO, type CardDefinicao } from './columnCatalog'
import type { CardUsuario } from './types'
import type { TFunction } from 'i18next'

export const METRICA_CARD_PREFIX = 'metric:'

/** Métricas disponíveis para cards personalizados (= catálogo nativo) */
export const METRICAS_CARD_DISPONIVEIS: CardDefinicao[] = CARDS_CATALOGO

export function encodeMetricaCard(catalogoId: string): string {
  return `${METRICA_CARD_PREFIX}${catalogoId}`
}

export function decodeMetricaCard(formulaExpressao: string): string | null {
  const raw = formulaExpressao.trim()
  if (!raw) return null

  if (raw.startsWith(METRICA_CARD_PREFIX)) {
    const id = raw.slice(METRICA_CARD_PREFIX.length)
    return CARDS_CATALOGO.some(c => c.id === id) ? id : null
  }

  // Compat: id puro do catálogo (sem operadores de fórmula legada)
  if (CARDS_CATALOGO.some(c => c.id === raw) && !/[+\-*/()]/.test(raw)) {
    return raw
  }

  return null
}

export function isMetricaCard(formulaExpressao: string): boolean {
  return decodeMetricaCard(formulaExpressao) !== null
}

export function rotuloMetricaCard(card: CardUsuario, t: TFunction): string {
  const id = decodeMetricaCard(card.formula_expressao)
  if (!id) return t('pedido.config.cards.formula_personalizado')
  const def = CARDS_CATALOGO.find(c => c.id === id)
  if (!def) return t('pedido.config.cards.formula_personalizado')
  return `${def.origem} · ${def.tipoAgg} · ${t(def.labelKey)}`
}
