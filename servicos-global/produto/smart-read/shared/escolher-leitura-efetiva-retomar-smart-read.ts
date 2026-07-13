/**
 * Ao retomar: usa a fonte com mais dados de extração (API, snapshot ou progresso salvo).
 */

export type LeituraRetomarSmartRead = {
  id_leitura: string
  status_leitura: string
  arquivos: readonly {
    resultado_extracao?: readonly unknown[] | null
  }[]
}

function contarExtracaoLeituraRetomar(leitura: LeituraRetomarSmartRead | null | undefined): number {
  if (!leitura) return 0
  return leitura.arquivos.reduce(
    (total, arquivo) => total + (arquivo.resultado_extracao?.length ?? 0),
    0,
  )
}

function riquezaLeituraRetomar(leitura: LeituraRetomarSmartRead | null | undefined): number {
  if (!leitura) return 0
  const extracao = contarExtracaoLeituraRetomar(leitura)
  if (extracao > 0) return extracao
  return leitura.arquivos.length
}

export function escolherLeituraEfetivaRetomarSmartRead<T extends LeituraRetomarSmartRead>(
  leituraApi: T | null | undefined,
  leituraSalva: T | null | undefined,
): T | null {
  if (!leituraApi && !leituraSalva) return null
  if (!leituraApi) return leituraSalva ?? null
  if (!leituraSalva) return leituraApi

  const riquezaApi = riquezaLeituraRetomar(leituraApi)
  const riquezaSalva = riquezaLeituraRetomar(leituraSalva)
  if (riquezaSalva > riquezaApi) return leituraSalva
  return leituraApi
}
