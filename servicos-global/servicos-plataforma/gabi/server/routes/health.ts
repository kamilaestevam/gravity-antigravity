// server/routes/health.ts
import { Router } from 'express'
import prisma from '../lib/prisma.js'

export const healthRouter = Router()

healthRouter.get('/health', async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    let gabiDbOk = false
    try {
      await prisma.$queryRawUnsafe(`SELECT 1 FROM gabi_conversa LIMIT 1`)
      gabiDbOk = true
    } catch {
      gabiDbOk = false
    }
    res.json({
      status: gabiDbOk ? 'ok' : 'degraded',
      service: 'gabi',
      gabi_conversa: gabiDbOk ? 'ready' : 'missing',
      timestamp: new Date(),
    })
  } catch (error) {
    next(error)
  }
})
