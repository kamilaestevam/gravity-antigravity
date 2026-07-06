/**
 * Data/hora oficial de lançamento (horário de Brasília, BRT −03:00).
 *
 * Enquanto `Date.now()` for anterior a esta data, o site público mostra a página
 * de contagem regressiva (ComingSoon). No instante do lançamento a vitrine COMEX
 * completa passa a ser servida automaticamente — sem precisar de novo deploy.
 */
export const LAUNCH_DATE = new Date('2026-08-03T00:00:00-03:00')

/** Rótulo humano da data de lançamento (pt-BR). */
export const LAUNCH_LABEL = '3 de agosto de 2026'

/** true quando já passamos do horário de lançamento. */
export function isLancado(now: number = Date.now()): boolean {
  return now >= LAUNCH_DATE.getTime()
}
