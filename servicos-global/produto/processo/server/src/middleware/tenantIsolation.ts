/**
 * tenantIsolation.ts — Middleware de Isolamento de Organizacao
 * Injeta id_organizacao em todas as queries via Prisma Extension.
 * Skill: antigravity-tenant-isolation
 *
 * REGRA ABSOLUTA: id_organizacao NUNCA vem do payload — sempre do JWT/header propagado pelo Gateway.
 */
import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const basePrisma = new PrismaClient()

type PrismaQueryHookArgs = {
  args: { where?: Record<string, unknown>; data?: Record<string, unknown> }
  query: (args: unknown) => Promise<unknown>
}

export function withTenantIsolation(prisma: PrismaClient, idOrganizacao: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ args, query }: PrismaQueryHookArgs) {
          args.where = { ...args.where, id_organizacao: idOrganizacao }
          return query(args)
        },
        async findFirst({ args, query }: PrismaQueryHookArgs) {
          args.where = { ...args.where, id_organizacao: idOrganizacao }
          return query(args)
        },
        async create({ args, query }: PrismaQueryHookArgs) {
          args.data = { ...args.data, id_organizacao: idOrganizacao }
          return query(args)
        },
        async update({ args, query }: PrismaQueryHookArgs) {
          args.where = { ...args.where, id_organizacao: idOrganizacao }
          return query(args)
        },
        async delete({ args, query }: PrismaQueryHookArgs) {
          args.where = { ...args.where, id_organizacao: idOrganizacao }
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
  const idOrganizacao = req.headers['x-id-organizacao'] as string | undefined

  if (idOrganizacao) {
    req.tenantId = idOrganizacao
    req.prisma = withTenantIsolation(basePrisma, idOrganizacao) as PrismaClient
  } else {
    // Sem id_organizacao: cliente raw para endpoints publicos (/health)
    req.prisma = basePrisma
  }

  next()
}

export { basePrisma as prisma }
