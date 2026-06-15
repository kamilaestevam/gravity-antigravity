/**
 * Execução compartilhada de sync BACEN Focus — usada pelo worker cron e pelo botão manual.
 */

import { buscarFocusUSD, persistirPrevisao } from '../routes/previsao-taxa-futura-moeda.js'
import { registrarExecucaoAgendamentoTaxaMoeda } from './taxas-moeda-agendamento-store.js'

export async function executarSyncFocus(motivo: string, registrarAgendamento = true): Promise<void> {
  console.log(`[PrevisaoTaxaFuturaMoeda] Iniciando sync — ${motivo}`)

  try {
    const items = await buscarFocusUSD(12)

    if (items.length === 0) {
      console.warn('[PrevisaoTaxaFuturaMoeda] USD: Focus retornou lista vazia')
      return
    }

    let okCount = 0
    for (const item of items) {
      try {
        await persistirPrevisao('USD', item)
        console.log(
          `[PrevisaoTaxaFuturaMoeda] USD ${item.DataReferencia} → ` +
          `mediana ${item.Mediana} (publicado em ${item.Data}, ${item.numeroRespondentes} respondentes)`,
        )
        okCount += 1
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro desconhecido'
        console.warn(`[PrevisaoTaxaFuturaMoeda] USD ${item.DataReferencia}: falha ao persistir — ${msg}`)
      }
    }

    if (registrarAgendamento) {
      await registrarExecucaoAgendamentoTaxaMoeda('focus')
    }

    console.log(`[PrevisaoTaxaFuturaMoeda] Sync concluído — ${okCount}/${items.length} mês(es) atualizado(s)`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    console.warn(`[PrevisaoTaxaFuturaMoeda] Falha no sync — ${msg}`)
  }
}
