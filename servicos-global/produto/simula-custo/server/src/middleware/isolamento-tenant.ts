/**
 * isolamento-tenant.ts — Middleware de Isolamento de Tenant (Estimativa Custo)
 * Injeta id_organizacao em todas as queries via Prisma Extension.
 * Skill: antigravity-tenant-isolation
 *
 * REGRA ABSOLUTA: id_organizacao NUNCA vem do payload — sempre do JWT/header propagado pelo Gateway.
 */
import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

// O proxy público do Railway (tokaido.proxy.rlwy.net) encerra conexões TCP
// ociosas; o pool do Prisma fica com conexões mortas e a primeira query após
// idle falha com P1017 ("Server has closed the connection") ou P1001.
// Mitigação: retry único (Prisma reconecta na tentativa seguinte) + keepalive.
const ERROS_CONEXAO = ['P1001', 'P1002', 'P1008', 'P1017']

function ehQuedaDeConexao(err: unknown): boolean {
  const code = (err as { code?: string })?.code
  if (code && ERROS_CONEXAO.includes(code)) return true
  const msg = err instanceof Error ? err.message : ''
  return msg.includes('Server has closed the connection')
    || msg.includes("Can't reach database server")
}

const basePrisma = new PrismaClient().$extends({
  query: {
    async $allOperations({ args, query }) {
      try {
        return await query(args)
      } catch (err) {
        if (!ehQuedaDeConexao(err)) throw err
        await new Promise(r => setTimeout(r, 300))
        return query(args)
      }
    },
  },
}) as unknown as PrismaClient

// Keepalive: impede o proxy de derrubar a conexão por ociosidade.
setInterval(() => {
  basePrisma.$queryRaw`SELECT 1`.catch(() => { /* reconecta na próxima query */ })
}, 30_000).unref()

// Models públicos (sem id_organizacao) que NÃO recebem filtro de tenant.
const MODELS_SEM_TENANT = new Set(['CacheCambioBacen'])

type QueryArgs = {
  where?: Record<string, unknown>
  data?: Record<string, unknown> | Record<string, unknown>[]
}
type QueryFn = (args: QueryArgs) => Promise<unknown>
type QueryCtx = { model: string; args: QueryArgs; query: QueryFn }

export function withTenantIsolation(prisma: PrismaClient, tenantId: string) {
  const filtrarWhere = ({ model, args, query }: QueryCtx) => {
    if (!MODELS_SEM_TENANT.has(model)) {
      args.where = { ...args.where, id_organizacao: tenantId }
    }
    return query(args)
  }

  return prisma.$extends({
    query: {
      $allModels: {
        findMany: filtrarWhere,
        findFirst: filtrarWhere,
        findUnique: filtrarWhere,
        update: filtrarWhere,
        updateMany: filtrarWhere,
        delete: filtrarWhere,
        deleteMany: filtrarWhere,
        count: filtrarWhere,
        aggregate: filtrarWhere,
        groupBy: filtrarWhere,
        async create({ model, args, query }: QueryCtx) {
          if (!MODELS_SEM_TENANT.has(model)) {
            args.data = { ...(args.data as Record<string, unknown>), id_organizacao: tenantId }
          }
          return query(args)
        },
        async createMany({ model, args, query }: QueryCtx) {
          if (!MODELS_SEM_TENANT.has(model)) {
            if (Array.isArray(args.data)) {
              args.data = args.data.map((d: Record<string, unknown>) => ({ ...d, id_organizacao: tenantId }))
            } else {
              args.data = { ...(args.data as Record<string, unknown>), id_organizacao: tenantId }
            }
          }
          return query(args)
        },
      },
    },
  }) as unknown as PrismaClient
}

export interface TenantRequest extends Request {
  prisma?: PrismaClient
  tenantId?: string
  idWorkspace?: string
  idUsuario?: string
}

/**
 * Middleware Express: extrai id_organizacao do header x-id-organizacao propagado pelo Gateway (JWT).
 * Nunca aceita id_organizacao do body.
 */
export function tenantIsolationMiddleware(req: TenantRequest, _res: Response, next: NextFunction) {
  const tenantId = req.headers['x-id-organizacao'] as string | undefined

  if (tenantId) {
    req.tenantId = tenantId
    req.idWorkspace = (req.headers['x-id-workspace'] as string | undefined) ?? undefined
    req.idUsuario = (req.headers['x-id-usuario'] as string | undefined) ?? undefined
    req.prisma = withTenantIsolation(basePrisma, tenantId)
  } else {
    // Sem id_organizacao: cliente raw para endpoints públicos (/health, master data)
    req.prisma = basePrisma
  }

  next()
}

export { basePrisma as prisma }
