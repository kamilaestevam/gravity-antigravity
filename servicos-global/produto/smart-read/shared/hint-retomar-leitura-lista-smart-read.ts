import type { StatusFluxoLeituraPassoSmartRead } from './passo-status-fluxo-leitura-smart-read.js'
import type { StatusLeituraRetomarSmartRead } from './resolver-passo-retomar-leitura-smart-read.js'

/**
 * Metadados da linha da Lista para retomar leitura quando GET legado/progresso vem sem `arquivos`.
 */
export type HintRetomarLeituraListaSmartRead = {
  nome_arquivo?: string | null
  nome_leitura?: string | null
  total_arquivos?: number | null
  status_leitura?: StatusLeituraRetomarSmartRead
  status_fluxo_leitura?: StatusFluxoLeituraPassoSmartRead
  passo_retomar?: number | null
}