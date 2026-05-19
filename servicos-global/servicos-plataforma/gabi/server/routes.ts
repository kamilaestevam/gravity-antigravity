/**
 * gabi/server/routes.ts
 * Router exportado para o super-servidor tenant.
 *
 * Rotas internas (caminhos absolutos, sem prefixo):
 *   GET/POST /api/v1/gabi/conversas
 *   GET/POST /api/v1/gabi/mensagens
 *   POST     /api/v1/gabi/chats
 *   POST     /api/v1/gabi/acoes/executar
 *   GET      /api/v1/gabi/uso
 *   POST     /api/v1/gabi/ajuda-campo
 *   POST/GET /api/v1/gabi/agente/chat       (V2 com function calling)
 *   POST     /api/v1/gabi/agente/confirmar   (confirmar acao pendente)
 *   POST     /api/v1/gabi/agente/feedback    (feedback usuario)
 *   *        /api/v1/gabi/diagnostico/*       (erros + chamados)
 *   *        /api/v1/gabi/memoria             (CRUD memoria)
 */

import { Router } from 'express'
import { conversasRouter } from './routes/conversas.js'
import { mensagensRouter } from './routes/mensagens.js'
import { chatRouter }      from './routes/chat.js'
import { acoesRouter }     from './routes/acoes.js'
import { usageRouter }     from './routes/usage.js'
import { fieldHelpRouter } from './routes/fieldHelp.js'
import { adminRouter }        from './routes/admin.js'
import { adminLimitesRouter } from './routes/admin-limites.js'
import { agenteRouter }       from './routes/agente.js'
import { diagnosticoRouter }  from './routes/diagnostico.js'
import { memoriaRouter }      from './routes/memoria.js'

const router = Router()

router.use(conversasRouter)
router.use(mensagensRouter)
router.use(chatRouter)
router.use(acoesRouter)
router.use(usageRouter)
router.use(fieldHelpRouter)
router.use(adminRouter)
router.use(adminLimitesRouter)
router.use(agenteRouter)
router.use(diagnosticoRouter)
router.use(memoriaRouter)

export { router as gabiServiceRouter }
