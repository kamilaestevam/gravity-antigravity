// server/routes/fila.ts
// Gerenciamento da fila de envio de emails.
// GET  /api/v1/envios-email/fila                     — lista fila com status e próxima tentativa
// POST /api/v1/envios-email/fila/:id_envio/cancelar  — cancela um item da fila
// POST /api/v1/envios-email/fila/pausar              — pausa toda a fila do tenant
// POST /api/v1/envios-email/fila/retomar             — retoma a fila do tenant

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/errors.js'
import { prisma } from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'
import { toFilaItemDto } from '../lib/dto.js'

export const filaRouter = Router()

const listarFilaSchema = z.object({
  status: z.enum(['PENDENTE', 'PROCESSANDO', 'ENVIADO', 'FALHOU', 'CANCELADO']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// ---- Listar fila ------------------------------------------------------------

filaRouter.get(
  '/api/v1/envios-email/fila',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const parse = listarFilaSchema.safeParse(req.query)
    if (!parse.success) {
      return next(new AppError(parse.error.errors[0].message, 422, 'VALIDATION_ERROR'))
    }

    const { status, page, limit } = parse.data
    const { tenantId } = req.auth
    const skip = (page - 1) * limit

    const where = {
      id_organizacao_email_fila_envio: tenantId,
      ...(status && { status_email_fila_envio: status }),
    }

    const [items, total] = await Promise.all([
      prisma.emailFilaEnvio.findMany({
        where,
        orderBy: [
          { prioridade_email_fila_envio: 'desc' },
          { data_criacao_email_fila_envio: 'asc' },
        ],
        skip,
        take: limit,
      }),
      prisma.emailFilaEnvio.count({ where }),
    ])

    // Stats rápidas para o monitor
    const [pendente, processando, falhou] = await Promise.all([
      prisma.emailFilaEnvio.count({
        where: { id_organizacao_email_fila_envio: tenantId, status_email_fila_envio: 'PENDENTE' },
      }),
      prisma.emailFilaEnvio.count({
        where: { id_organizacao_email_fila_envio: tenantId, status_email_fila_envio: 'PROCESSANDO' },
      }),
      prisma.emailFilaEnvio.count({
        where: { id_organizacao_email_fila_envio: tenantId, status_email_fila_envio: 'FALHOU' },
      }),
    ])

    res.json({
      data: items.map(toFilaItemDto),
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
      stats: { pendente, processando, falhou },
    })
  }
)

// ---- Cancelar item da fila --------------------------------------------------

filaRouter.post(
  '/api/v1/envios-email/fila/:id_envio/cancelar',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id_envio } = req.params
    const { tenantId } = req.auth

    const item = await prisma.emailFilaEnvio.findFirst({
      where: {
        id_email_fila_envio: id_envio,
        id_organizacao_email_fila_envio: tenantId,
      },
    })

    if (!item) {
      return next(new AppError('Item da fila não encontrado', 404, 'FILA_ITEM_NOT_FOUND'))
    }

    if (
      item.status_email_fila_envio === 'ENVIADO' ||
      item.status_email_fila_envio === 'CANCELADO'
    ) {
      return next(new AppError(
        `Não é possível cancelar item com status ${item.status_email_fila_envio}`,
        409,
        'INVALID_STATUS',
      ))
    }

    const updated = await prisma.emailFilaEnvio.update({
      where: { id_email_fila_envio: id_envio },
      data: { status_email_fila_envio: 'CANCELADO' },
    })

    res.json({ data: toFilaItemDto(updated) })
  }
)

// ---- Pausar fila (marca todos os itens PENDENTE como aguardando) ------------
// Implementação: seta proxima_tentativa_em para data distante como sinal de pausa.

filaRouter.post(
  '/api/v1/envios-email/fila/pausar',
  authMiddleware,
  async (req: Request, res: Response, _next: NextFunction) => {
    const { tenantId } = req.auth
    const distantFuture = new Date('2099-12-31T23:59:59Z')

    const result = await prisma.emailFilaEnvio.updateMany({
      where: {
        id_organizacao_email_fila_envio: tenantId,
        status_email_fila_envio: 'PENDENTE',
      },
      data: { proxima_tentativa_em_email_fila_envio: distantFuture },
    })

    res.json({ message: `Fila pausada. ${result.count} item(s) afetado(s).` })
  }
)

// ---- Retomar fila -----------------------------------------------------------

filaRouter.post(
  '/api/v1/envios-email/fila/retomar',
  authMiddleware,
  async (req: Request, res: Response, _next: NextFunction) => {
    const { tenantId } = req.auth
    const distantFuture = new Date('2099-12-31T23:59:59Z')

    const result = await prisma.emailFilaEnvio.updateMany({
      where: {
        id_organizacao_email_fila_envio: tenantId,
        status_email_fila_envio: 'PENDENTE',
        proxima_tentativa_em_email_fila_envio: distantFuture,
      },
      data: { proxima_tentativa_em_email_fila_envio: null },
    })

    res.json({ message: `Fila retomada. ${result.count} item(s) liberado(s).` })
  }
)
