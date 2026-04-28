// server/routes/threads.ts
// GET /api/v1/threads-email — lista threads com filtros e paginação
// GET /api/v1/threads-email/:id_thread_email — detalhe de uma thread com mensagens

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/errors.js'
import { prisma } from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'
import { toThreadDto, toMensagemDto } from '../lib/dto.js'

export const threadsRouter = Router()

// ---- Listar threads --------------------------------------------------------

const listarSchema = z.object({
  status: z.enum(['ABERTA', 'ARQUIVADA', 'RESOLVIDA']).optional(),
  sentiment: z.enum(['MUITO_POSITIVO', 'POSITIVO', 'NEUTRO', 'NEGATIVO', 'MUITO_NEGATIVO']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

threadsRouter.get(
  '/api/v1/threads-email',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const parse = listarSchema.safeParse(req.query)
    if (!parse.success) {
      return next(new AppError(parse.error.errors[0].message, 422, 'VALIDATION_ERROR'))
    }

    const { status, sentiment, page, limit } = parse.data
    const { id_organizacao: tenantId } = req.auth
    const skip = (page - 1) * limit

    const where = {
      id_organizacao_email_assuntos_participantes: tenantId,
      ...(status && { status_email_assuntos_participantes: status }),
      ...(sentiment && { rotulo_sentimento_email_assuntos_participantes: sentiment }),
    }

    const [threads, total] = await Promise.all([
      prisma.emailAssuntosParticipantes.findMany({
        where,
        orderBy: { data_atualizacao_email_assuntos_participantes: 'desc' },
        skip,
        take: limit,
      }),
      prisma.emailAssuntosParticipantes.count({ where }),
    ])

    res.json({
      data: threads.map(toThreadDto),
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  }
)

// ---- Detalhe de thread com mensagens ---------------------------------------

threadsRouter.get(
  '/api/v1/threads-email/:id_thread_email',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id_thread_email } = req.params
    const { id_organizacao: tenantId } = req.auth

    const thread = await prisma.emailAssuntosParticipantes.findFirst({
      where: {
        id_email_assuntos_participantes: id_thread_email,
        id_organizacao_email_assuntos_participantes: tenantId,
      },
      include: {
        mensagens_email_assuntos_participantes: {
          orderBy: { data_envio_email_mensagem: 'asc' },
        },
      },
    })

    if (!thread) {
      return next(new AppError('Thread não encontrada', 404, 'THREAD_NOT_FOUND'))
    }

    res.json({
      data: {
        ...toThreadDto(thread),
        mensagens: thread.mensagens_email_assuntos_participantes.map(toMensagemDto),
      },
    })
  }
)

// ---- Alterar status de thread ----------------------------------------------

const statusSchema = z.object({
  status: z.enum(['ABERTA', 'ARQUIVADA', 'RESOLVIDA']),
})

threadsRouter.patch(
  '/api/v1/threads-email/:id_thread_email/status',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id_thread_email } = req.params
    const { id_organizacao: tenantId } = req.auth

    const parse = statusSchema.safeParse(req.body)
    if (!parse.success) {
      return next(new AppError(parse.error.errors[0].message, 422, 'VALIDATION_ERROR'))
    }

    const thread = await prisma.emailAssuntosParticipantes.findFirst({
      where: {
        id_email_assuntos_participantes: id_thread_email,
        id_organizacao_email_assuntos_participantes: tenantId,
      },
    })

    if (!thread) {
      return next(new AppError('Thread não encontrada', 404, 'THREAD_NOT_FOUND'))
    }

    const updated = await prisma.emailAssuntosParticipantes.update({
      where: { id_email_assuntos_participantes: id_thread_email },
      data: { status_email_assuntos_participantes: parse.data.status },
    })

    res.json({ data: toThreadDto(updated) })
  }
)
