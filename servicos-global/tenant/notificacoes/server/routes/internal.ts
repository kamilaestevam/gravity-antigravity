/**
 * notificacoes/server/routes/internal.ts
 * Rota S2S para criar notificações direcionadas a outros usuários.
 *
 * Protegida por x-internal-key (timing-safe) — NUNCA exposta ao browser.
 * Chamada por outros serviços tenant (historico-global, dashboard, etc.)
 * e por produtos (bid-frete, bid-cambio, pedido) via proxy S2S.
 *
 * Aceita um array de user_ids para notificação em lote (ex: alertas de
 * segurança para múltiplos admins).
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
  activity_id: z.string().min(1).max(2000).optional(),
})

export type InternalNotificationPayload = z.infer<typeof internalCreateSchema>

// ─── POST /api/v1/notificacoes/internal ──────────────────────────────────────
// Cria uma notificação para cada user_id no array. Retorna o total criado.
// O campo activity_id serve como deep link — o frontend navega para essa rota
// quando o usuário clica na notificação.
internalRoutes.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = internalCreateSchema.parse(req.body)

    const created = await prisma.notification.createMany({
      data: body.user_ids.map((uid) => ({
        tenant_id: body.tenant_id,
        user_id: uid,
        product_id: body.product_id ?? null,
        type: body.type,
        title: body.title,
        message: body.message,
        activity_id: body.activity_id ?? null,
      })),
    })

    // Push SSE para cada destinatário online
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
