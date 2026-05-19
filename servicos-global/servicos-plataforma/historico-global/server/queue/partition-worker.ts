/**
 * partition-worker.ts
 *
 * Gerencia particionamento mensal da tabela HistoryLog.
 *
 * SKILL.md: "Particionamento mensal obrigatório. Cleanup após 12 meses."
 *
 * Estratégia:
 *   - Roda no 1º dia de cada mês às 01:00 BRT
 *   - Cria partição para o MÊS SEGUINTE (pro-ativo — nunca falha por falta de partição)
 *   - Remove partições com mais de 12 meses
 *   - Verifica se a tabela já é particionada antes de agir
 *
 * IMPORTANTE: A migração inicial que converte HistoryLog de tabela regular
 * para tabela particionada deve ser rodada pelo Coordenador via script SQL dedicado
 * (ver migration-partition-history-log.sql).
 * Este worker apenas cria/remove partições em tabelas já particionadas.
 */

import { getBoss } from './pg-boss.js'
import { PrismaClient } from '../../../generated/index.js'
import { captureException, captureMessage } from '../lib/sentry.js'

// Lazy initialization — evita ESM hoisting ler process.env antes do dotenv.config()
let _prisma: PrismaClient | undefined
function getPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = new PrismaClient({ datasources: { db: { url: process.env.ORGANIZACAO_DATABASE_URL } } })
  }
  return _prisma
}

export const PARTITION_QUEUE = 'audit:partition:maintain'

export async function startPartitionWorker(): Promise<void> {
  const boss = getBoss()

  await boss.work(
    PARTITION_QUEUE,
    { teamSize: 1, teamConcurrency: 1 },
    async () => {
      await maintainPartitions()
    }
  )

  // Garantir que a queue existe antes de agendar
  await boss.createQueue(PARTITION_QUEUE).catch(() => { /* já existe */ })

  // Cron: 1º de cada mês às 01:00 BRT
  await boss.schedule(PARTITION_QUEUE, '0 1 1 * *', {}, {
    tz: 'America/Sao_Paulo',
  })

  // Roda imediatamente para garantir que a partição do mês atual e próximo existam
  await maintainPartitions()

  console.log('[historico] partition-worker iniciado (cron: dia 1 de cada mês 01h BRT)')
}

async function maintainPartitions(): Promise<void> {
  try {
    const isPartitioned = await checkIfPartitioned()
    if (!isPartitioned) {
      console.log('[partition-worker] HistoryLog não é tabela particionada — pulando')
      return
    }

    await createFuturePartitions()
    await dropOldPartitions()
  } catch (err) {
    captureException(err, { tag: 'partition_maintenance_failed' })
  }
}

/**
 * Verifica se history_log está configurada como tabela particionada.
 */
async function checkIfPartitioned(): Promise<boolean> {
  const result = await getPrisma().$queryRaw<Array<{ relkind: string }>>`
    SELECT relkind
    FROM pg_class
    WHERE relname = 'HistoryLog'
      AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  `
  // relkind = 'p' indica tabela particionada
  return result.length > 0 && result[0].relkind === 'p'
}

/**
 * Cria partições para os próximos 2 meses (mês atual + próximo).
 * Idempotente: usa IF NOT EXISTS.
 */
async function createFuturePartitions(): Promise<void> {
  const now = new Date()

  for (let offset = 0; offset <= 1; offset++) {
    const target = new Date(now.getFullYear(), now.getMonth() + offset, 1)
    const year  = target.getFullYear()
    const month = String(target.getMonth() + 1).padStart(2, '0')

    const partitionName = `history_log_${year}_${month}`
    const startDate = `${year}-${month}-01`

    const nextTarget = new Date(year, target.getMonth() + 1, 1)
    const nextYear  = nextTarget.getFullYear()
    const nextMonth = String(nextTarget.getMonth() + 1).padStart(2, '0')
    const endDate   = `${nextYear}-${nextMonth}-01`

    // Guarda contra injection: valida que os valores gerados têm o formato esperado
    // antes de interpolar no SQL. Impede que refatorações futuras introduzam vetores.
    if (!/^history_log_\d{4}_\d{2}$/.test(partitionName)) {
      throw new Error(`[partition-worker] Nome de partição inválido: ${partitionName}`)
    }
    if (!/^\d{4}-\d{2}-01$/.test(startDate) || !/^\d{4}-\d{2}-01$/.test(endDate)) {
      throw new Error(`[partition-worker] Datas de partição inválidas: ${startDate} / ${endDate}`)
    }

    await getPrisma().$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "${partitionName}"
        PARTITION OF "HistoryLog"
        FOR VALUES FROM ('${startDate}') TO ('${endDate}')
    `)

    console.log(`[partition-worker] Partição garantida: ${partitionName} (${startDate} → ${endDate})`)
  }
}

/**
 * Remove partições com mais de 12 meses.
 * Lista partições existentes e deleta as antigas.
 */
async function dropOldPartitions(): Promise<void> {
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - 12)

  const partitions = await getPrisma().$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename LIKE 'history_log_%'
    ORDER BY tablename ASC
  `

  for (const { tablename } of partitions) {
    // Formato esperado: history_log_YYYY_MM
    const match = tablename.match(/^history_log_(\d{4})_(\d{2})$/)
    if (!match) continue

    const partYear  = parseInt(match[1], 10)
    const partMonth = parseInt(match[2], 10) - 1 // 0-indexed
    const partDate  = new Date(partYear, partMonth, 1)

    if (partDate < cutoff) {
      await getPrisma().$executeRawUnsafe(`DROP TABLE IF EXISTS "${tablename}"`)
      captureMessage(`[partition-worker] Partição removida (>12 meses): ${tablename}`, 'info', {
        tablename,
        partDate: partDate.toISOString(),
      })
    }
  }
}
