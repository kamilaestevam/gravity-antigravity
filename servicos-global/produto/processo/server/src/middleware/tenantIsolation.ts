/**
 * tenantIsolation.ts — Middleware de Isolamento de Organizacao
 * Skill: antigravity-tenant-isolation
 */
import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '../../../generated/index.js'

const basePrisma = new PrismaClient()

type PrismaQueryHookArgs = {
  args: { where?: Record<string, unknown>; data?: Record<string, unknown> }
  query: (args: unknown) => Promise<unknown>
}

function injectOrganizacaoWhere(args: { where?: Record<string, unknown> }, idOrganizacao: string) {
  args.where = { ...args.where, id_organizacao: idOrganizacao }
}

export function withTenantIsolation(prisma: PrismaClient, idOrganizacao: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ args, query }: PrismaQueryHookArgs) {
          injectOrganizacaoWhere(args, idOrganizacao)
          return query(args)
        },
        async findFirst({ args, query }: PrismaQueryHookArgs) {
          injectOrganizacaoWhere(args, idOrganizacao)
          return query(args)
        },
        async count({ args, query }: PrismaQueryHookArgs) {
          injectOrganizacaoWhere(args, idOrganizacao)
          return query(args)
        },
        async aggregate({ args, query }: PrismaQueryHookArgs) {
          injectOrganizacaoWhere(args, idOrganizacao)
          return query(args)
        },
        async groupBy({ args, query }: PrismaQueryHookArgs) {
          injectOrganizacaoWhere(args, idOrganizacao)
          return query(args)
        },
        async create({ args, query }: PrismaQueryHookArgs) {
          args.data = { ...args.data, id_organizacao: idOrganizacao }
          return query(args)
        },
        async update({ args, query }: PrismaQueryHookArgs) {
          injectOrganizacaoWhere(args, idOrganizacao)
          return query(args)
        },
        async delete({ args, query }: PrismaQueryHookArgs) {
          injectOrganizacaoWhere(args, idOrganizacao)
          return query(args)
        },
      },
    },
  }) as unknown as PrismaClient
}

export function tenantIsolationMiddleware(
  req: Request & { prisma?: PrismaClient; tenantId?: string },
  _res: Response,
  next: NextFunction,
) {
  const idOrganizacao = req.headers['x-id-organizacao'] as string | undefined

  if (idOrganizacao) {
    req.tenantId = idOrganizacao
    req.prisma = withTenantIsolation(basePrisma, idOrganizacao)
  } else {
    req.prisma = basePrisma
  }

  next()
}

export { basePrisma as prisma }
