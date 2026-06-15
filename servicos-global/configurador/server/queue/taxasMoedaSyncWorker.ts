/**
 * taxasMoedaSyncWorker.ts — Cron automático PTAX (configurável via Admin › Taxas de Moeda)
 *
 * Padrão BCB: 10h03 / 11h03 / 12h03 / 13h03 BRT em dias úteis.
 * Respeita flag ativo + frequencia !== Manual em taxa_moeda_sync_agendamento.
 */

import {
  deveExecutarAgendamentoPtax,
  lerAgendamentoTaxaMoeda,
  partesDataHoraBrt,
} from '../lib/taxas-moeda-agendamento-store.js'
import { executarSyncPtax } from '../lib/taxas-moeda-sync-executar.js'

let _lastSlotKey = ''

function rotuloBoletimPtax(horaBrt: number): string {
  if (horaBrt <= 10) return '1º Boletim'
  if (horaBrt <= 11) return '2º Boletim'
  if (horaBrt <= 12) return '3º Boletim'
  return 'Fechamento'
}

export function startTaxasMoedaSyncWorker() {
  console.log('[TaxasMoeda] Worker iniciado — agendamento PTAX via Admin › Taxas de Moeda')

  setInterval(() => {
    void (async () => {
      const now = new Date()
      const config = await lerAgendamentoTaxaMoeda('ptax')
      if (!deveExecutarAgendamentoPtax(now, config)) return

      const brt = partesDataHoraBrt(now)
      const slotKey = `${now.toISOString().slice(0, 10)}-${brt.hour}:${brt.minute}`
      if (_lastSlotKey === slotKey) return
      _lastSlotKey = slotKey

      const boletimLabel = rotuloBoletimPtax(brt.hour)
      await executarSyncPtax(`${boletimLabel} (${brt.hour}h${String(brt.minute).padStart(2, '0')} BRT)`)
    })()
  }, 30_000)
}
