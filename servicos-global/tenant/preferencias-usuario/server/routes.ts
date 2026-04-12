/**
 * preferencias-usuario/server/routes.ts
 * Router exportado para o super-servidor tenant.
 * Montado em: app.use(preferenciasServiceRouter) — caminhos absolutos internos.
 */

import { Router } from 'express'
import { apiRoutes } from './routes/api'

const router = Router()

router.use('/api/v1/preferencias', apiRoutes)

export { router as preferenciasServiceRouter }
