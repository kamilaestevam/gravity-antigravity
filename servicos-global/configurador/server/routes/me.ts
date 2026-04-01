// server/routes/me.ts
// Retorna dados do usuário autenticado lidos do banco (não do Clerk)
// GET /api/v1/me → { user: { id, tenantId, role } }

import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth.js'

export const meRouter = Router()
meRouter.use(requireAuth)

/**
 * GET /api/v1/me
 * Retorna o role canônico do banco — fonte de verdade para autorização no frontend.
 * req.auth já foi populado pelo requireAuth (consulta ao banco com cache).
 */
meRouter.get('/', (req, res) => {
  res.json({
    user: {
      id: req.auth.userId,
      tenantId: req.auth.tenantId,
      role: req.auth.role,
    },
  })
})
