// server/routes/health.ts
// Health check do serviço de Email — porta 8008.

import { Router } from 'express'

export const healthRouter = Router()

healthRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'email',
    port: Number(process.env.PORT ?? 8008),
    timestamp: new Date().toISOString(),
  })
})
