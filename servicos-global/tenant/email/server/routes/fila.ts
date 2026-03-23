// server/routes/fila.ts
// Gerenciamento da fila de envio de emails.
// GET  /api/v1/email/fila              — lista fila com status e próxima tentativa
// POST /api/v1/email/fila/:id/cancelar — cancela um item da fila
// POST /api/v1/email/fila/pausar       — pausa toda a fila do tenant
// POST /api/v1/email/fila/retomar      — retoma a fila do tenant

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/errors.js'
import { prisma } from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'

export const filaRouter = Router()

const listarFilaSchema = z.object({
  status: z.enum(['PENDENTE', 'PROCESSANDO', 'ENVIADO', 'FALHOU', 'CANCELADO']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// ---- Listar fila ------------------------------------------------------------

filaRouter.get(
  '/api/v1/email/fila',
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
      tenant_id: tenantId,
      ...(status && { status }),
    }

    const [items, total] = await Promise.all([
      prisma.filaEmail.findMany({
        where,
        orderBy: [{ prioridade: 'desc' }, { created_at: 'asc' }],
        skip,
        take: limit,
        select: {
          id: true,
          status: true,
          prioridade: true,
          tentativas: true,
          max_tentativas: true,
          next_retry_at: true,
          erro: true,
          created_at: true,
          processado_at: true,
        },
      }),
      prisma.filaEmail.count({ where }),
    ])

    // Stats rápidas para o monitor
    const [pendente, processando, falhou] = await Promise.all([
      prisma.filaEmail.count({ where: { tenant_id: tenantId, status: 'PENDENTE' } }),
      prisma.filaEmail.count({ where: { tenant_id: tenantId, status: 'PROCESSANDO' } }),
      prisma.filaEmail.count({ where: { tenant_id: tenantId, status: 'FALHOU' } }),
    ])

    res.json({
      data: items,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
      stats: { pendente, processando, falhou },
    })
  }
)

// ---- Cancelar item da fila --------------------------------------------------

filaRouter.post(
  '/api/v1/email/fila/:id/cancelar',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { tenantId } = req.auth

    const item = await prisma.filaEmail.findFirst({
      where: { id, tenant_id: tenantId },
    })

    if (!item) {
      return next(new AppError('Item da fila não encontrado', 404, 'FILA_ITEM_NOT_FOUND'))
    }

    if (item.status === 'ENVIADO' || item.status === 'CANCELADO') {
      return next(new AppError(`Não é possível cancelar item com status ${item.status}`, 409, 'INVALID_STATUS'))
    }

    const updated = await prisma.filaEmail.update({
      where: { id },
      data: { status: 'CANCELADO' },
    })

    res.json({ data: updated })
  }
)

// ---- Pausar fila (marca todos os itens PENDENTE como aguardando) ------------
// Implementação: seta next_retry_at para data distante como sinal de pausa.

filaRouter.post(
  '/api/v1/email/fila/pausar',
  authMiddleware,
  async (req: Request, res: Response, _next: NextFunction) => {
    const { tenantId } = req.auth
    const distantFuture = new Date('2099-12-31T23:59:59Z')

    const result = await prisma.filaEmail.updateMany({
      where: { tenant_id: tenantId, status: 'PENDENTE' },
      data: { next_retry_at: distantFuture },
    })

    res.json({ message: `Fila pausada. ${result.count} item(s) afetado(s).` })
  }
)

// ---- Retomar fila -----------------------------------------------------------

filaRouter.post(
  '/api/v1/email/fila/retomar',
  authMiddleware,
  async (req: Request, res: Response, _next: NextFunction) => {
    const { tenantId } = req.auth
    const distantFuture = new Date('2099-12-31T23:59:59Z')

    const result = await prisma.filaEmail.updateMany({
      where: { tenant_id: tenantId, status: 'PENDENTE', next_retry_at: distantFuture },
      data: { next_retry_at: null },
    })

    res.json({ message: `Fila retomada. ${result.count} item(s) liberado(s).` })
  }
)
