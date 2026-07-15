/**
 * Leitura mínima a partir da linha da Lista quando GET legado/progresso falha.
 * Preserva passo e contagem para não abrir wizard vazio.
 */
import type { HintRetomarLeituraListaSmartRead } from './hint-retomar-leitura-lista-smart-read.js'
import { passoPorStatusFluxoLeituraSmartRead } from './passo-status-fluxo-leitura-smart-read.js'
import type { StatusLeituraRetomarSmartRead } from './resolver-passo-retomar-leitura-smart-read.js'
import { resolverPassoRetomarLeituraSmartRead } from './resolver-passo-retomar-leitura-smart-read.js'

export type LeituraFallbackRetomarListaSmartRead = {
  id_leitura: string
  nome_leitura: string | null
  status_leitura: StatusLeituraRetomarSmartRead
  total_arquivos: number
  arquivos_processados: number
  arquivos: []
}

export function montarLeituraFallbackRetomarListaSmartRead(
  idLeitura: string,
  hint: HintRetomarLeituraListaSmartRead | null | undefined,
): LeituraFallbackRetomarListaSmartRead | null {
  if (!hint) return null
  const total = Math.max(hint.total_arquivos ?? 0, 0)
  if (total <= 0 && !hint.nome_leitura?.trim()) return null

  const status = hint.status_leitura ?? 'PROCESSING'
  const passo =
    hint.passo_retomar ??
    (hint.status_fluxo_leitura
      ? passoPorStatusFluxoLeituraSmartRead(hint.status_fluxo_leitura)
      : resolverPassoRetomarLeituraSmartRead(status, null))

  return {
    id_leitura: idLeitura,
    nome_leitura: hint.nome_leitura?.trim() ?? null,
    status_leitura: passo >= 4 && status !== 'FAILED' ? 'COMPLETED' : status,
    total_arquivos: Math.max(total, 1),
    arquivos_processados: Math.max(total, 1),
    arquivos: [],
  }
}
