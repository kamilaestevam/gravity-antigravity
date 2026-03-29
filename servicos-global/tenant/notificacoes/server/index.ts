import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import dotenv from 'dotenv'
import { apiRoutes } from './routes/api'
import { errorHandler } from './middleware/error-handler'
import { initPgBoss } from './queue/pg-boss'
import { startWorker } from './queue/worker'
import { initCron } from './cron'

dotenv.config()

// Fail-fast: validar env vars criticas
if (!process.env.TENANT_DATABASE_URL) {
  throw new Error('[Notificacoes] Variavel de ambiente obrigatoria ausente: TENANT_DATABASE_URL')
}

const app = express()
app.use(helmet())
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'notificacoes' }))

// Mount tenant services under /api/v1/notificacoes
app.use('/api/v1/notificacoes', apiRoutes)

// Error Handler
app.use(errorHandler)

const PORT = 8013

async function bootstrap() {
  try {
    const dbUrl = process.env.TENANT_DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/tenant-db'
    
    // Initialize pg-boss
    await initPgBoss(dbUrl)
    
    // Start Queue Worker
    await startWorker()
    
    // Start Cron Daemon
    initCron()

    app.listen(PORT, () => {
      console.log(`[Notificações] Service listening on port ${PORT}`)
    })
  } catch (err) {
    console.error('Failed to start Notificações service:', err)
    process.exit(1)
  }
}

bootstrap()
