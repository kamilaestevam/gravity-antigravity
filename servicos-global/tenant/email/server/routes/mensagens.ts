// server/routes/mensagens.ts
// GET  /api/v1/email/threads/:id/mensagens — lista mensagens de uma thread
// POST /api/v1/email/threads/:id/responder — resposta manual humana

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/errors.js'
import { prisma } from '../lib/prisma.js'
import { sendEmail } from '../services/email.js'
import { authMiddleware } from '../middleware/auth.js'

export const mensagensRouter = Router()

// ---- Listar mensagens da thread -------------------------------------------

mensagensRouter.get(
  '/api/v1/email/threads/:id/mensagens',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { tenantId } = req.auth

    const thread = await prisma.emailThread.findFirst({
      where: { id, tenant_id: tenantId },
      select: { id: true },
    })

    if (!thread) {
      return next(new AppError('Thread não encontrada', 404, 'THREAD_NOT_FOUND'))
    }

    const mensagens = await prisma.emailMessage.findMany({
      where: { thread_id: id, tenant_id: tenantId },
      orderBy: { sent_at: 'asc' },
    })

    res.json({ data: mensagens })
  }
)

// ---- Resposta manual humana -----------------------------------------------

const responderSchema = z.object({
  body: z.string().min(1, 'Corpo da mensagem obrigatório'),
  body_html: z.string().optional(),
})

mensagensRouter.post(
  '/api/v1/email/threads/:id/responder',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { tenantId, userId } = req.auth

    const parse = responderSchema.safeParse(req.body)
    if (!parse.success) {
      return next(new AppError(parse.error.errors[0].message, 422, 'VALIDATION_ERROR'))
    }

    const { body, body_html } = parse.data

    // Buscar thread e última mensagem de inbound para extrair destinatário
    const thread = await prisma.emailThread.findFirst({
      where: { id, tenant_id: tenantId },
      include: {
        mensagens: {
          where: { direction: 'INBOUND' },
          orderBy: { sent_at: 'desc' },
          take: 1,
        },
      },
    })

    if (!thread) {
      return next(new AppError('Thread não encontrada', 404, 'THREAD_NOT_FOUND'))
    }

    const lastInbound = thread.mensagens[0]
    if (!lastInbound) {
      return next(new AppError('Nenhuma mensagem inbound encontrada na thread', 400, 'NO_INBOUND_MESSAGE'))
    }

    const result = await sendEmail({
      tenantId,
      userId,
      to: lastInbound.from,
      subject: `Re: ${thread.subject}`,
      html: body_html ?? `<p>${body.replace(/\n/g, '<br>')}</p>`,
      text: body,
    })

    if (!result.success) {
      return next(new AppError(`Falha ao enviar resposta: ${result.error}`, 502, 'EMAIL_SEND_FAILED'))
    }

    // Registrar mensagem outbound na thread
    const message = await prisma.emailMessage.create({
      data: {
        tenant_id: tenantId,
        user_id: userId,
        thread_id: id,
        direction: 'OUTBOUND',
        from: process.env.EMAIL_FROM ?? 'Gravity <no-reply@resend.dev>',
        to: lastInbound.from,
        subject: `Re: ${thread.subject}`,
        body,
        body_html: body_html ?? null,
        dedup_key: result.dedupKey,
        parent_message_id: lastInbound.id,
        gabi_action: 'none',
      },
    })

    // Atualizar contador e ultimo_contato da thread
    await prisma.emailThread.update({
      where: { id },
      data: {
        mensagens_count: { increment: 1 },
        ultimo_contato: new Date(),
      },
    })

    res.status(201).json({ data: message })
  }
)
