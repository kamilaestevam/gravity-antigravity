/**
 * express.d.ts — Augmentação do Request do Express
 * Adiciona prisma e tenantId injetados pelo tenantIsolationMiddleware
 */

import { PrismaClient } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      prisma?: PrismaClient
      tenantId?: string
    }
  }
}

export {}
