/**
 * notificacoes/server/routes.ts
 * Router exportado para o super-servidor tenant.
 * Montado em: app.use(notificacoesServiceRouter) — caminhos absolutos internos.
 *
 * Inicialização assíncrona (pg-boss + cron) fica em ./init.ts
 */

import { Router } from 'express'
import { apiRoutes } from './routes/api'
import { internalRoutes } from './routes/internal'

const router = Router()

// S2S — protegida por x-internal-key, sem checkAuth (não tem JWT de browser)
router.use('/api/v1/notificacoes/internal', internalRoutes)

// Rotas de browser — protegidas por checkAuth (JWT Clerk)
router.use('/api/v1/notificacoes', apiRoutes)

export { router as notificacoesServiceRouter }
