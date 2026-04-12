/**
 * gabi/server/routes.ts
 * Router exportado para o super-servidor tenant.
 *
 * Rotas internas (caminhos absolutos, sem prefixo):
 *   GET/POST /api/v1/gabi/conversas
 *   GET/POST /api/v1/gabi/mensagens
 *   POST     /api/v1/gabi/chat
 *   POST     /api/v1/gabi/acoes
 *   GET      /api/v1/gabi/usage
 *   GET      /api/v1/gabi/field-help
 */

import { Router } from 'express'
import { conversasRouter } from './routes/conversas.js'
import { mensagensRouter } from './routes/mensagens.js'
import { chatRouter }      from './routes/chat.js'
import { acoesRouter }     from './routes/acoes.js'
import { usageRouter }     from './routes/usage.js'
import { fieldHelpRouter } from './routes/fieldHelp.js'

const router = Router()

router.use(conversasRouter)
router.use(mensagensRouter)
router.use(chatRouter)
router.use(acoesRouter)
router.use(usageRouter)
router.use(fieldHelpRouter)

export { router as gabiServiceRouter }
