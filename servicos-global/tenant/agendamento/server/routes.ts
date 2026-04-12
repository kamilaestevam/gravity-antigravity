/**
 * agendamento/server/routes.ts
 * Router exportado para o super-servidor tenant.
 * Montado em: app.use(agendamentoServiceRouter) — caminhos absolutos internos.
 */

import { Router } from 'express'
import { agendaRouter }  from './routes/agenda.js'
import { slotRouter }    from './routes/slot.js'
import { reservaRouter } from './routes/reserva.js'
import { configRouter }  from './routes/config.js'

const router = Router()

router.use('/api/v1/agenda',  agendaRouter)
router.use('/api/v1/slot',    slotRouter)
router.use('/api/v1/reserva', reservaRouter)
router.use('/api/v1/config',  configRouter)

export { router as agendamentoServiceRouter }
