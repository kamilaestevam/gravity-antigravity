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

export function withTenantIsolation(prisma: PrismaClient, tenantId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ args, query }: any) {
          args.where = { ...args.where, tenant_id: tenantId }
          return query(args)
        },
        async findFirst({ args, query }: any) {
          args.where = { ...args.where, tenant_id: tenantId }
          return query(args)
        },
        async findUnique({ args, query }: any) {
          args.where = { ...args.where, tenant_id: tenantId }
          return query(args)
        },
        async count({ args, query }: any) {
          args.where = { ...args.where, tenant_id: tenantId }
          return query(args)
        },
        async create({ args, query }: any) {
          args.data = { ...args.data, tenant_id: tenantId }
          return query(args)
        },
        async createMany({ args, query }: any) {
          if (Array.isArray(args.data)) {
            args.data = args.data.map((d: any) => ({ ...d, tenant_id: tenantId }))
          } else {
            args.data = { ...args.data, tenant_id: tenantId }
          }
          return query(args)
        },
        async update({ args, query }: any) {
          args.where = { ...args.where, tenant_id: tenantId }
          return query(args)
        },
        async updateMany({ args, query }: any) {
          args.where = { ...args.where, tenant_id: tenantId }
          return query(args)
        },
        async delete({ args, query }: any) {
          args.where = { ...args.where, tenant_id: tenantId }
          return query(args)
        },
        async deleteMany({ args, query }: any) {
          args.where = { ...args.where, tenant_id: tenantId }
          return query(args)
        },
      },
    },
  })
}

export function tenantIsolationMiddleware(req: Request, res: Response, next: NextFunction) {
  const tenantId = req.headers['x-tenant-id'] as string | undefined
  if (!tenantId) {
    return res.status(400).json({ error: 'x-tenant-id header obrigatorio', code: 'MISSING_TENANT' })
  }
  ;(req as any).tenantId = tenantId
  ;(req as any).prisma = withTenantIsolation(basePrisma, tenantId)
  next()
}

export { basePrisma as prisma }
