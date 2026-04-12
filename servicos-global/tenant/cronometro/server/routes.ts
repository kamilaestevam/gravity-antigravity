/**
 * cronometro/server/routes.ts
 * Router exportado para o super-servidor tenant.
 * Montado em: app.use(cronometroServiceRouter) — caminhos absolutos internos.
 */

import { Router } from 'express'
import { timersRouter } from './routes/timers.js'

const router = Router()

router.use('/api/v1/timers', timersRouter)

export { router as cronometroServiceRouter }
