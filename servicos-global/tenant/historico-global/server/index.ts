import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { historicoRouter } from './routes.js'
import { errorHandler } from './lib/errors.js'
import { authErrorLogger } from './middleware/auth-error-logger.js'
import { initPgBoss } from './queue/pg-boss.js'
import { startAuditWorker } from './queue/audit-worker.js'
import { startExportWorker } from './queue/export-worker.js'
import { startIntegrityCheckWorker } from './queue/integrity-check-worker.js'
import { startPartitionWorker } from './queue/partition-worker.js'

const app = express()
const PORT = Number(process.env.PORT ?? 8012)

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use((req, res, next) => {
  const correlationId = (req.headers['x-correlation-id'] as string) ?? crypto.randomUUID()
  req.headers['x-correlation-id'] = correlationId
  next()
})

app.use('/api/v1/historico', historicoRouter)

app.get('/health', async (_req, res) => {
  let dbStatus: 'ok' | 'error' = 'ok'
  let queueStatus: 'ok' | 'error' | 'unknown' = 'unknown'
  let dlqFailed = 0

  try {
    const { PrismaClient } = await import('../generated/index.js')
    const p = new PrismaClient({ datasources: { db: { url: process.env.TENANT_DATABASE_URL } } })
    await p.$queryRaw`SELECT 1`
    await p.$disconnect()
    dbStatus = 'ok'
  } catch {
    dbStatus = 'error'
  }

  try {
    // Verifica se pg-boss está inicializado e conta jobs falhos (sem consumir)
    const { getBoss } = await import('./queue/pg-boss.js')
    const boss = getBoss()
    const counts = await boss.getQueueSize('audit:log:ingestion')
    void counts // só verificar que boss está rodando
    queueStatus = 'ok'

    // Conta jobs em estado 'failed' na tabela do pg-boss (DLQ)
    const { PrismaClient } = await import('../generated/index.js')
    const p = new PrismaClient({ datasources: { db: { url: process.env.TENANT_DATABASE_URL } } })
    const result = await p.$queryRaw<[{ count: bigint }]>`
      SELECT count(*) FROM pgboss.job
      WHERE name = 'audit:log:ingestion' AND state = 'failed'
    `
    dlqFailed = Number(result[0]?.count ?? 0)
    await p.$disconnect()
  } catch {
    queueStatus = 'error'
  }

  const allOk = dbStatus === 'ok'
  res.status(allOk ? 200 : 503).json({
    service: '@tenant/historico',
    status: allOk ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '1.0.0',
    checks: {
      db: dbStatus,
      queue: queueStatus,
      dlq_failed: dlqFailed,
    },
  })
})

app.use(authErrorLogger)
app.use(errorHandler)

async function bootstrap() {
  const databaseUrl = process.env.TENANT_DATABASE_URL
  if (!databaseUrl) {
    console.error('[historico] TENANT_DATABASE_URL não definida')
    process.exit(1)
  }

  const boss = await initPgBoss(databaseUrl)
  // Garantir que as queues existem antes de registrar workers e enviar jobs
  await boss.createQueue('audit:log:ingestion').catch(() => { /* já existe */ })
  await startAuditWorker()
  await startExportWorker()
  await startIntegrityCheckWorker()
  await startPartitionWorker()

  const server = app.listen(PORT, () => {
    console.log(`[historico] Serviço rodando na porta ${PORT}`)
    console.log(`[historico] Health check: http://localhost:${PORT}/health`)
  })

  // Graceful shutdown — garante que tsx watch libera a porta antes de reiniciar
  const shutdown = () => {
    server.close(() => process.exit(0))
    setTimeout(() => process.exit(0), 2000)
  }
  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
}

bootstrap().catch((err) => {
  console.error('[historico] Falha ao iniciar:', err)
  process.exit(1)
})

export { app }
