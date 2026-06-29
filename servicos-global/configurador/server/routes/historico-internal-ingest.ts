/**
 * POST /api/v1/internal/historico/logs — ingestão S2S de audit logs
 *
 * Produtos e o audit-client HTTP usam esta rota (x-chave-interna-servico).
 * Grava via AuditService.log (fila pg-boss) sem passar pelo ingestLog público
 * que rejeita tipo_ator USUARIO em chamadas internas.
 */

import { Router, Request, Response, NextFunction } from 'express'
import { requireInternalKey } from '../middleware/requireInternalKey.js'
import { AppError } from '../lib/appError.js'
import { IngestHistorySchema } from '../../../servicos-plataforma/historico-global/server/schemas/history.schema.js'
import { AuditService } from '../../../servicos-plataforma/historico-global/server/services/audit.service.js'

export const historicoInternalIngestRouter = Router()

historicoInternalIngestRouter.use(requireInternalKey)

historicoInternalIngestRouter.post('/logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idOrganizacaoHeader = req.headers['x-id-organizacao']
    const id_organizacao = typeof idOrganizacaoHeader === 'string' ? idOrganizacaoHeader : ''
    if (!id_organizacao) {
      return next(new AppError('x-id-organizacao obrigatório', 400, 'VALIDATION_ERROR'))
    }

    const parsed = IngestHistorySchema.safeParse(req.body)
    if (!parsed.success) {
      return next(new AppError(parsed.error.issues[0]?.message ?? 'Payload inválido', 400, 'VALIDATION_ERROR'))
    }

    const id_usuario =
      parsed.data.id_usuario ??
      (parsed.data.tipo_ator_historico_log === 'USUARIO' ? parsed.data.id_ator_historico_log : undefined)

    await AuditService.log({
      id_organizacao,
      ...parsed.data,
      id_usuario,
    })

    res.status(202).json({ accepted: true })
  } catch (err) {
    next(err)
  }
})
