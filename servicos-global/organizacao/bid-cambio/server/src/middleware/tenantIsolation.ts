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

type PrismaQueryArgs = {
  where?: Record<string, unknown>
  data?: Record<string, unknown> | Record<string, unknown>[]
  [key: string]: unknown
}

type PrismaExtensionContext = {
  args: PrismaQueryArgs
  query: (args: PrismaQueryArgs) => Promise<unknown>
}

export function withTenantIsolation(prisma: PrismaClient, tenantId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ args, query }: PrismaExtensionContext) {
          args.where = { ...args.where, id_organizacao: tenantId }
          return query(args)
        },
        async findFirst({ args, query }: PrismaExtensionContext) {
          args.where = { ...args.where, id_organizacao: tenantId }
          return query(args)
        },
        async findUnique({ args, query }: PrismaExtensionContext) {
          args.where = { ...args.where, id_organizacao: tenantId }
          return query(args)
        },
        async create({ args, query }: PrismaExtensionContext) {
          args.data = { ...(args.data as Record<string, unknown>), id_organizacao: tenantId }
          return query(args)
        },
        async createMany({ args, query }: PrismaExtensionContext) {
          if (Array.isArray(args.data)) {
            args.data = (args.data as Record<string, unknown>[]).map((d) => ({ ...d, id_organizacao: tenantId }))
          } else {
            args.data = { ...(args.data as Record<string, unknown>), id_organizacao: tenantId }
          }
          return query(args)
        },
        async update({ args, query }: PrismaExtensionContext) {
          args.where = { ...args.where, id_organizacao: tenantId }
          return query(args)
        },
        async updateMany({ args, query }: PrismaExtensionContext) {
          args.where = { ...args.where, id_organizacao: tenantId }
          return query(args)
        },
        async delete({ args, query }: PrismaExtensionContext) {
          args.where = { ...args.where, id_organizacao: tenantId }
          return query(args)
        },
        async deleteMany({ args, query }: PrismaExtensionContext) {
          args.where = { ...args.where, id_organizacao: tenantId }
          return query(args)
        },
        async count({ args, query }: PrismaExtensionContext) {
          args.where = { ...args.where, id_organizacao: tenantId }
          return query(args)
        },
        async aggregate({ args, query }: PrismaExtensionContext) {
          args.where = { ...args.where, id_organizacao: tenantId }
          return query(args)
        },
      }
    }
  }) as unknown as PrismaClient
}

export function tenantIsolationMiddleware(
  req: Request & { prisma?: PrismaClient; tenantId?: string },
  _res: Response,
  next: NextFunction
) {
  const tenantId = req.headers['x-id-organizacao'] as string | undefined

  if (tenantId) {
    req.tenantId = tenantId
    req.prisma = withTenantIsolation(basePrisma, tenantId) as PrismaClient
  } else {
    req.prisma = basePrisma
  }

  next()
}

export { basePrisma as prisma }
