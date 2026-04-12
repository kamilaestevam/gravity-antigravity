/**
 * atividades/server/routes.ts
 * Router exportado para o super-servidor tenant.
 * Montado em: app.use(atividadesServiceRouter) — caminhos absolutos internos.
 */

import { Router } from 'express'
import { empresasRouter }   from './routes/empresas.js'
import { contatosRouter }   from './routes/contatos.js'
import { atividadesRouter } from './routes/atividades.js'
import { pipelinesRouter }  from './routes/pipelines.js'
import { kanbanRouter }     from './routes/kanban.js'

const router = Router()

router.use('/api/v1/empresas',   empresasRouter)
router.use('/api/v1/contatos',   contatosRouter)
router.use('/api/v1/atividades', atividadesRouter)
router.use('/api/v1/pipelines',  pipelinesRouter)
router.use('/api/v1/kanban',     kanbanRouter)

export { router as atividadesServiceRouter }
