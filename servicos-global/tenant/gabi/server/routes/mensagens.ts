// server/routes/mensagens.ts
import { Router } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'
import { withTenantIsolation } from '../../../middleware/withTenantIsolation.js'

export const mensagensRouter = Router()

mensagensRouter.get('/api/v1/gabi/conversas/:id/mensagens', async (req, res, next) => {
  try {
    const { tenantId } = req.auth
    const { id: conversationId } = req.params
    const db = withTenantIsolation(prisma, tenantId)

    const conversa = await db.gabiConversation.findFirst({ where: { id: conversationId } })
    if (!conversa) {
      throw new AppError('Conversa não encontrada', 404, 'NOT_FOUND')
    }

    const mensagens = await db.gabiMessage.findMany({
      where: { conversation_id: conversationId },
      orderBy: { created_at: 'asc' }
    })

    res.json(mensagens)
  } catch (error) {
    next(error)
  }
})

const createMensagemSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1)
})

mensagensRouter.post('/api/v1/gabi/conversas/:id/mensagens', async (req, res, next) => {
  try {
    const { tenantId, userId } = req.auth
    const { id: conversationId } = req.params
    const { role, content } = createMensagemSchema.parse(req.body)
    const db = withTenantIsolation(prisma, tenantId)

    const conversa = await db.gabiConversation.findFirst({ where: { id: conversationId } })
    if (!conversa) {
      throw new AppError('Conversa não encontrada', 404, 'NOT_FOUND')
    }

    const mensagem = await db.gabiMessage.create({
      data: {
        user_id: userId,
        conversation_id: conversationId,
        role,
        content
      }
    })

    // Atualiza o updated_at da conversa
    await db.gabiConversation.update({
      where: { id: conversationId },
      data: { updated_at: new Date() }
    })

    res.status(201).json(mensagem)
  } catch (error) {
    next(error)
  }
})
