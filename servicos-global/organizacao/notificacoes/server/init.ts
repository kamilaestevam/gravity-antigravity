/**
 * notificacoes/server/init.ts
 * Inicialização assíncrona do serviço de Notificações.
 * Chamada pelo super-servidor antes de abrir porta.
 *
 * Responsabilidades:
 *   1. Inicializar pg-boss (fila de jobs)
 *   2. Iniciar worker de processamento
 *   3. Iniciar daemon de cron
 */

import { initPgBoss } from './queue/pg-boss'
import { startWorker } from './queue/worker'
import { initCron }    from './cron'

export async function initNotificacoes(): Promise<void> {
  const dbUrl = process.env.ORGANIZACAO_DATABASE_URL
  if (!dbUrl) {
    throw new Error('[notificacoes] ORGANIZACAO_DATABASE_URL não definida')
  }

  await initPgBoss(dbUrl)
  await startWorker()
  initCron()
}
