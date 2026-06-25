/**
 * Saving agregado de transações — SSOT Lista, Insights e wizard Nova Leitura.
 */
import { resolverSavingTransacaoLeituraSmartRead } from '../../../shared/metricas-transacao-leitura-smart-read'
import type { TransacaoLeitura } from './schemas'

export type SavingAgregadoTransacoesSmartRead = {
  minutos: number | null
  brl: number | null
  leiturasComSaving: number
  totalDocumentos: number
}

export function calcularSavingAgregadoTransacoesSmartRead(
  transacoes: TransacaoLeitura[],
): SavingAgregadoTransacoesSmartRead {
  let minutos = 0
  let brl = 0
  let leiturasComSaving = 0
  let totalDocumentos = 0

  for (const transacao of transacoes) {
    totalDocumentos += transacao.total_documentos
    const saving = resolverSavingTransacaoLeituraSmartRead(transacao)
    if (!saving || saving.saving_total_minutos <= 0) continue
    minutos += saving.saving_total_minutos
    brl += saving.saving_total_brl
    leiturasComSaving += 1
  }

  return {
    minutos: leiturasComSaving > 0 ? minutos : null,
    brl: leiturasComSaving > 0 ? brl : null,
    leiturasComSaving,
    totalDocumentos,
  }
}
