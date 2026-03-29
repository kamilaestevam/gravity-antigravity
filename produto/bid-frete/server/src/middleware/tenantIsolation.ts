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
          // Segurança: injetar tenant_id no where para impedir acesso cross-tenant
          // via ID direto. Mesmo padrão do middleware global withTenantIsolation.
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
        async count({ args, query }: any) {
          args.where = { ...args.where, tenant_id: tenantId }
          return query(args)
        },
        async aggregate({ args, query }: any) {
          args.where = { ...args.where, tenant_id: tenantId }
          return query(args)
        },
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
    req.prisma = basePrisma
  }

  next()
}

export { basePrisma as prisma }
