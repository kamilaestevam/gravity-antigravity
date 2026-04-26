/**
 * ncm-sync/server/routes.ts
 * Router exportado para o super-servidor tenant.
 * Montado em: app.use(ncmSyncServiceRouter)
 *
 * Inicialização assíncrona (cron job) fica em ./init.ts
 */

import { Router } from 'express'
import { apiRoutes } from './routes/api.js'

const router = Router()

router.use('/api/v1/ncm', apiRoutes)

export { router as ncmSyncServiceRouter }
