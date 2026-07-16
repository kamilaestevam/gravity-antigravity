/**
 * Monta estado persistível do wizard (passo + leitura) a partir dos arquivos locais.
 */
import { aplicarTempoProcessoTotalMsLeituraSmartRead } from '../../../shared/aplicar-tempo-processo-total-leitura-smart-read'
import { consolidarLeituraDeArquivosLocais, todosArquivosAnaliseCompleta } from './tipo-arquivo-nova-leitura-smart-read'
import type { ArquivoLocalNovaLeitura } from './tipo-arquivo-nova-leitura-smart-read'
import type { EstadoSalvoLeitura } from './persistencia-leitura-smart-read'

export function montarEstadoProgressoLeituraSmartRead(params: {
  arquivos: ArquivoLocalNovaLeitura[]
  passo: number
  nomeLeitura: string
  idLeituraExistente: string | null
  tempoProcessoTotalMs?: number | null
}): EstadoSalvoLeitura | null {
  const { arquivos, passo, nomeLeitura, idLeituraExistente, tempoProcessoTotalMs } = params
  const idLeitura = idLeituraExistente ?? arquivos.find((a) => a.id_leitura)?.id_leitura ?? null
  if (!idLeitura || passo < 2 || !todosArquivosAnaliseCompleta(arquivos)) return null
  const leituraBase = consolidarLeituraDeArquivosLocais(arquivos)
  if (!leituraBase || leituraBase.arquivos.length === 0) return null
  const temExtracao = leituraBase.arquivos.some(
    (arquivo) => (arquivo.resultado_extracao?.length ?? 0) > 0,
  )
  if (passo >= 3 && !temExtracao) return null
  const nomeEfetivo = nomeLeitura.trim() || nomeLeitura
  const leituraComTempo = aplicarTempoProcessoTotalMsLeituraSmartRead(
    { ...leituraBase, nome_leitura: nomeEfetivo },
    tempoProcessoTotalMs ?? leituraBase.tempo_processo_total_ms ?? null,
  )
  return {
    passo,
    nome: nomeEfetivo,
    leitura: leituraComTempo,
  }
}
