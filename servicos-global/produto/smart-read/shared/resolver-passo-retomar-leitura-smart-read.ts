/**
 * SSOT — passo do wizard ao retomar leitura da Lista.
 * Passo persistido prevalece (paridade com derivarStatusFluxoLeitura).
 * Sem passo salvo: COMPLETED → 4; PROCESSING/PENDING → 2; FAILED → 2.
 */

export type StatusLeituraRetomarSmartRead = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export function passoInicialLeituraSmartRead(status: StatusLeituraRetomarSmartRead): number {
  if (status === 'FAILED') return 2
  return status === 'COMPLETED' ? 4 : 2
}

export function normalizarPassoRegistroProgressoLeituraSmartRead(
  passoRegistro: number,
  statusLeitura: StatusLeituraRetomarSmartRead,
): number {
  if (passoRegistro >= 2 && passoRegistro <= 4) return passoRegistro
  return passoInicialLeituraSmartRead(statusLeitura)
}

export type OpcoesResolverPassoRetomarLeituraSmartRead = {
  /** Sem extração utilizável: não abrir conferência/resultado vazios — volta ao passo 2. */
  temExtracaoUtil?: boolean
}

export function resolverPassoRetomarLeituraSmartRead(
  status: StatusLeituraRetomarSmartRead,
  passoSalvo: number | null | undefined,
  opcoes?: OpcoesResolverPassoRetomarLeituraSmartRead,
): number {
  const passoValido =
    typeof passoSalvo === 'number' && passoSalvo >= 2 && passoSalvo <= 4 ? passoSalvo : null
  const passo =
    passoValido != null ? passoValido : passoInicialLeituraSmartRead(status)
  if (passo >= 3 && opcoes?.temExtracaoUtil === false) return 2
  return passo
}
