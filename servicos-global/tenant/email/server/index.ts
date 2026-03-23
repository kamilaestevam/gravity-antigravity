// server/index.ts
// Servidor Express do serviço de Email — porta 8008.
// Agente Email — Onda 3 | 3/13

import 'dotenv/config'
import express from 'express'
import { correlationMiddleware } from './middleware/correlation.js'
import { errorHandler } from './middleware/error-handler.js'
import { healthRouter } from './routes/health.js'
import { enviarRouter } from './routes/enviar.js'
import { threadsRouter } from './routes/threads.js'
import { mensagensRouter } from './routes/mensagens.js'
import { templatesRouter } from './routes/templates.js'
import { filaRouter } from './routes/fila.js'
import { webhookRouter } from './routes/webhook.js'

const app = express()
const PORT = Number(process.env.PORT ?? 8008)

// ---------------------------------------------------------------------------
// Webhook deve receber body bruto para validação HMAC — registrar antes do json()
// ---------------------------------------------------------------------------
app.use('/api/v1/email/webhook', express.raw({ type: 'application/json' }))

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
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[EMAIL_SERVICE] ✅ Rodando na porta ${PORT}`)
    console.log(`[EMAIL_SERVICE]    Health: http://localhost:${PORT}/health`)
  })
}

export default app
