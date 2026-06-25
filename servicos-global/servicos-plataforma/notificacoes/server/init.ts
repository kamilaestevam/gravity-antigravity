/**
 * notificacoes/server/init.ts
 * Inicialização assíncrona do serviço de Notificações.
 * Chamada pelo super-servidor antes de abrir porta.
 *
 * Responsabilidades:
 *   1. Inicializar pg-boss (fila de jobs) — ou reutilizar o do historico-global
 *   2. Iniciar worker de processamento
 *   3. Iniciar daemon de cron
 */

import { initPgBoss, setSharedBoss, ensureSendNotificationQueue } from './queue/pg-boss'
import { startWorker } from './queue/worker'
import { initCron }    from './cron'

export async function initNotificacoes(): Promise<void> {
  const dbUrl = process.env.ORGANIZACAO_DATABASE_URL
  if (!dbUrl) {
    throw new Error('[notificacoes] ORGANIZACAO_DATABASE_URL não definida')
  }

  // cfg-back e servidor-plataforma já inicializam pg-boss v10 via historico-global.
  // Uma segunda instância v12 quebrava o send (coluna expire_in inexistente).
  try {
    const { getBoss } = await import('../../historico-global/server/queue/pg-boss.js')
    setSharedBoss(getBoss())
    console.log('[notificacoes] pg-boss compartilhado com historico-global')
  } catch {
    await initPgBoss(dbUrl)
  }

  await ensureSendNotificationQueue()
  await startWorker()
  initCron()
}
