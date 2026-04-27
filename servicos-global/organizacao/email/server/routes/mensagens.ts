// server/routes/mensagens.ts
// GET  /api/v1/threads-email/:id_thread_email/mensagens — lista mensagens de uma thread
// POST /api/v1/threads-email/:id_thread_email/mensagens — resposta manual humana

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/errors.js'
import { prisma } from '../lib/prisma.js'
import { sendEmail } from '../services/email.js'
import { authMiddleware } from '../middleware/auth.js'
import { toMensagemDto } from '../lib/dto.js'

export const mensagensRouter = Router()

// ---- Listar mensagens da thread -------------------------------------------

mensagensRouter.get(
  '/api/v1/threads-email/:id_thread_email/mensagens',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id_thread_email } = req.params
    const { tenantId } = req.auth

    const thread = await prisma.emailAssuntosParticipantes.findFirst({
      where: {
        id_email_assuntos_participantes: id_thread_email,
        id_organizacao_email_assuntos_participantes: tenantId,
      },
      select: { id_email_assuntos_participantes: true },
    })

    if (!thread) {
      return next(new AppError('Thread não encontrada', 404, 'THREAD_NOT_FOUND'))
    }

    const mensagens = await prisma.emailMensagem.findMany({
      where: {
        id_thread_email_mensagem: id_thread_email,
        id_organizacao_email_mensagem: tenantId,
      },
      orderBy: { data_envio_email_mensagem: 'asc' },
    })

    res.json({ data: mensagens.map(toMensagemDto) })
  }
)

// ---- Resposta manual humana -----------------------------------------------

const responderSchema = z.object({
  body: z.string().min(1, 'Corpo da mensagem obrigatório'),
  body_html: z.string().optional(),
})

mensagensRouter.post(
  '/api/v1/threads-email/:id_thread_email/mensagens',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id_thread_email } = req.params
    const { tenantId, userId } = req.auth

    const parse = responderSchema.safeParse(req.body)
    if (!parse.success) {
      return next(new AppError(parse.error.errors[0].message, 422, 'VALIDATION_ERROR'))
    }

    const { body, body_html } = parse.data

    // Buscar thread e última mensagem inbound para extrair destinatário
    const thread = await prisma.emailAssuntosParticipantes.findFirst({
      where: {
        id_email_assuntos_participantes: id_thread_email,
        id_organizacao_email_assuntos_participantes: tenantId,
      },
      include: {
        mensagens_email_assuntos_participantes: {
          where: { direcao_email_mensagem: 'RECEBIDO' },
          orderBy: { data_envio_email_mensagem: 'desc' },
          take: 1,
        },
      },
    })

    if (!thread) {
      return next(new AppError('Thread não encontrada', 404, 'THREAD_NOT_FOUND'))
    }

    const lastInbound = thread.mensagens_email_assuntos_participantes[0]
    if (!lastInbound) {
      return next(new AppError('Nenhuma mensagem inbound encontrada na thread', 400, 'NO_INBOUND_MESSAGE'))
    }

    const result = await sendEmail({
      tenantId,
      userId,
      to: lastInbound.remetente_email_mensagem,
      subject: `Re: ${thread.assunto_email_assuntos_participantes}`,
      html: body_html ?? `<p>${body.replace(/\n/g, '<br>')}</p>`,
      text: body,
    })

    if (!result.success) {
      return next(new AppError(`Falha ao enviar resposta: ${result.error}`, 502, 'EMAIL_SEND_FAILED'))
    }

    // Registrar mensagem outbound na thread
    const message = await prisma.emailMensagem.create({
      data: {
        id_organizacao_email_mensagem: tenantId,
        id_usuario_email_mensagem: userId,
        id_thread_email_mensagem: id_thread_email,
        direcao_email_mensagem: 'ENVIADO',
        remetente_email_mensagem: process.env.EMAIL_FROM ?? 'Gravity <no-reply@resend.dev>',
        destinatario_email_mensagem: lastInbound.remetente_email_mensagem,
        assunto_email_mensagem: `Re: ${thread.assunto_email_assuntos_participantes}`,
        corpo_email_mensagem: body,
        corpo_html_email_mensagem: body_html ?? null,
        chave_dedup_email_mensagem: result.dedupKey,
        id_mensagem_pai_email_mensagem: lastInbound.id_email_mensagem,
        acao_gabi_email_mensagem: 'none',
      },
    })

    // Atualizar contador e ultimo_contato da thread
    await prisma.emailAssuntosParticipantes.update({
      where: { id_email_assuntos_participantes: id_thread_email },
      data: {
        contagem_mensagens_email_assuntos_participantes: { increment: 1 },
        ultimo_contato_email_assuntos_participantes: new Date(),
      },
    })

    res.status(201).json({ data: toMensagemDto(message) })
  }
)
