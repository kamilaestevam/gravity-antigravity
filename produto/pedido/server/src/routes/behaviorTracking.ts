/**
 * behaviorTracking.ts — Rota de rastreamento de comportamento do usuário
 *
 * POST /api/v1/pedidos/behavior/track
 *
 * Registra eventos de interação do usuário para personalização dos GABI Insights (Fase 2).
 * Fire-and-forget do ponto de vista do cliente — retorna 204 imediatamente.
 *
 * Autenticação: x-internal-key + x-tenant-id (via middleware global)
 */

import { Router, Request, Response, NextFunction } from 'express'
import { withTenant, type TenantContext } from '@gravity/tenant-resolver'
import { BehaviorEventSchema, trackBehaviorEvent } from '../services/behaviorTrackingService.js'

export const behaviorTrackingRouter = Router()

behaviorTrackingRouter.post(
  '/api/v1/pedidos/behavior/track',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = BehaviorEventSchema.safeParse(req.body)
      if (!parsed.success) {
        // Evento malformado — ignorar silenciosamente (não bloquear UX)
        res.status(204).end()
        return
      }

      const { tenantId, userId } = (req as unknown as { tenant: TenantContext }).tenant

      // Fire-and-forget — não aguarda o resultado para não impactar latência
      void withTenant(req, async (db) => {
        await trackBehaviorEvent(db, tenantId, userId, parsed.data)
      })

      res.status(204).end()
    } catch (err) {
      next(err)
    }
  },
)
