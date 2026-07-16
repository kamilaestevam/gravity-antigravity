/** Valores de status de fluxo — sem dependência de Zod (testável isolado). */
export type StatusFluxoLeituraPassoSmartRead =
  | 'ANEXAR_ARQUIVO'
  | 'ANALISE_ARQUIVO'
  | 'CONFERENCIA'
  | 'RESULTADO_LEITURAS'
  | 'EM_INTEGRACAO'
  | 'INTEGRACAO_CONFIRMADA'
  | 'FALHOU'

export function statusFluxoPorPassoLeituraSmartRead(passo: number): StatusFluxoLeituraPassoSmartRead {
  if (passo <= 1) return 'ANEXAR_ARQUIVO'
  if (passo === 2) return 'ANALISE_ARQUIVO'
  if (passo === 3) return 'CONFERENCIA'
  return 'RESULTADO_LEITURAS'
}

/** Inverso de `statusFluxoPorPassoLeituraSmartRead` — passo do wizard a partir da coluna Status da Lista. */
export function passoPorStatusFluxoLeituraSmartRead(status: StatusFluxoLeituraPassoSmartRead): number {
  if (status === 'ANEXAR_ARQUIVO') return 1
  if (status === 'ANALISE_ARQUIVO' || status === 'FALHOU') return 2
  if (status === 'CONFERENCIA') return 3
  return 4
}
