/**
 * smart-read-vinculo-internal.ts — S2S: company id legado por organização
 * GET /api/v1/internal/smart-read/vinculo-legado?id_organizacao=
 */

import { Router } from 'express'
import { z } from 'zod'
import { requireInternalKey } from '../middleware/requireInternalKey.js'
import { resolverVinculoSmartReadLegado } from '../lib/resolver-vinculo-smart-read-legado.js'
import { AppError } from '../lib/appError.js'

export const smartReadVinculoInternalRouter = Router()

smartReadVinculoInternalRouter.use(requireInternalKey)

const QuerySchema = z.object({
  id_organizacao: z.string().min(1),
})

smartReadVinculoInternalRouter.get('/vinculo-legado', async (req, res, next) => {
  try {
    const parsed = QuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'id_organizacao é obrigatório',
        400,
        'VALIDATION_ERROR',
      )
    }

    const id_company_smart_read_legado = await resolverVinculoSmartReadLegado(parsed.data.id_organizacao)
    res.json({ id_company_smart_read_legado })
  } catch (err) {
    next(err)
  }
})
