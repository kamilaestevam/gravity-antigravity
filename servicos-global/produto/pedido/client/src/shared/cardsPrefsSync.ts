/**
 * Sincronização entre prefs globais de cards (localStorage) e UI pendente / painel da Lista.
 */
import type { CardPreferencia } from './useCardPreferences'

/** Preserva edições locais não salvas quando cards customizados terminam de carregar. */
export function resolverPendingCardsAposSyncExterno(
  pending: CardPreferencia[],
  baseline: CardPreferencia[],
  cardsSalvosNormalizado: CardPreferencia[],
  normalizar: (prefs: CardPreferencia[]) => CardPreferencia[],
): CardPreferencia[] {
  const dirty = JSON.stringify(pending) !== JSON.stringify(baseline)
  if (dirty) return normalizar(pending)
  return cardsSalvosNormalizado
}

export function resolverPeriodoAposSyncExterno(
  pending: string,
  baseline: string,
  periodoSalvo: string,
): string {
  if (pending !== baseline) return pending
  return periodoSalvo
}

/**
 * Painel da lista guarda só ids visíveis no snapshot; prefs globais podem ter cards
 * adicionados depois em Configurações — união evita sumir após hidratar o painel.
 */
export function mesclarVisibilidadeCardsTopoPainel(
  cardPrefs: CardPreferencia[],
  idsVisiveisPainel: string[],
): CardPreferencia[] {
  if (idsVisiveisPainel.length === 0) return cardPrefs

  const idsPainel = new Set(idsVisiveisPainel)
  const idsGlobaisVisiveis = cardPrefs.filter(p => p.visible).map(p => p.id)
  const idsEfetivos = new Set([...idsVisiveisPainel, ...idsGlobaisVisiveis])

  return cardPrefs.map(p => ({
    ...p,
    visible: idsEfetivos.has(p.id),
  }))
}

export function painelCardsTopoTemIntersecaoComPrefs(
  cardPrefs: CardPreferencia[],
  idsVisiveisPainel: string[],
): boolean {
  if (idsVisiveisPainel.length === 0) return false
  const idsPainel = new Set(idsVisiveisPainel)
  return cardPrefs.some(p => idsPainel.has(p.id))
}
