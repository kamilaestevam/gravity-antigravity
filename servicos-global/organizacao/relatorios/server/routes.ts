/**
 * relatorios/server/routes.ts
 * Router exportado para o super-servidor tenant.
 *
 * Rotas internas (caminhos absolutos, sem prefixo):
 *   GET/POST /api/v1/relatorios
 *   GET      /api/v1/relatorios/exportacao
 */

import { Router } from 'express'
import { exportacaoRouter } from './routes/exportacao.js'
import { relatoriosRouter } from './routes/relatorios.js'

const router = Router()

router.use(exportacaoRouter)
router.use(relatoriosRouter)

export { router as relatoriosServiceRouter }
