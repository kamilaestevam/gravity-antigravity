/**
 * tenantIsolation.ts — Middleware de Isolamento de Tenant
 * Injeta tenant_id em todas as queries via Prisma Extension.
 * Skill: antigravity-tenant-isolation
 *
 * REGRA ABSOLUTA: tenant_id NUNCA vem do payload — sempre do JWT/header propagado pelo Gateway.
 */
import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const basePrisma = new PrismaClient()

type PrismaQueryHookArgs = {
  args: { where?: Record<string, unknown>; data?: Record<string, unknown> }
  query: (args: unknown) => Promise<unknown>
}

export function withTenantIsolation(prisma: PrismaClient, tenantId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ args, query }: PrismaQueryHookArgs) {
          args.where = { ...args.where, tenant_id: tenantId }
          return query(args)
        },
        async findFirst({ args, query }: PrismaQueryHookArgs) {
          args.where = { ...args.where, tenant_id: tenantId }
          return query(args)
        },
        async create({ args, query }: PrismaQueryHookArgs) {
          args.data = { ...args.data, tenant_id: tenantId }
          return query(args)
        },
        async update({ args, query }: PrismaQueryHookArgs) {
          args.where = { ...args.where, tenant_id: tenantId }
          return query(args)
        },
        async delete({ args, query }: PrismaQueryHookArgs) {
          args.where = { ...args.where, tenant_id: tenantId }
          return query(args)
        }
      }
    }
  }) as unknown as PrismaClient
}

/**
 * Middleware Express: extrai tenant_id do header x-tenant-id propagado pelo Gateway (JWT).
 * Nunca aceita tenant_id do body.
 */
export function tenantIsolationMiddleware(
  req: Request & { prisma?: PrismaClient; tenantId?: string },
  _res: Response,
  next: NextFunction
) {
  const tenantId = req.headers['x-tenant-id'] as string | undefined

  if (tenantId) {
    req.tenantId = tenantId
    req.prisma = withTenantIsolation(basePrisma, tenantId) as PrismaClient
  } else {
    // Sem tenant_id: cliente raw para endpoints publicos (/health)
    req.prisma = basePrisma
  }

  next()
}

export { basePrisma as prisma }
