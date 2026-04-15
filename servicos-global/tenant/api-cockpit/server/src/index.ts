import 'dotenv/config'

// Fail-fast: validar env vars criticas
const requiredEnvVars = ['INTERNAL_SERVICE_KEY', 'ENCRYPTION_KEY'] as const
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`[API-Cockpit] Variavel de ambiente obrigatoria ausente: ${envVar}`)
  }
}

import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

// TODO: tokens/webhooks/erp routes importam middleware (requireAuth, tenantIsolation)
// de um path que nunca foi implementado. Desabilitados até que o middleware seja criado.
// import { tokensRouter } from './routes/tokens'
// import { webhooksRouter } from './routes/webhooks'
// import { erpRouter } from './routes/erp'
import { docsRouter } from './routes/docs'
import { observabilityRouter } from './routes/observability'
import { requireInternalKey } from './middleware/requireInternalKey'
import { rateLimitPresets } from '../../../middleware/rateLimiter'

const app = express()
const prisma = new PrismaClient()

app.use(helmet())
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'api-cockpit', version: '1.0.0' })
})

// Rate Limiting
app.use(rateLimitPresets.internal())

// Routes
// app.use('/api/v1/cockpit/tokens', tokensRouter)
// app.use('/api/v1/cockpit/webhooks', webhooksRouter)
// app.use('/api/v1/erp', erpRouter)
app.use('/api/v1/cockpit/docs', requireInternalKey, docsRouter)
app.use('/api/v1/cockpit/observability', observabilityRouter)

// Error Handler
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  if (err instanceof z.ZodError) {
    return res.status(400).json({ error: 'Validation Error', issues: err.issues })
  }
  const e = err as { statusCode?: number; message?: string }
  return res.status(e.statusCode ?? 500).json({
    error: e.message ?? 'Internal Server Error'
  })
})

const PORT = 8016

app.listen(PORT, () => {
  console.log(`🚀 API Cockpit Service running on port ${PORT}`)
})
