import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'

export const apiRoutes = Router()

const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  const tenantId = req.headers['x-tenant-id'] as string | undefined
  const userId = req.headers['x-user-id'] as string | undefined

  if (!tenantId) {
    return res.status(401).json({ status: 'error', message: 'x-tenant-id header is required' })
  }
  if (!userId) {
    return res.status(401).json({ status: 'error', message: 'x-user-id header is required' })
  }

  ;(req as any).tenant_id = tenantId
  ;(req as any).user_id = userId
  next()
}

apiRoutes.use(checkAuth)

const sseClients = new Map<string, any>()

export function emitToUser(userId: string, event: string, data: any) {
  const res = sseClients.get(userId)
  if (res) {
    res.write(`data: ${JSON.stringify({ type: event, ...data })}\n\n`)
  }
}

apiRoutes.get('/', async (req: any, res) => {
  const { tenant_id, user_id } = req

  const notifications = await prisma.notification.findMany({
    where: { tenant_id, user_id },
    orderBy: { created_at: 'desc' },
    take: 50
  })

  const unread_count = await prisma.notification.count({
    where: { tenant_id, user_id, read: false }
  })

  res.json({ status: 'success', data: notifications, unread_count })
})

apiRoutes.get('/stream', (req: any, res) => {
  const { user_id } = req

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders() // flush the headers to establish SSE with client

  sseClients.set(user_id, res)

  const heartbeat = setInterval(() => {
    res.write(':\n\n') // Comment message as heartbeat
  }, 30000)

  req.on('close', () => {
    clearInterval(heartbeat)
    sseClients.delete(user_id)
  })
})

apiRoutes.put('/:id/read', async (req: any, res, next) => {
  try {
    const { tenant_id, user_id } = req
    const { id } = z.object({ id: z.string() }).parse(req.params)

    const notification = await prisma.notification.updateMany({
      where: { id, tenant_id, user_id },
      data: { read: true }
    })

    if (notification.count === 0) {
      throw new AppError('Notification not found', 404)
    }

    res.json({ status: 'success' })
  } catch (err) {
    next(err)
  }
})

apiRoutes.put('/read-all', async (req: any, res, next) => {
  try {
    const { tenant_id, user_id } = req

    await prisma.notification.updateMany({
      where: { tenant_id, user_id, read: false },
      data: { read: true }
    })

    res.json({ status: 'success' })
  } catch (err) {
    next(err)
  }
})

apiRoutes.delete('/:id', async (req: any, res, next) => {
  try {
    const { tenant_id, user_id } = req
    const { id } = z.object({ id: z.string() }).parse(req.params)

    const notification = await prisma.notification.deleteMany({
      where: { id, tenant_id, user_id }
    })

    if (notification.count === 0) {
      throw new AppError('Notification not found', 404)
    }

    res.json({ status: 'success' })
  } catch (err) {
    next(err)
  }
})
