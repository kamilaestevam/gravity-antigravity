import { Router } from 'express'
import type { PrismaClient } from '@prisma/client'
import { AppError } from '../lib/errors.js'
import { sseHandler } from '../lib/sse-handler.js'

declare module 'express-serve-static-core' {
  interface Request {
    auth?: { id_organizacao: string; id_usuario: string }
    prisma?: PrismaClient
  }
}

const sseRouter = Router()

// GET /:id_dashboard/stream — estabelece conexão SSE para um dashboard específico
sseRouter.get('/:id_dashboard/stream', (req, res) => {
  const { id_organizacao: tenantId, id_usuario: userId } = req.auth!
  const { id_dashboard } = req.params
  const clientId = `${tenantId}:${userId}:${id_dashboard}:${Date.now()}`

  sseHandler.addClient(clientId, tenantId, userId, id_dashboard, res)

  req.on('close', () => {
    sseHandler.removeClient(clientId)
  })
})

export { sseRouter }
