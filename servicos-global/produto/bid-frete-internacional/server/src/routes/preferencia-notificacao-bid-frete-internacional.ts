/**
 * GET/PUT preferências de notificação — BID Frete Internacional (por usuário).
 */
import { Router, Request, Response, NextFunction } from 'express'
import type { PrismaClient } from '../generated/client/index.js'
import { AppError } from '../lib/erros.js'
import {
  preferenciasNotificacaoBidFreteSchema,
  type PreferenciasNotificacaoBidFrete,
} from '../../../shared/preferencias-notificacao-bid-frete-internacional.js'
import { lerPreferenciasNotificacaoBidFreteInternacional } from '../lib/ler-preferencias-notificacao-bid-frete-internacional.js'
import { salvarPreferenciasNotificacaoBidFreteInternacional } from '../lib/salvar-preferencias-notificacao-bid-frete-internacional.js'

export const preferenciaNotificacaoBidFreteRouter = Router()

type ReqComTenant = Request & { prisma?: PrismaClient; tenantId?: string }

function resolverCtx(req: ReqComTenant): {
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

preferenciaNotificacaoBidFreteRouter.get(
  '/notificacoes',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { db, idOrganizacao, idUsuario } = resolverCtx(req as ReqComTenant)
      const preferencias = await lerPreferenciasNotificacaoBidFreteInternacional(
        db,
        idOrganizacao,
        idUsuario,
      )
      res.json({ data: { preferencias_notificacao_bid_frete_internacional: preferencias } })
    } catch (err) {
      next(err)
    }
  },
)

preferenciaNotificacaoBidFreteRouter.put(
  '/notificacoes',
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = preferenciasNotificacaoBidFreteSchema.safeParse(
      req.body?.preferencias_notificacao_bid_frete_internacional ?? req.body,
    )
    if (!parsed.success) {
      return next(
        new AppError(parsed.error.errors[0]?.message ?? 'Payload inválido', 400, 'VALIDATION_ERROR'),
      )
    }

    try {
      const { db, idOrganizacao, idUsuario } = resolverCtx(req as ReqComTenant)
      const preferencias = await salvarPreferenciasNotificacaoBidFreteInternacional(
        db,
        idOrganizacao,
        idUsuario,
        parsed.data,
      )
      res.json({ data: { preferencias_notificacao_bid_frete_internacional: preferencias } })
    } catch (err) {
      next(err)
    }
  },
)
