/**
 * tempo_processo_total_ms — cronômetro persistido do wizard (SSOT transação/lista).
 */

export type LeituraComTempoProcessoSmartRead = {
  tempo_processo_total_ms?: number | null
}

export function resolverTempoProcessoTotalMsLeituraSmartRead(
  leitura: LeituraComTempoProcessoSmartRead | null | undefined,
  fallbackMs?: number | null,
): number | null {
  const persistido = leitura?.tempo_processo_total_ms
  if (persistido != null && persistido > 0) return persistido
  if (fallbackMs != null && fallbackMs > 0) return fallbackMs
  return null
}

export function aplicarTempoProcessoTotalMsLeituraSmartRead<T extends LeituraComTempoProcessoSmartRead>(
  leitura: T,
  tempoProcessoTotalMs: number | null,
): T {
  if (tempoProcessoTotalMs == null || tempoProcessoTotalMs < 0) return leitura
  return {
    ...leitura,
    tempo_processo_total_ms: tempoProcessoTotalMs,
  }
}

export function resolverTempoProcessoTotalSegundosLeituraSmartRead(
  leitura: LeituraComTempoProcessoSmartRead | null | undefined,
  fallbackMs?: number | null,
): number | null {
  const ms = resolverTempoProcessoTotalMsLeituraSmartRead(leitura, fallbackMs)
  if (ms == null) return null
  return Math.max(0, Math.floor(ms / 1000))
}
