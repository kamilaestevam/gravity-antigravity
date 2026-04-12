/**
 * notificacoes/server/routes.ts
 * Router exportado para o super-servidor tenant.
 * Montado em: app.use(notificacoesServiceRouter) — caminhos absolutos internos.
 *
 * Inicialização assíncrona (pg-boss + cron) fica em ./init.ts
 */

import { Router } from 'express'
import { apiRoutes } from './routes/api'

const router = Router()

router.use('/api/v1/notificacoes', apiRoutes)

export { router as notificacoesServiceRouter }
