// middleware/withTenantIsolation.ts
// AGENTE 0B — BANCO DE DADOS
//
// Middleware de isolamento de tenant via Prisma Client Extensions.
// OBRIGATÓRIO em todo servidor que acessa o banco de tenant.
//
// Uso:
//   import { withTenantIsolation } from '@tenant/middleware/tenant-isolation'
//   const db = withTenantIsolation(prisma, req.auth.tenantId)
//   const items = await db.activity.findMany({ where: { status: 'DONE' } })
//                                       ^-- tenant_id injetado automaticamente
//
// REGRA: o tenant_id SEMPRE vem do token JWT — NUNCA do body da requisição.

import { PrismaClient } from '@prisma/client'

// ---------------------------------------------------------------------------
// Tipo de retorno do Prisma estendido
// ---------------------------------------------------------------------------

type IsolatedPrismaClient = ReturnType<typeof withTenantIsolation>

// ---------------------------------------------------------------------------
// withTenantIsolation
//
// Retorna uma instância do Prisma com todas as operações filtradas
// automaticamente pelo tenant_id fornecido.
//
// Operações cobertas:
//   findMany  — WHERE tenant_id = tenantId
//   findFirst — WHERE tenant_id = tenantId
//   create    — injeta tenant_id nos dados
//   update    — WHERE tenant_id = tenantId (impede update cross-tenant)
//   delete    — WHERE tenant_id = tenantId (impede delete cross-tenant)
// ---------------------------------------------------------------------------

function withTenantIsolation(prisma: PrismaClient, tenantId: string) {
  if (!tenantId || tenantId.trim() === '') {
    throw new Error('[withTenantIsolation] tenantId é obrigatório e não pode ser vazio.')
  }

  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ args, query }: { args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
          args.where = { ...(args.where as Record<string, unknown>), tenant_id: tenantId }
          return query(args)
        },

        async findFirst({ args, query }: { args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
          args.where = { ...(args.where as Record<string, unknown>), tenant_id: tenantId }
          return query(args)
        },

        async findUnique({ args, query }: { args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
          // findUnique não suporta where composto via extension da mesma forma —
          // convertemos para findFirst com filtro adicional de segurança.
          args.where = { ...(args.where as Record<string, unknown>), tenant_id: tenantId }
          return query(args)
        },

        async create({ args, query }: { args: { data: Record<string, unknown> }; query: (args: { data: Record<string, unknown> }) => Promise<unknown> }) {
          // Injeta o tenant_id nos dados — sobrescreve qualquer tentativa de forjá-lo
          args.data = { ...args.data, tenant_id: tenantId }
          return query(args)
        },

        async createMany({ args, query }: { args: { data: Record<string, unknown>[] }; query: (args: { data: Record<string, unknown>[] }) => Promise<unknown> }) {
          // Injeta tenant_id em cada registro do batch
          args.data = args.data.map((record) => ({ ...record, tenant_id: tenantId }))
          return query(args)
        },

        async update({ args, query }: { args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
          args.where = { ...(args.where as Record<string, unknown>), tenant_id: tenantId }
          return query(args)
        },

        async updateMany({ args, query }: { args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
          args.where = { ...(args.where as Record<string, unknown>), tenant_id: tenantId }
          return query(args)
        },

        async delete({ args, query }: { args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
          args.where = { ...(args.where as Record<string, unknown>), tenant_id: tenantId }
          return query(args)
        },

        async deleteMany({ args, query }: { args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
          args.where = { ...(args.where as Record<string, unknown>), tenant_id: tenantId }
          return query(args)
        },
      },
    },
  })
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { withTenantIsolation }
export type { IsolatedPrismaClient }
