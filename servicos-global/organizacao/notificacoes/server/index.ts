import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import dotenv from 'dotenv'
import { apiRoutes } from './routes/api'
import { internalRoutes } from './routes/internal'
import { webhookResendRoutes } from './routes/webhook-resend'
import { errorHandler } from './middleware/error-handler'
import { initPgBoss } from './queue/pg-boss'
import { startWorker } from './queue/worker'
import { initCron } from './cron'

dotenv.config()

// Fail-fast: validar env vars críticas
const REQUIRED_ENV = ['TENANT_DATABASE_URL', 'INTERNAL_API_KEY']
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) throw new Error(`[Notificacoes] Variável de ambiente obrigatória ausente: ${key}`)
}

const app = express()
app.use(helmet())
app.use(cors())

// ─── Ordem dos middlewares de body parser ─────────────────────────────────────
// IMPORTANTE: o webhook do Resend precisa do body como Buffer (para Svix calcular
// o HMAC). Por isso, a rota é montada ANTES do express.json() global. O
// express.raw() aplicado dentro de webhookResendRoutes captura o stream antes que
// o parser JSON tente consumi-lo.
app.use('/api/webhooks/resend', webhookResendRoutes)

// JSON global — aplica-se a todas as rotas abaixo desta linha
app.use(express.json())

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'notificacoes' }))

// Rotas autenticadas (JWT Clerk)
app.use('/api/v1/notificacoes', apiRoutes)

// Rotas S2S internas (x-internal-key)
app.use('/api/v1/notificacoes/internal', internalRoutes)

// Error Handler
app.use(errorHandler)

const PORT = 8013

async function bootstrap() {
  const dbUrl = process.env.TENANT_DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/tenant-db'

  // pg-boss é não-fatal: falha não impede as rotas principais de funcionar
  try {
    await initPgBoss(dbUrl)
    await startWorker()
    initCron()
  } catch (err) {
    console.error('[Notificações] pg-boss/worker indisponível — filas desativadas:', (err as Error).message)
  }

  app.listen(PORT, () => {
    console.log(`[Notificações] Service listening on port ${PORT}`)
  })
}

bootstrap()
