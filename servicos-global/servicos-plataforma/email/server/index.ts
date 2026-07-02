// server/index.ts
// Servidor Express do serviço de Email — porta 8008.
// Agente Email — Onda 3 | 3/13

import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import { correlationMiddleware } from './middleware/correlation.js'
import { errorHandler } from './middleware/error-handler.js'
import { healthRouter } from './routes/health.js'
import { enviarRouter } from './routes/enviar.js'
import { threadsRouter } from './routes/threads.js'
import { mensagensRouter } from './routes/mensagens.js'
import { templatesRouter } from './routes/templates.js'
import { filaRouter } from './routes/fila.js'
import { webhookRouter } from './routes/webhook.js'
import {
  criarSidecarListenReady,
  registrarErroListenSidecar,
} from '../../middleware/sidecar-listen-ready.js'

const EMAIL_SIDECAR = process.env.EMAIL_SIDECAR === '1'

const app = express()
const PORT = Number(process.env.PORT ?? 8008)

// ---------------------------------------------------------------------------
// Security Headers
// ---------------------------------------------------------------------------
app.use(helmet())

// ---------------------------------------------------------------------------
// Webhook deve receber body bruto para validação HMAC — registrar antes do json()
// ---------------------------------------------------------------------------
app.use('/api/v1/envios-email/webhook-provedor', express.raw({ type: 'application/json' }))

// ---------------------------------------------------------------------------
// Middlewares globais
// ---------------------------------------------------------------------------
app.use(express.json())
app.use(correlationMiddleware)

// ---------------------------------------------------------------------------
// Rotas
// ---------------------------------------------------------------------------
app.use(healthRouter)
app.use(webhookRouter)    // webhook não usa authMiddleware (valida via HMAC)
app.use(enviarRouter)
app.use(threadsRouter)
app.use(mensagensRouter)
app.use(templatesRouter)
app.use(filaRouter)

// ---------------------------------------------------------------------------
// Handler global de erros — deve ser o último middleware
// ---------------------------------------------------------------------------
app.use(errorHandler)

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
const listenHandles = criarSidecarListenReady(EMAIL_SIDECAR, PORT, 'EMAIL_SERVICE')
export const sidecarListenReady = listenHandles.sidecarListenReady

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`[EMAIL_SERVICE] ✅ Rodando na porta ${PORT}`)
    console.log(`[EMAIL_SERVICE]    Health: http://localhost:${PORT}/health`)
    listenHandles.aoSubirListen()
  })
  registrarErroListenSidecar(server, listenHandles, EMAIL_SIDECAR, PORT, 'EMAIL_SERVICE')
}

export default app
