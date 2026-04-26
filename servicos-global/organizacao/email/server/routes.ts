/**
 * email/server/routes.ts
 * Router exportado para o super-servidor tenant.
 *
 * ATENÇÃO — webhook raw body:
 * O webhook Resend precisa de corpo bruto para validação HMAC.
 * No super-servidor, adicionar ANTES do express.json() global:
 *   app.use('/api/v1/email/webhook', express.raw({ type: 'application/json' }))
 *
 * Rotas internas (caminhos absolutos, sem prefixo):
 *   POST /api/v1/email/enviar
 *   GET/POST /api/v1/email/threads
 *   GET/POST /api/v1/email/mensagens
 *   GET/POST /api/v1/email/templates
 *   GET /api/v1/email/fila
 *   POST /api/v1/email/webhook  ← raw body
 */

import { Router } from 'express'
import { enviarRouter }    from './routes/enviar.js'
import { threadsRouter }   from './routes/threads.js'
import { mensagensRouter } from './routes/mensagens.js'
import { templatesRouter } from './routes/templates.js'
import { filaRouter }      from './routes/fila.js'
import { webhookRouter }   from './routes/webhook.js'

const router = Router()

// Webhook primeiro — valida via HMAC, sem authMiddleware
router.use(webhookRouter)
router.use(enviarRouter)
router.use(threadsRouter)
router.use(mensagensRouter)
router.use(templatesRouter)
router.use(filaRouter)

export { router as emailServiceRouter }
