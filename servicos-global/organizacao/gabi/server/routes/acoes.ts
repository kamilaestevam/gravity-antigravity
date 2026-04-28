// server/routes/acoes.ts
import { Router } from 'express'
import { z } from 'zod'
import { executeGabiAction } from '../services/execute.js'

export const acoesRouter = Router()

const acaoSchema = z.object({
  action: z.string(),
  resource: z.string(),
  payload: z.any().optional(),
  confirmed: z.boolean().optional(),
  conversationSnapshot: z.string().min(1)
})

acoesRouter.post('/api/v1/gabi/acoes/executar', async (req, res, next) => {
  try {
    const { id_organizacao: tenantId, id_usuario: userId } = req.auth
    const { action, resource, payload, confirmed, conversationSnapshot } = acaoSchema.parse(req.body)

    const result = await executeGabiAction(
      userId,
      tenantId,
      {
        type: action,
        resource,
        context: conversationSnapshot,
        confirmed,
        data: payload
      }
    )

    if (result.requiresConfirmation) {
      res.status(428).json(result) // 428 Precondition Required
      return
    }

    res.json(result)
  } catch (error) {
    next(error)
  }
})
