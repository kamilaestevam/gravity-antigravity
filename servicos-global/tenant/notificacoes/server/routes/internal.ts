/**
 * notificacoes/server/routes/internal.ts
 * Rota S2S para criar notificações direcionadas a outros usuários.
 *
 * Onda 37 — DDD Servicos: campos físicos com sufixo _notificacoes_titulo_corpo;
 * contrato público de entrada (tenant_id, user_ids, type, title, message,
 * product_id, target_entity, target_id) preservado.
 *
 * Protegida por x-internal-key (timing-safe) — NUNCA exposta ao browser.
 */

import { Router, type Request, type Response, type NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'
import { emitToUser } from './api'
import { withInternalKeyValidation } from '../../../middleware/withInternalKeyValidation'

export const internalRoutes = Router()

internalRoutes.use(withInternalKeyValidation)

// ─── Schema Zod ──────────────────────────────────────────────────────────────
const internalCreateSchema = z.object({
  tenant_id: z.string().min(1),
  user_ids: z.array(z.string().min(1)).min(1).max(100),
  type: z.enum(['aviso', 'mencao', 'sistema', 'tarefa', 'compartilhamento']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  product_id: z.string().min(1).optional(),
  target_entity: z.string().min(1).optional(),
  target_id: z.string().min(1).optional(),
})

export type InternalNotificationPayload = z.infer<typeof internalCreateSchema>

// ─── POST /api/v1/notificacoes/internal ──────────────────────────────────────
internalRoutes.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = internalCreateSchema.parse(req.body)

    const created = await prisma.notificacoesTituloCorpo.createMany({
      data: body.user_ids.map((uid) => ({
        id_organizacao_notificacoes_titulo_corpo: body.tenant_id,
        id_usuario_notificacoes_titulo_corpo:     uid,
        id_produto_notificacoes_titulo_corpo:     body.product_id ?? null,
        tipo_notificacoes_titulo_corpo:           body.type,
        titulo_notificacoes_titulo_corpo:         body.title,
        mensagem_notificacoes_titulo_corpo:       body.message,
        entidade_alvo_notificacoes_titulo_corpo:  body.target_entity ?? null,
        id_alvo_notificacoes_titulo_corpo:        body.target_id ?? null,
      })),
    })

    for (const uid of body.user_ids) {
      emitToUser(uid, 'new_notification', { type: body.type })
    }

    res.status(201).json({ status: 'success', count: created.count })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new AppError(`Body inválido: ${err.issues.map((i) => i.message).join(', ')}`, 400))
    }
    next(err)
  }
})
