// server/routes/conversas.ts
import { Router } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'

export const conversasRouter = Router()

const createConversaSchema = z.object({
  title: z.string().optional()
})

conversasRouter.post('/api/v1/gabi/conversas', async (req, res, next) => {
  try {
    const { tenantId, userId } = req.auth
    const { title } = createConversaSchema.parse(req.body)

    const result = await prisma.conversaCompletaGabi.create({
      data: {
        tenant_id: tenantId,
        user_id: userId,
        title: title || 'Nova Conversa'
      }
    })

    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
})

conversasRouter.get('/api/v1/gabi/conversas', async (req, res, next) => {
  try {
    const { tenantId, userId } = req.auth
    const conversas = await prisma.conversaCompletaGabi.findMany({
      where: {
        tenant_id: tenantId,
        user_id: userId
      },
      orderBy: { updated_at: 'desc' }
    })
    res.json(conversas)
  } catch (error) {
    next(error)
  }
})

conversasRouter.delete('/api/v1/gabi/conversas/:id', async (req, res, next) => {
  try {
    const { tenantId } = req.auth
    const { id } = req.params

    const conversa = await prisma.conversaCompletaGabi.findUnique({ where: { id } })
    if (!conversa || conversa.tenant_id !== tenantId) {
      throw new AppError('Conversa não encontrada', 404, 'NOT_FOUND')
    }

    await prisma.conversaCompletaGabi.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})
