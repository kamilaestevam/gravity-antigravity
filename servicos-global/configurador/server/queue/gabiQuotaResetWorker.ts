// server/queue/gabiQuotaResetWorker.ts
// Worker pg-boss: chama POST /api/v1/gabi/internal/quota-reset no dia 1 de cada mês
// Zera tokens_usados das quotas do mês anterior

import { getBoss } from '../../../tenant/historico-global/server/queue/pg-boss.js'

const GABI_QUOTA_RESET_QUEUE = 'gabi:quota:reset'
const GABI_SERVICE_URL = process.env.GABI_SERVICE_URL ?? 'http://localhost:8015'

export async function startGabiQuotaResetWorker(): Promise<void> {
  const boss = getBoss()

  await boss.work(
    GABI_QUOTA_RESET_QUEUE,
    { teamSize: 1, teamConcurrency: 1 },
    async () => {
      try {
        const response = await fetch(`${GABI_SERVICE_URL}/api/v1/gabi/internal/quota-reset`, {
          method: 'POST',
          headers: {
            'x-internal-key': process.env.INTERNAL_SERVICE_KEY ?? '',
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          const body = await response.text()
          console.error(`[gabiQuotaReset] Erro HTTP ${response.status}: ${body}`)
          throw new Error(`gabi quota-reset retornou ${response.status}`)
        }

        const data = await response.json() as { mes_ref: string; registros_zerados: number }
        console.log(`[gabiQuotaReset] Reset concluído: ${data.registros_zerados} registros zerados para ${data.mes_ref}`)
      } catch (err) {
        console.error('[gabiQuotaReset] Falha no reset de quota:', err)
        throw err  // pg-boss vai retentar
      }
    },
  )

  // Garante que a queue existe
  await boss.createQueue(GABI_QUOTA_RESET_QUEUE).catch(() => { /* já existe */ })

  // Cron: dia 1 de cada mês às 00:05 BRT (5 minutos depois do reset de partição)
  await boss.schedule(GABI_QUOTA_RESET_QUEUE, '5 0 1 * *', {}, {
    tz: 'America/Sao_Paulo',
  })

  console.log('[gabiQuotaReset] worker iniciado (cron: dia 1 de cada mês 00:05 BRT)')
}
