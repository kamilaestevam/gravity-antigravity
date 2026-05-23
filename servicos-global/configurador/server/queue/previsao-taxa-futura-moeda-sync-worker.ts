/**
 * previsao-taxa-futura-moeda-sync-worker.ts — Cron semanal BACEN Focus
 *
 * Horario: quarta-feira 01:00 UTC (= terca-feira 22:00 BRT, UTC-3).
 * Justificativa: o Focus do BACEN consolida a coleta semanal as segundas
 * de manha. Sincronizar terca a noite garante captura do consolidado.
 *
 * Apenas 1x por semana — Focus muda pouco entre dias da mesma semana.
 *
 * NOTA: o Focus oficial publica apenas a serie USD/BRL. O worker sincroniza
 * so USD; demais moedas ficam sem previsao. Decisao registrada na conversa
 * com o dono em 2026-05-22.
 */

import { buscarFocusUSD, persistirPrevisao } from '../routes/previsao-taxa-futura-moeda.js'

const SYNC_UTC_HOUR = 1      // 01h UTC = 22h BRT (terca-feira a noite)
const SYNC_UTC_MINUTE = 0
const SYNC_UTC_WEEKDAY = 3   // quarta-feira UTC (terca-feira BRT vira quarta UTC apos 21h)

let _lastFiredDay = -1

async function executarSync(motivo: string): Promise<void> {
  console.log(`[PrevisaoTaxaFuturaMoeda] Iniciando sync semanal — ${motivo}`)

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

    console.log(`[PrevisaoTaxaFuturaMoeda] Sync concluido — ${okCount}/${items.length} mes(es) atualizado(s)`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    console.warn(`[PrevisaoTaxaFuturaMoeda] Falha no sync — ${msg}`)
  }
}

export function startPrevisaoTaxaFuturaMoedaSyncWorker(): void {
  console.log(
    '[PrevisaoTaxaFuturaMoeda] Worker iniciado — sync semanal terca 22h BRT (quarta 01h UTC)',
  )

  setInterval(() => {
    const now = new Date()
    const weekday = now.getUTCDay()
    const utcHour = now.getUTCHours()
    const utcMinute = now.getUTCMinutes()

    // Day-of-year guard: evita disparar 2x na mesma janela (idempotencia do timer)
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(Date.UTC(now.getUTCFullYear(), 0, 0)).getTime()) / 86_400_000,
    )

    if (weekday !== SYNC_UTC_WEEKDAY) return
    if (utcHour !== SYNC_UTC_HOUR) return
    if (utcMinute !== SYNC_UTC_MINUTE) return
    if (_lastFiredDay === dayOfYear) return
    _lastFiredDay = dayOfYear

    void executarSync('Cron semanal (quarta 01h UTC = terca 22h BRT)')
  }, 30_000)
}
