/**
 * SSOT — leitura tem dados utilizáveis para retomar (sidebar + conferência).
 */

export type LeituraExtracaoRetomarSmartRead = {
  arquivos: readonly {
    resultado_extracao?: readonly unknown[] | null
  }[]
}

export function contarExtracaoLeituraRetomarSmartRead(
  leitura: LeituraExtracaoRetomarSmartRead | null | undefined,
): number {
  if (!leitura) return 0
  return leitura.arquivos.reduce(
    (total, arquivo) => total + (arquivo.resultado_extracao?.length ?? 0),
    0,
  )
}

export function riquezaLeituraRetomarSmartRead(
  leitura: LeituraExtracaoRetomarSmartRead | null | undefined,
): number {
  if (!leitura) return 0
  const extracao = contarExtracaoLeituraRetomarSmartRead(leitura)
  if (extracao > 0) return extracao
  return leitura.arquivos.length
}

export function leituraSemExtracaoUtilRetomarSmartRead(
  leitura: LeituraExtracaoRetomarSmartRead,
): boolean {
  if (leitura.arquivos.length === 0) return true
  return contarExtracaoLeituraRetomarSmartRead(leitura) === 0
}

export function leituraTemExtracaoUtilRetomarSmartRead(
  leitura: LeituraExtracaoRetomarSmartRead | null | undefined,
): boolean {
  if (!leitura) return false
  return contarExtracaoLeituraRetomarSmartRead(leitura) > 0
}
