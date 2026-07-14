/**
 * Ao retomar: API (legado+snapshot) é fonte fresca; progresso salvo complementa se tiver mais extração.
 */
import {
  riquezaLeituraRetomarSmartRead,
  type LeituraExtracaoRetomarSmartRead,
} from './leitura-sem-extracao-retomar-smart-read.js'

export type LeituraRetomarSmartRead = LeituraExtracaoRetomarSmartRead & {
  id_leitura: string
  status_leitura: string
}

export function mesclarLeiturasRetomarSmartRead<T extends LeituraRetomarSmartRead>(
  leituraApi: T,
  leituraSalva: T,
): T {
  const fonteArquivos =
    riquezaLeituraRetomarSmartRead(leituraSalva) > riquezaLeituraRetomarSmartRead(leituraApi)
      ? leituraSalva
      : leituraApi
  return {
    ...leituraApi,
    nome_leitura: leituraApi.nome_leitura ?? leituraSalva.nome_leitura,
    status_leitura: leituraApi.status_leitura ?? leituraSalva.status_leitura,
    total_arquivos: Math.max(
      leituraApi.total_arquivos ?? 0,
      leituraSalva.total_arquivos ?? 0,
      fonteArquivos.arquivos.length,
    ),
    arquivos_processados: Math.max(
      leituraApi.arquivos_processados ?? 0,
      leituraSalva.arquivos_processados ?? 0,
      fonteArquivos.arquivos.length,
    ),
    arquivos: [...fonteArquivos.arquivos],
  } as T
}

export function escolherLeituraEfetivaRetomarSmartRead<T extends LeituraRetomarSmartRead>(
  leituraApi: T | null | undefined,
  leituraSalva: T | null | undefined,
): T | null {
  if (!leituraApi && !leituraSalva) return null
  if (!leituraApi) return leituraSalva ?? null
  if (!leituraSalva) return leituraApi
  return mesclarLeiturasRetomarSmartRead(leituraApi, leituraSalva)
}
