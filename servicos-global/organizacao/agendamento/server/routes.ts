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

router.use('/api/v1/agendas', agendaRouter)
router.use('/api/v1/agendas/:id_agenda/configuracao-disponibilidade', configRouter)
router.use('/api/v1/agendas/:id_agenda/horarios-disponiveis', slotRouter)
router.use('/api/v1/agendas/:id_agenda/reservas', reservaRouter)

export { router as agendamentoServiceRouter }
