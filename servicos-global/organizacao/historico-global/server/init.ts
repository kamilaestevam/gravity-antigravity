/**
 * historico-global/server/init.ts
 * Inicialização assíncrona do serviço de Histórico.
 * Chamada pelo super-servidor antes de abrir porta.
 *
 * Responsabilidades:
 *   1. Inicializar pg-boss
 *   2. Garantir que a queue 'audit:log:ingestion' existe
 *   3. Iniciar workers: audit, export, integrity-check, partition
 */

import { initPgBoss } from './queue/pg-boss.js'
import { startAuditWorker }           from './queue/audit-worker.js'
import { startExportWorker }          from './queue/export-worker.js'
import { startIntegrityCheckWorker }  from './queue/integrity-check-worker.js'
import { startPartitionWorker }       from './queue/partition-worker.js'

export async function initHistorico(): Promise<void> {
  const databaseUrl = process.env.ORGANIZACAO_DATABASE_URL
  if (!databaseUrl) {
    throw new Error('[historico] ORGANIZACAO_DATABASE_URL não definida')
  }

  const boss = await initPgBoss(databaseUrl)
  await boss.createQueue('audit:log:ingestion').catch(() => { /* já existe */ })

  await startAuditWorker()
  await startExportWorker()
  await startIntegrityCheckWorker()
  await startPartitionWorker()
}
