/**
 * types.ts — Tipos compartilhados para as rotas do servidor de Pedido
 */

import type { Request } from 'express'
import type { PrismaClient } from '@prisma/client'

export interface TenantRequest extends Request {
  prisma: PrismaClient
  tenantId: string
  userId?: string
}
