/**
 * tenantIsolation.ts — Middleware de Isolamento de Tenant
 * Injeta id_organizacao em todas as queries via Prisma Extension.
 * Skill: antigravity-tenant-isolation
 *
 * REGRA ABSOLUTA: id_organizacao NUNCA vem do payload — sempre do JWT/header propagado pelo Gateway.
 */
import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const basePrisma = new PrismaClient()

type QueryArgs = {
  where?: Record<string, unknown>
  data?: Record<string, unknown> | Record<string, unknown>[]
}
type QueryFn = (args: QueryArgs) => Promise<unknown>
type QueryCtx = { args: QueryArgs; query: QueryFn }

export function withTenantIsolation(prisma: PrismaClient, tenantId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ args, query }: QueryCtx) {
          args.where = { ...args.where, id_organizacao: tenantId }
          return query(args)
        },
        async findFirst({ args, query }: QueryCtx) {
          args.where = { ...args.where, id_organizacao: tenantId }
          return query(args)
        },
        async findUnique({ args, query }: QueryCtx) {
          // Segurança: injetar id_organizacao no where para impedir acesso cross-tenant
          // via ID direto. Mesmo padrão do middleware global withTenantIsolation.
          args.where = { ...args.where, id_organizacao: tenantId }
          return query(args)
        },
        async create({ args, query }: QueryCtx) {
          args.data = { ...(args.data as Record<string, unknown>), id_organizacao: tenantId }
          return query(args)
        },
        async createMany({ args, query }: QueryCtx) {
          if (Array.isArray(args.data)) {
            args.data = args.data.map((d: Record<string, unknown>) => ({ ...d, id_organizacao: tenantId }))
          } else {
            args.data = { ...(args.data as Record<string, unknown>), id_organizacao: tenantId }
          }
          return query(args)
        },
        async update({ args, query }: QueryCtx) {
          args.where = { ...args.where, id_organizacao: tenantId }
          return query(args)
        },
        async updateMany({ args, query }: QueryCtx) {
          args.where = { ...args.where, id_organizacao: tenantId }
          return query(args)
        },
        async delete({ args, query }: QueryCtx) {
          args.where = { ...args.where, id_organizacao: tenantId }
          return query(args)
        },
        async deleteMany({ args, query }: QueryCtx) {
          args.where = { ...args.where, id_organizacao: tenantId }
          return query(args)
        },
        async count({ args, query }: QueryCtx) {
          args.where = { ...args.where, id_organizacao: tenantId }
          return query(args)
        },
        async aggregate({ args, query }: QueryCtx) {
          args.where = { ...args.where, id_organizacao: tenantId }
          return query(args)
        },
      }
    }
  }) as unknown as PrismaClient
}

/**
 * Middleware Express: extrai id_organizacao do header x-id-organizacao propagado pelo Gateway (JWT).
 * Nunca aceita id_organizacao do body.
 */
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
