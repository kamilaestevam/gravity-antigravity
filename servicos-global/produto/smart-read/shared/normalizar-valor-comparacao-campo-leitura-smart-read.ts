/**
 * Fase 1 — normalização trivial para comparação de campos (acento, caixa, pontuação).
 */
export function normalizarValorComparacaoCampoLeituraSmartRead(valor: string | null): string | null {
  if (valor == null) return null
  const reduzido = valor
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return reduzido.length > 0 ? reduzido : null
}
