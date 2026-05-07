/**
 * taxasMoedaSyncWorker.ts — Cron automático PTAX 4x/dia
 *
 * Horários BRT (UTC-3): 10:03 / 11:03 / 12:03 / 13:03
 * Correspondente UTC:   13:03 / 14:03 / 15:03 / 16:03
 *
 * Apenas dias úteis (seg–sex). Finais de semana ignorados.
 * O BCB publica um boletim por hora — o worker salva cada um separadamente.
 *
 * Fonte: serviço de plataforma `taxas-moeda` (porta 8032 desde 2026-05-07).
 */

import axios from 'axios'
import { persistirCotacao, classificarBoletim, MOEDAS_SUPORTADAS } from '../routes/taxas-moeda.js'

const TAXAS_MOEDA_URL = process.env.TAXAS_MOEDA_URL ?? 'http://localhost:8032'

const SYNC_UTC_HOURS = [13, 14, 15, 16]
const SYNC_MINUTE = 3

let _lastFiredHour = -1

async function executarSync(motivo: string) {
  console.log(`[TaxasMoeda] Iniciando sync automático — ${motivo}`)

  for (const moeda of MOEDAS_SUPORTADAS) {
    try {
      const { data } = await axios.get(`${TAXAS_MOEDA_URL}/api/v1/internal/cotacoes-bcb`, {
        params: { moeda },
        timeout: 12000,
        headers: { 'x-chave-interna-servico': process.env.CHAVE_INTERNA_SERVICO ?? '' },
      })

      if (!data.compra || !data.venda || !data.data) {
        console.warn(`[TaxasMoeda] ${moeda}: PTAX indisponível no BCB`)
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

      console.log(`[TaxasMoeda] ${moeda} ${boletim} → compra ${data.compra} / venda ${data.venda}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      console.warn(`[TaxasMoeda] ${moeda}: falha no sync — ${msg}`)
    }
  }

  console.log(`[TaxasMoeda] Sync concluído`)
}

export function startTaxasMoedaSyncWorker() {
  console.log('[TaxasMoeda] Worker iniciado — sync automático às 10h03 / 11h03 / 12h03 / 13h03 BRT (dias úteis)')

  setInterval(() => {
    const now = new Date()
    const utcHour = now.getUTCHours()
    const utcMinute = now.getUTCMinutes()
    const weekday = now.getUTCDay()

    if (weekday === 0 || weekday === 6) return
    if (utcMinute !== SYNC_MINUTE) return
    if (!SYNC_UTC_HOURS.includes(utcHour)) return
    if (_lastFiredHour === utcHour) return
    _lastFiredHour = utcHour

    const brtHour = utcHour - 3
    const boletimLabel = brtHour <= 10 ? '1º Boletim'
      : brtHour <= 11 ? '2º Boletim'
      : brtHour <= 12 ? '3º Boletim'
      : 'Fechamento'

    executarSync(`${boletimLabel} (${brtHour}h03 BRT)`)
  }, 30_000)
}
