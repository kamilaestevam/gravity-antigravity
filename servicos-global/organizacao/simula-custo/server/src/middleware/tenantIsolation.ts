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

export function withTenantIsolation(prisma: PrismaClient, tenantId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ args, query }: { args: { where?: Record<string, unknown>; data?: Record<string, unknown> }; query: (args: unknown) => Promise<unknown> }) {
          args.where = { ...args.where, id_organizacao: tenantId }
          return query(args)
        },
        async findFirst({ args, query }: { args: { where?: Record<string, unknown>; data?: Record<string, unknown> }; query: (args: unknown) => Promise<unknown> }) {
          args.where = { ...args.where, id_organizacao: tenantId }
          return query(args)
        },
        async create({ args, query }: { args: { where?: Record<string, unknown>; data?: Record<string, unknown> }; query: (args: unknown) => Promise<unknown> }) {
          args.data = { ...args.data, id_organizacao: tenantId }
          return query(args)
        },
        async update({ args, query }: { args: { where?: Record<string, unknown>; data?: Record<string, unknown> }; query: (args: unknown) => Promise<unknown> }) {
          args.where = { ...args.where, id_organizacao: tenantId }
          return query(args)
        },
        async delete({ args, query }: { args: { where?: Record<string, unknown>; data?: Record<string, unknown> }; query: (args: unknown) => Promise<unknown> }) {
          args.where = { ...args.where, id_organizacao: tenantId }
          return query(args)
        }
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
    // Sem id_organizacao: cliente raw para endpoints públicos (/health, /master-data)
    req.prisma = basePrisma
  }

  next()
}

export { basePrisma as prisma }
