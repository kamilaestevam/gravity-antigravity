/**
 * SSOT — passo do wizard ao retomar leitura da Lista.
 * COMPLETED → sempre passo 4 (Resultado). Demais status → progresso salvo ou passo 2.
 */

export type StatusLeituraRetomarSmartRead = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export function passoInicialLeituraSmartRead(status: StatusLeituraRetomarSmartRead): number {
  return status === 'COMPLETED' ? 4 : 2
}

export function normalizarPassoRegistroProgressoLeituraSmartRead(
  passoRegistro: number,
  statusLeitura: StatusLeituraRetomarSmartRead,
): number {
  if (passoRegistro >= 2 && passoRegistro <= 4) return passoRegistro
  return passoInicialLeituraSmartRead(statusLeitura)
}

export function resolverPassoRetomarLeituraSmartRead(
  status: StatusLeituraRetomarSmartRead,
  passoSalvo: number | null | undefined,
): number {
  if (status === 'COMPLETED') return 4
  const passoValido =
    typeof passoSalvo === 'number' && passoSalvo >= 2 && passoSalvo <= 4 ? passoSalvo : null
  return passoValido ?? passoInicialLeituraSmartRead(status)
}
