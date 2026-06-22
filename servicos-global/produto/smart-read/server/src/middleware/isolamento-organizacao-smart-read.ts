/**
 * Injeta req.prisma com filtro obrigatório por id_organizacao (header x-id-organizacao).
 */
import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '../generated/client/index.js'
import { bancoSmartReadConfigurado, resolverUrlBancoSmartRead } from '../lib/url-banco-smart-read.js'

type QueryArgs = {
  where?: Record<string, unknown>
  data?: Record<string, unknown> | Record<string, unknown>[]
}
type QueryFn = (args: QueryArgs) => Promise<unknown>
type QueryCtx = { args: QueryArgs; query: QueryFn }

let basePrisma: PrismaClient | null = null

function obterPrismaBase(): PrismaClient {
  if (!basePrisma) {
    basePrisma = new PrismaClient({
      datasources: {
        db: { url: resolverUrlBancoSmartRead() },
      },
    })
  }
  return basePrisma
}

export function withIsolamentoOrganizacaoSmartRead(prisma: PrismaClient, idOrganizacao: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ args, query }: QueryCtx) {
          args.where = { ...args.where, id_organizacao: idOrganizacao }
          return query(args)
        },
        async findFirst({ args, query }: QueryCtx) {
          args.where = { ...args.where, id_organizacao: idOrganizacao }
          return query(args)
        },
        async findUnique({ args, query }: QueryCtx) {
          args.where = { ...args.where, id_organizacao: idOrganizacao }
          return query(args)
        },
        async create({ args, query }: QueryCtx) {
          args.data = { ...(args.data as Record<string, unknown>), id_organizacao: idOrganizacao }
          return query(args)
        },
        async update({ args, query }: QueryCtx) {
          args.where = { ...args.where, id_organizacao: idOrganizacao }
          return query(args)
        },
        async updateMany({ args, query }: QueryCtx) {
          args.where = { ...args.where, id_organizacao: idOrganizacao }
          return query(args)
        },
        async delete({ args, query }: QueryCtx) {
          args.where = { ...args.where, id_organizacao: idOrganizacao }
          return query(args)
        },
        async deleteMany({ args, query }: QueryCtx) {
          args.where = { ...args.where, id_organizacao: idOrganizacao }
          return query(args)
        },
        async count({ args, query }: QueryCtx) {
          args.where = { ...args.where, id_organizacao: idOrganizacao }
          return query(args)
        },
      },
    },
  }) as unknown as PrismaClient
}

export type RequisicaoComPrismaSmartRead = Request & {
  prisma?: PrismaClient
  idOrganizacao?: string
}

export function isolamentoOrganizacaoSmartReadMiddleware(
  req: RequisicaoComPrismaSmartRead,
  _res: Response,
  next: NextFunction,
) {
  const idOrganizacao = req.headers['x-id-organizacao']
  if (typeof idOrganizacao === 'string' && idOrganizacao && bancoSmartReadConfigurado()) {
    req.idOrganizacao = idOrganizacao
    req.prisma = withIsolamentoOrganizacaoSmartRead(obterPrismaBase(), idOrganizacao)
  }
  next()
}

export { obterPrismaBase as prismaSmartRead }
