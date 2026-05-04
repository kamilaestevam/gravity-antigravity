/**
 * taxaCambioSyncWorker.ts — Cron automático PTAX 4x/dia
 *
 * Horários BRT (UTC-3): 10:03 / 11:03 / 12:03 / 13:03
 * Correspondente UTC:   13:03 / 14:03 / 15:03 / 16:03
 *
 * Apenas dias úteis (seg–sex). Finais de semana ignorados.
 * O BCB publica um boletim por hora — o worker salva cada um separadamente.
 */

import axios from 'axios'
import { persistirCotacao, classificarBoletim, MOEDAS_SUPORTADAS } from '../routes/taxa-cambio.js'

const BID_CAMBIO_URL = process.env.BID_CAMBIO_URL ?? 'http://localhost:8025'

// Horários UTC em que o cron deve disparar (BRT + 3h)
// BRT 10:03 = UTC 13:03 | BRT 11:03 = UTC 14:03 | BRT 12:03 = UTC 15:03 | BRT 13:03 = UTC 16:03
const SYNC_UTC_HOURS = [13, 14, 15, 16]
const SYNC_MINUTE = 3

let _lastFiredHour = -1  // evita disparar duas vezes na mesma hora

async function executarSync(motivo: string) {
  console.log(`[Cambio] Iniciando sync automático — ${motivo}`)

  for (const moeda of MOEDAS_SUPORTADAS) {
    try {
      const { data } = await axios.get(`${BID_CAMBIO_URL}/api/v1/cotacoes-ptax`, {
        params: { moeda },
        timeout: 12000,
      })

      if (!data.compra || !data.venda || !data.data) {
        console.warn(`[Cambio] ${moeda}: PTAX indisponível no BCB`)
        continue
      }

      const dataCotacao = new Date(data.data + 'T00:00:00Z')
      const boletim = classificarBoletim(data.hora)

      await persistirCotacao(
        moeda,
        data.compra,
        data.venda,
        dataCotacao,
        data.hora ?? null,
        boletim,
        data.fonte ?? 'BCB/PTAX',
      )

      console.log(`[Cambio] ${moeda} ${boletim} → compra ${data.compra} / venda ${data.venda}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      console.warn(`[Cambio] ${moeda}: falha no sync — ${msg}`)
    }
  }

  console.log(`[Cambio] Sync concluído`)
}

export function startTaxaCambioSyncWorker() {
  console.log('[Cambio] Worker iniciado — sync automático às 10h03 / 11h03 / 12h03 / 13h03 BRT (dias úteis)')

  setInterval(() => {
    const now = new Date()
    const utcHour = now.getUTCHours()
    const utcMinute = now.getUTCMinutes()
    const weekday = now.getUTCDay() // 0 = domingo, 6 = sábado

    // Apenas dias úteis
    if (weekday === 0 || weekday === 6) return

    // Apenas nos minutos exatos de sincronização
    if (utcMinute !== SYNC_MINUTE) return

    // Apenas nos horários configurados
    if (!SYNC_UTC_HOURS.includes(utcHour)) return

    // Evita disparar duas vezes na mesma hora (caso o interval rode 2x no mesmo minuto)
    if (_lastFiredHour === utcHour) return
    _lastFiredHour = utcHour

    const brtHour = utcHour - 3
    const boletimLabel = brtHour <= 10 ? '1º Boletim'
      : brtHour <= 11 ? '2º Boletim'
      : brtHour <= 12 ? '3º Boletim'
      : 'Fechamento'

    executarSync(`${boletimLabel} (${brtHour}h03 BRT)`)
  }, 30_000) // verifica a cada 30 segundos (preciso o suficiente para não perder o minuto)
}
