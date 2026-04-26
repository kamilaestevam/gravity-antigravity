import { Router } from 'express'
import type { PrismaClient } from '@prisma/client'
import { AppError } from '../lib/errors.js'
import { sseHandler } from '../lib/sse-handler.js'

declare module 'express-serve-static-core' {
  interface Request {
    auth?: { tenantId: string; userId: string }
    prisma?: PrismaClient
  }
}

const sseRouter = Router()

// GET /:dashboardId — estabelece conexão SSE para um dashboard específico
sseRouter.get('/:dashboardId', (req, res) => {
  const { tenantId, userId } = req.auth!
  const { dashboardId } = req.params
  const clientId = `${tenantId}:${userId}:${dashboardId}:${Date.now()}`

  sseHandler.addClient(clientId, tenantId, userId, dashboardId, res)

  req.on('close', () => {
    sseHandler.removeClient(clientId)
  })
})

export { sseRouter }
