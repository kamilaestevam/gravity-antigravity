/**
 * previsao-taxa-futura-moeda-sync-worker.ts — Cron BACEN Focus (configurável)
 *
 * Padrão: terça 22h BRT (semanal). Admin › Taxas de Moeda › Cotação Futura.
 */

import {
  deveExecutarAgendamentoFocus,
  lerAgendamentoTaxaMoeda,
} from '../lib/taxas-moeda-agendamento-store.js'
import { executarSyncFocus } from '../lib/previsao-focus-sync-executar.js'

let _lastFiredDay = -1

export function startPrevisaoTaxaFuturaMoedaSyncWorker(): void {
  console.log('[PrevisaoTaxaFuturaMoeda] Worker iniciado — agendamento Focus via Admin › Taxas de Moeda')

  setInterval(() => {
    void (async () => {
      const now = new Date()
      const config = await lerAgendamentoTaxaMoeda('focus')
      if (!deveExecutarAgendamentoFocus(now, config)) return

      const dayOfYear = Math.floor(
        (now.getTime() - new Date(Date.UTC(now.getUTCFullYear(), 0, 0)).getTime()) / 86_400_000,
      )
      if (_lastFiredDay === dayOfYear) return
      _lastFiredDay = dayOfYear

      await executarSyncFocus(
        `Cron ${config.frequencia.toLowerCase()} (${String(config.hora).padStart(2, '0')}:${String(config.minuto).padStart(2, '0')} BRT)`,
      )
    })()
  }, 30_000)
}
