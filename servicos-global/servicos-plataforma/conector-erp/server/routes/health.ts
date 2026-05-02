// server/routes/health.ts
// GET /health — health check com validação de conexão ao banco.

import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

export const healthRouter = Router()

healthRouter.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({
      ok: true,
      service: 'conector-erp',
      port: process.env.PORT ?? 8017,
      timestamp: new Date().toISOString(),
    })
  } catch {
    res.status(503).json({
      ok: false,
      service: 'conector-erp',
      error: 'Database unreachable',
      timestamp: new Date().toISOString(),
    })
  }
})
