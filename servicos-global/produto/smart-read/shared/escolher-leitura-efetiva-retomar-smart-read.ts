/**
 * Ao retomar: extração vem da API (legado/snapshot); progresso salvo só para passo/nome.
 */

export type LeituraRetomarSmartRead = {
  id_leitura: string
  status_leitura: string
  arquivos: readonly unknown[]
}

export function escolherLeituraEfetivaRetomarSmartRead<T extends LeituraRetomarSmartRead>(
  leituraApi: T | null | undefined,
  leituraSalva: T | null | undefined,
): T | null {
  return leituraApi ?? leituraSalva ?? null
}
