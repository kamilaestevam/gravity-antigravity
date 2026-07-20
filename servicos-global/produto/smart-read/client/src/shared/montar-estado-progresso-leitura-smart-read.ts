/**
 * Monta estado persistível do wizard (passo + leitura) a partir dos arquivos locais.
 */
import { aplicarTempoProcessoTotalMsLeituraSmartRead } from '../../../shared/aplicar-tempo-processo-total-leitura-smart-read'
import { leituraTemExtracaoUtilRetomarSmartRead } from '../../../shared/leitura-sem-extracao-retomar-smart-read'
import {
  consolidarLeituraDeArquivosLocais,
  montarLeituraMinimaProcessamentoDeArquivosLocais,
  todosArquivosAnaliseCompleta,
} from './tipo-arquivo-nova-leitura-smart-read'
import type { ArquivoLocalNovaLeitura } from './tipo-arquivo-nova-leitura-smart-read'
import type { EstadoSalvoLeitura } from './persistencia-leitura-smart-read'

export type MotivoEstadoProgressoNaoMontavelSmartRead =
  | 'sem_id_leitura'
  | 'passo_invalido'
  | 'analise_incompleta'
  | 'sem_arquivos'
  | 'sem_extracao'

export function diagnosticarEstadoProgressoLeituraSmartRead(params: {
  arquivos: ArquivoLocalNovaLeitura[]
  passo: number
  nomeLeitura: string
  idLeituraExistente: string | null
}): MotivoEstadoProgressoNaoMontavelSmartRead | null {
  const { arquivos, passo, idLeituraExistente } = params
  const idLeitura = idLeituraExistente ?? arquivos.find((a) => a.id_leitura)?.id_leitura ?? null
  if (!idLeitura) return 'sem_id_leitura'
  if (passo < 2) return 'passo_invalido'
  if (passo >= 3 && !todosArquivosAnaliseCompleta(arquivos)) return 'analise_incompleta'

  const nomeEfetivo = params.nomeLeitura.trim() || params.nomeLeitura
  const leituraBase = todosArquivosAnaliseCompleta(arquivos)
    ? consolidarLeituraDeArquivosLocais(arquivos)
    : montarLeituraMinimaProcessamentoDeArquivosLocais(idLeitura, nomeEfetivo, arquivos)
  if (!leituraBase || leituraBase.arquivos.length === 0) return 'sem_arquivos'
  if (passo >= 3 && !leituraTemExtracaoUtilRetomarSmartRead(leituraBase)) return 'sem_extracao'
  return null
}

export function montarEstadoProgressoLeituraSmartRead(params: {
  arquivos: ArquivoLocalNovaLeitura[]
  passo: number
  nomeLeitura: string
  idLeituraExistente: string | null
  tempoProcessoTotalMs?: number | null
}): EstadoSalvoLeitura | null {
  const { arquivos, passo, nomeLeitura, idLeituraExistente, tempoProcessoTotalMs } = params
  if (diagnosticarEstadoProgressoLeituraSmartRead(params)) return null

  const idLeitura = idLeituraExistente ?? arquivos.find((a) => a.id_leitura)?.id_leitura ?? null
  if (!idLeitura) return null

  const nomeEfetivo = nomeLeitura.trim() || nomeLeitura
  const leituraBase = todosArquivosAnaliseCompleta(arquivos)
    ? consolidarLeituraDeArquivosLocais(arquivos)
    : montarLeituraMinimaProcessamentoDeArquivosLocais(idLeitura, nomeEfetivo, arquivos)
  if (!leituraBase || leituraBase.arquivos.length === 0) return null
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
