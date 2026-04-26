import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'

declare global {
  namespace Express {
    interface Request {
      auth: {
        tenantId: string
        userId: string
      }
    }
  }
}
import crypto from 'node:crypto'
import { errorHandler } from './lib/errors.js'
import { agendaRouter } from './routes/agenda.js'
import { slotRouter } from './routes/slot.js'
import { reservaRouter } from './routes/reserva.js'
import { configRouter } from './routes/config.js'

const app = express()
const PORT = Number(process.env.PORT ?? 8018)

app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use((req, _res, next) => {
  const correlationId = (req.headers['x-correlation-id'] as string) ?? crypto.randomUUID()
  req.headers['x-correlation-id'] = correlationId
  next()
})

// ---------------------------------------------------------------------------
// Auth — injeta req.auth a partir do header x-tenant-id / x-user-id
// Em produção o gateway valida o JWT e propaga como headers internos.
// ---------------------------------------------------------------------------

app.use((req, res, next) => {
  // Health check não precisa de autenticação
  if (req.path === '/health') return next()

  const tenantId = req.headers['x-tenant-id'] as string | undefined
  const userId = req.headers['x-user-id'] as string | undefined

  if (!tenantId) {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'x-tenant-id obrigatório' },
    })
    return
  }

  req.auth = { tenantId, userId: userId ?? '' }
  next()
})

app.use('/api/v1/agenda', agendaRouter)
app.use('/api/v1/slot', slotRouter)
app.use('/api/v1/reserva', reservaRouter)
app.use('/api/v1/config', configRouter)

app.get('/health', (_req, res) => {
  res.json({
    service: '@tenant/agendamento',
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '1.0.0',
  })
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`[AGENDAMENTO] Serviço rodando na porta ${PORT}`)
  console.log(`[AGENDAMENTO] Health check: http://localhost:${PORT}/health`)
})

export { app }
