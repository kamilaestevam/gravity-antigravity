// server/routes/threads.ts
// GET /api/v1/email/threads — lista threads com filtros e paginação
// GET /api/v1/email/threads/:id — detalhe de uma thread com mensagens

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/errors.js'
import { prisma } from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'

export const threadsRouter = Router()

// ---- Listar threads --------------------------------------------------------

const listarSchema = z.object({
  status: z.enum(['ABERTA', 'ARQUIVADA', 'RESOLVIDA']).optional(),
  sentiment: z.enum(['MUITO_POSITIVO', 'POSITIVO', 'NEUTRO', 'NEGATIVO', 'MUITO_NEGATIVO']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

threadsRouter.get(
  '/api/v1/email/threads',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const parse = listarSchema.safeParse(req.query)
    if (!parse.success) {
      return next(new AppError(parse.error.errors[0].message, 422, 'VALIDATION_ERROR'))
    }

    const { status, sentiment, page, limit } = parse.data
    const { tenantId } = req.auth
    const skip = (page - 1) * limit

    const where = {
      tenant_id: tenantId,
      ...(status && { status }),
      ...(sentiment && { sentiment_label: sentiment }),
    }

    const [threads, total] = await Promise.all([
      prisma.emailAssuntosParticipantes.findMany({
        where,
        orderBy: { updated_at: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          subject: true,
          status: true,
          sentiment: true,
          sentiment_label: true,
          mensagens_count: true,
          ultimo_contato: true,
          created_at: true,
          updated_at: true,
        },
      }),
      prisma.emailAssuntosParticipantes.count({ where }),
    ])

    res.json({
      data: threads,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  }
)

// ---- Detalhe de thread com mensagens ---------------------------------------

threadsRouter.get(
  '/api/v1/email/threads/:id',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { tenantId } = req.auth

    const thread = await prisma.emailAssuntosParticipantes.findFirst({
      where: { id, tenant_id: tenantId },
      include: {
        mensagens: {
          orderBy: { sent_at: 'asc' },
          select: {
            id: true,
            direction: true,
            from: true,
            to: true,
            subject: true,
            body: true,
            body_html: true,
            gabi_response: true,
            gabi_confidence: true,
            gabi_action: true,
            sent_at: true,
          },
        },
      },
    })

    if (!thread) {
      return next(new AppError('Thread não encontrada', 404, 'THREAD_NOT_FOUND'))
    }

    res.json({ data: thread })
  }
)

// ---- Alterar status de thread ----------------------------------------------

const statusSchema = z.object({
  status: z.enum(['ABERTA', 'ARQUIVADA', 'RESOLVIDA']),
})

threadsRouter.patch(
  '/api/v1/email/threads/:id/status',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { tenantId } = req.auth

    const parse = statusSchema.safeParse(req.body)
    if (!parse.success) {
      return next(new AppError(parse.error.errors[0].message, 422, 'VALIDATION_ERROR'))
    }

    const thread = await prisma.emailAssuntosParticipantes.findFirst({
      where: { id, tenant_id: tenantId },
    })

    if (!thread) {
      return next(new AppError('Thread não encontrada', 404, 'THREAD_NOT_FOUND'))
    }

    const updated = await prisma.emailAssuntosParticipantes.update({
      where: { id },
      data: { status: parse.data.status },
    })

    res.json({ data: updated })
  }
)
