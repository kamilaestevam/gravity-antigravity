// server/routes/mensagens.ts
import { Router } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'

export const mensagensRouter = Router()

// ---- ACL DTO ----
function toMensagemDto(m: {
  id_gabi_mensagem: string
  id_organizacao_gabi_mensagem: string
  id_produto_gabi_mensagem: string | null
  id_usuario_gabi_mensagem: string | null
  id_conversa_gabi_mensagem: string
  papel_gabi_mensagem: string
  conteudo_gabi_mensagem: string
  anexos_gabi_mensagem: string | null
  data_criacao_gabi_mensagem: Date
  data_atualizacao_gabi_mensagem: Date
}) {
  return {
    id: m.id_gabi_mensagem,
    tenant_id: m.id_organizacao_gabi_mensagem,
    product_id: m.id_produto_gabi_mensagem,
    user_id: m.id_usuario_gabi_mensagem,
    conversation_id: m.id_conversa_gabi_mensagem,
    role: m.papel_gabi_mensagem,
    content: m.conteudo_gabi_mensagem,
    attachments: m.anexos_gabi_mensagem,
    created_at: m.data_criacao_gabi_mensagem,
    updated_at: m.data_atualizacao_gabi_mensagem,
  }
}

mensagensRouter.get('/api/v1/gabi/conversas/:id_conversa_gabi/mensagens', async (req, res, next) => {
  try {
    const { id_organizacao: tenantId } = req.auth
    const { id_conversa_gabi: conversationId } = req.params

    const conversa = await prisma.gabiConversaCompleta.findFirst({
      where: {
        id_gabi_conversa: conversationId,
        id_organizacao_gabi_conversa: tenantId,
      },
    })
    if (!conversa) {
      throw new AppError('Conversa não encontrada', 404, 'NOT_FOUND')
    }

    const mensagens = await prisma.gabiMensagemIndividual.findMany({
      where: {
        id_conversa_gabi_mensagem: conversationId,
        id_organizacao_gabi_mensagem: tenantId,
      },
      orderBy: { data_criacao_gabi_mensagem: 'asc' },
    })

    res.json(mensagens.map(toMensagemDto))
  } catch (error) {
    next(error)
  }
})

const createMensagemSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
})

mensagensRouter.post('/api/v1/gabi/conversas/:id_conversa_gabi/mensagens', async (req, res, next) => {
  try {
    const { id_organizacao: tenantId, id_usuario: userId } = req.auth
    const { id_conversa_gabi: conversationId } = req.params
    const { role, content } = createMensagemSchema.parse(req.body)

    const conversa = await prisma.gabiConversaCompleta.findFirst({
      where: {
        id_gabi_conversa: conversationId,
        id_organizacao_gabi_conversa: tenantId,
      },
    })
    if (!conversa) {
      throw new AppError('Conversa não encontrada', 404, 'NOT_FOUND')
    }

    const mensagem = await prisma.gabiMensagemIndividual.create({
      data: {
        id_organizacao_gabi_mensagem: tenantId,
        id_usuario_gabi_mensagem: userId || null,
        id_conversa_gabi_mensagem: conversationId,
        papel_gabi_mensagem: role,
        conteudo_gabi_mensagem: content,
      },
    })

    // Atualiza o data_atualizacao da conversa
    await prisma.gabiConversaCompleta.update({
      where: { id_gabi_conversa: conversationId },
      data: { data_atualizacao_gabi_conversa: new Date() },
    })

    res.status(201).json(toMensagemDto(mensagem))
  } catch (error) {
    next(error)
  }
})
