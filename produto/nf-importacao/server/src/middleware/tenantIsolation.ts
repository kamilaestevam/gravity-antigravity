import { PrismaClient } from '@prisma/client'
import { Request, Response, NextFunction } from 'express'

export const prisma = new PrismaClient()

export function tenantIsolationMiddleware(req: Request, res: Response, next: NextFunction): void {
  const tenantId = req.headers['x-tenant-id'] as string
  const userId = req.headers['x-user-id'] as string

  if (!tenantId) {
    res.status(400).json({ error: { code: 'MISSING_TENANT', message: 'x-tenant-id obrigatorio' } })
    return
  }

  // Injeta contexto de tenant no request
  ;(req as unknown as Record<string, unknown>).tenantId = tenantId
  ;(req as unknown as Record<string, unknown>).userId = userId
  ;(req as unknown as Record<string, unknown>).prisma = prisma

  next()
}
