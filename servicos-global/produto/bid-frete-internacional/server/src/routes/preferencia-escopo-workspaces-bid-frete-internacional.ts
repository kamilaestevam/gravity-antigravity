/**
 * GET/PUT escopo multi-workspace — BID Frete Internacional
 *
 * Persistência em lista_painel_usuario_global (painel reservado, oculto na UI da Lista).
 * Usa req.prisma do tenantIsolationMiddleware (paridade cotacoes.ts).
 */
import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import type { PrismaClient } from '../generated/client/index.js'
import { AppError } from '../lib/erros.js'
import {
  NOME_PAINEL_META_ESCOPO_WORKSPACES_BID_FRETE,
  parsearEscopoWorkspacesBidFrete,
  serializarEscopoWorkspacesBidFrete,
} from '../../../shared/preferenciasEscopoWorkspacesBidFreteInternacional.js'
import { ID_PRODUTO_GRAVITY_BID_FRETE_INTERNACIONAL } from '../../../shared/listaPainelConfigSchema.js'
import { assertIdsWorkspacesEscopoAutorizados } from '../shared/validar-multi-workspace-bid-frete-internacional.js'

export const preferenciaEscopoWorkspacesBidFreteRouter = Router()

const EscopoPutSchema = z.object({
  ids_workspaces_escopo: z.array(z.string()),
})

type ReqComTenant = Request & { prisma?: PrismaClient; tenantId?: string }

function whereUsuarioProduto(idOrganizacao: string, idUsuario: string) {
  return {
    id_organizacao: idOrganizacao,
    id_usuario: idUsuario,
    id_produto_gravity: ID_PRODUTO_GRAVITY_BID_FRETE_INTERNACIONAL,
  }
}

function resolverCtxListaPainel(req: ReqComTenant): {
  db: PrismaClient
  idOrganizacao: string
  idUsuario: string
} {
  if (!req.prisma) {
    throw new AppError('Prisma tenant não disponível', 500, 'INTERNAL_ERROR')
  }
  const idOrganizacao = req.tenantId ?? (req.headers['x-id-organizacao'] as string | undefined)
  const idUsuario = req.headers['x-id-usuario'] as string | undefined
  if (!idOrganizacao) {
    throw new AppError('x-id-organizacao obrigatório', 401, 'UNAUTHORIZED')
  }
  if (!idUsuario) {
    throw new AppError('x-id-usuario obrigatório', 401, 'UNAUTHORIZED')
  }
  return { db: req.prisma, idOrganizacao, idUsuario }
}

preferenciaEscopoWorkspacesBidFreteRouter.get(
  '/escopo-workspaces',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { db, idOrganizacao, idUsuario } = resolverCtxListaPainel(req as ReqComTenant)

      const meta = await db.listaPainelUsuarioGlobal.findFirst({
        where: {
          ...whereUsuarioProduto(idOrganizacao, idUsuario),
          nome_lista_painel_usuario_global: NOME_PAINEL_META_ESCOPO_WORKSPACES_BID_FRETE,
        },
      })

      const ids = meta
        ? parsearEscopoWorkspacesBidFrete(meta.config_json_lista_painel_usuario_global)
        : undefined

      res.json({
        data: ids !== undefined ? { ids_workspaces_escopo: ids } : null,
      })
    } catch (err) {
      next(err)
    }
  },
)

preferenciaEscopoWorkspacesBidFreteRouter.put(
  '/escopo-workspaces',
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = EscopoPutSchema.safeParse(req.body)
    if (!parsed.success) {
      return next(
        new AppError(parsed.error.errors[0]?.message ?? 'Payload inválido', 400, 'VALIDATION_ERROR'),
      )
    }

    try {
      const { db, idOrganizacao, idUsuario } = resolverCtxListaPainel(req as ReqComTenant)

      await assertIdsWorkspacesEscopoAutorizados(
        { idOrganizacao, idUsuario },
        parsed.data.ids_workspaces_escopo,
      )

      const configJson = serializarEscopoWorkspacesBidFrete(parsed.data.ids_workspaces_escopo)

      const existente = await db.listaPainelUsuarioGlobal.findFirst({
        where: {
          ...whereUsuarioProduto(idOrganizacao, idUsuario),
          nome_lista_painel_usuario_global: NOME_PAINEL_META_ESCOPO_WORKSPACES_BID_FRETE,
        },
      })

      if (existente) {
        await db.listaPainelUsuarioGlobal.update({
          where: { id_lista_painel_usuario_global: existente.id_lista_painel_usuario_global },
          data: { config_json_lista_painel_usuario_global: configJson },
        })
      } else {
        await db.listaPainelUsuarioGlobal.create({
          data: {
            ...whereUsuarioProduto(idOrganizacao, idUsuario),
            nome_lista_painel_usuario_global: NOME_PAINEL_META_ESCOPO_WORKSPACES_BID_FRETE,
            ordem_lista_painel_usuario_global: -1,
            visivel_lista_painel_usuario_global: false,
            config_json_lista_painel_usuario_global: configJson,
          },
        })
      }

      res.json({
        data: { ids_workspaces_escopo: parsed.data.ids_workspaces_escopo },
      })
    } catch (err) {
      next(err)
    }
  },
)
