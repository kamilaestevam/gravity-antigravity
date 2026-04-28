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

// Tipo aberto para callbacks de Prisma extension (args/query são genéricos por design)
type ExtCtx = {
  args: { where?: Record<string, unknown>; data?: Record<string, unknown> | Record<string, unknown>[] }
  query: (args: unknown) => Promise<unknown>
}

export function withTenantIsolation(prisma: PrismaClient, tenantId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ args, query }: ExtCtx) {
          args.where = { ...args.where, tenant_id: tenantId }
          return query(args)
        },
        async findFirst({ args, query }: ExtCtx) {
          args.where = { ...args.where, tenant_id: tenantId }
          return query(args)
        },
        async findUnique({ args, query }: ExtCtx) {
          args.where = { ...args.where, tenant_id: tenantId }
          return query(args)
        },
        async count({ args, query }: ExtCtx) {
          args.where = { ...args.where, tenant_id: tenantId }
          return query(args)
        },
        async create({ args, query }: ExtCtx) {
          args.data = { ...(args.data as Record<string, unknown>), tenant_id: tenantId }
          return query(args)
        },
        async createMany({ args, query }: ExtCtx) {
          if (Array.isArray(args.data)) {
            args.data = args.data.map((d: Record<string, unknown>) => ({ ...d, tenant_id: tenantId }))
          } else {
            args.data = { ...(args.data as Record<string, unknown>), tenant_id: tenantId }
          }
          return query(args)
        },
        async update({ args, query }: ExtCtx) {
          args.where = { ...args.where, tenant_id: tenantId }
          return query(args)
        },
        async updateMany({ args, query }: ExtCtx) {
          args.where = { ...args.where, tenant_id: tenantId }
          return query(args)
        },
        async delete({ args, query }: ExtCtx) {
          args.where = { ...args.where, tenant_id: tenantId }
          return query(args)
        },
        async deleteMany({ args, query }: ExtCtx) {
          args.where = { ...args.where, tenant_id: tenantId }
          return query(args)
        },
      },
    },
  })
}

const TENANT_PUBLIC_PATHS = [
  '/api/v1/pedidos/importacoes-inteligentes/template', // Download público — browser não envia x-id-organizacao
]

export function tenantIsolationMiddleware(req: Request, res: Response, next: NextFunction) {
  const isPublic = TENANT_PUBLIC_PATHS.some(p => req.path === p || req.path.startsWith(p + '/'))
  if (isPublic) return next()

  const tenantId = req.headers['x-id-organizacao'] as string | undefined
  if (!tenantId) {
    return res.status(400).json({ error: 'x-id-organizacao header obrigatorio', code: 'MISSING_TENANT' })
  }
  ;(req as any).tenantId = tenantId
  ;(req as any).prisma = withTenantIsolation(basePrisma, tenantId)
  next()
}

export { basePrisma as prisma }
