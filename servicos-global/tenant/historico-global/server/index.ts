import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { historicoRouter } from './routes.js'
import { errorHandler } from './lib/errors.js'
import { initPgBoss } from './queue/pg-boss.js'
import { startAuditWorker } from './queue/audit-worker.js'

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

app.get('/health', (req, res) => {
  res.json({
    service: '@tenant/historico',
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '1.0.0',
  })
})

app.use(errorHandler)

async function bootstrap() {
  const databaseUrl = process.env.TENANT_DATABASE_URL
  if (!databaseUrl) {
    console.error('[historico] TENANT_DATABASE_URL não definida')
    process.exit(1)
  }

  await initPgBoss(databaseUrl)
  await startAuditWorker()

  app.listen(PORT, () => {
    console.log(`[historico] Serviço rodando na porta ${PORT}`)
    console.log(`[historico] Health check: http://localhost:${PORT}/health`)
  })
}

bootstrap().catch((err) => {
  console.error('[historico] Falha ao iniciar:', err)
  process.exit(1)
})

export { app }
