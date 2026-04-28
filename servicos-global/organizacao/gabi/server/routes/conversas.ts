// server/routes/conversas.ts
import { Router } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'

export const conversasRouter = Router()

const createConversaSchema = z.object({
  title: z.string().optional(),
  product_id: z.string().optional().nullable(),
})

// ---- ACL DTO ----
function toConversaDto(c: {
  id_gabi_conversa: string
  id_organizacao_gabi_conversa: string
  id_produto_gabi_conversa: string | null
  id_usuario_gabi_conversa: string | null
  titulo_gabi_conversa: string | null
  data_criacao_gabi_conversa: Date
  data_atualizacao_gabi_conversa: Date
}) {
  return {
    id: c.id_gabi_conversa,
    tenant_id: c.id_organizacao_gabi_conversa,
    product_id: c.id_produto_gabi_conversa,
    user_id: c.id_usuario_gabi_conversa,
    title: c.titulo_gabi_conversa,
    created_at: c.data_criacao_gabi_conversa,
    updated_at: c.data_atualizacao_gabi_conversa,
  }
}

conversasRouter.post('/api/v1/gabi/conversas', async (req, res, next) => {
  try {
    const { id_organizacao: tenantId, id_usuario: userId } = req.auth
    const { title, product_id } = createConversaSchema.parse(req.body)

    const result = await prisma.gabiConversaCompleta.create({
      data: {
        id_organizacao_gabi_conversa: tenantId,
        id_usuario_gabi_conversa: userId || null,
        id_produto_gabi_conversa: product_id ?? null,
        titulo_gabi_conversa: title || 'Nova Conversa',
      },
    })

    res.status(201).json(toConversaDto(result))
  } catch (error) {
    next(error)
  }
})

conversasRouter.get('/api/v1/gabi/conversas', async (req, res, next) => {
  try {
    const { id_organizacao: tenantId, id_usuario: userId } = req.auth
    const conversas = await prisma.gabiConversaCompleta.findMany({
      where: {
        id_organizacao_gabi_conversa: tenantId,
        id_usuario_gabi_conversa: userId,
      },
      orderBy: { data_atualizacao_gabi_conversa: 'desc' },
    })
    res.json(conversas.map(toConversaDto))
  } catch (error) {
    next(error)
  }
})

conversasRouter.delete('/api/v1/gabi/conversas/:id_conversa_gabi', async (req, res, next) => {
  try {
    const { id_organizacao: tenantId } = req.auth
    const { id_conversa_gabi: id } = req.params

    const conversa = await prisma.gabiConversaCompleta.findUnique({
      where: { id_gabi_conversa: id },
    })
    if (!conversa || conversa.id_organizacao_gabi_conversa !== tenantId) {
      throw new AppError('Conversa não encontrada', 404, 'NOT_FOUND')
    }

    await prisma.gabiConversaCompleta.delete({ where: { id_gabi_conversa: id } })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})
