/**
 * Saving agregado de transações — SSOT compartilhado client + BFF.
 * Client (Lista, Insights, wizard) e servidor (GET /leituras/agregado-workspace)
 * usam exatamente esta função para o mesmo número aparecer nos dois lados.
 */
import {
  resolverSavingTransacaoLeituraSmartRead,
  type MetricasTransacaoLeituraSmartRead,
} from './metricas-transacao-leitura-smart-read.js'

export type TransacaoEntradaSavingAgregadoSmartRead = Pick<
  MetricasTransacaoLeituraSmartRead,
  | 'total_documentos'
  | 'total_campos_extraidos'
  | 'tipos_documento'
  | 'tempo_extracao_ia_ms'
  | 'tempo_processo_total_ms'
  | 'saving_total_minutos'
  | 'saving_total_brl'
>

export type SavingAgregadoTransacoesSmartRead = {
  minutos: number | null
  brl: number | null
  leiturasComSaving: number
  totalDocumentos: number
}

export function calcularSavingAgregadoTransacoesSmartRead(
  transacoes: TransacaoEntradaSavingAgregadoSmartRead[],
): SavingAgregadoTransacoesSmartRead {
  let minutos = 0
  let brl = 0
  let leiturasComSaving = 0
  let totalDocumentos = 0

  for (const transacao of transacoes) {
    totalDocumentos += transacao.total_documentos
    const saving = resolverSavingTransacaoLeituraSmartRead(transacao)
    const savingMinutos = saving?.saving_total_minutos
    if (savingMinutos == null || savingMinutos <= 0) continue
    minutos += savingMinutos
    brl += saving?.saving_total_brl ?? 0
    leiturasComSaving += 1
  }

  return {
    minutos: leiturasComSaving > 0 ? minutos : null,
    brl: leiturasComSaving > 0 ? brl : null,
    leiturasComSaving,
    totalDocumentos,
  }
}
