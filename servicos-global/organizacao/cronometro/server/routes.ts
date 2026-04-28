/**
 * cronometro/server/routes.ts
 * Router exportado para o super-servidor tenant.
 * Montado em: app.use(cronometroServiceRouter) — caminhos absolutos internos.
 */

import { Router } from 'express'
import { timersRouter } from './routes/timers.js'

const router = Router()

// Onda API-1: paths absolutos no router (atividades/:id_atividade/cronometro/* + cronometros/*)
router.use('/api/v1', timersRouter)

export { router as cronometroServiceRouter }
