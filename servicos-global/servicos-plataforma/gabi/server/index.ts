// server/index.ts
// Servidor Express do serviço Gabi AI — porta 8009.
// Agente Gabi — Onda 3 | 10/13

import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
// Chaves globais (ex: GEMINI_API_KEY) vêm do .env.local da raiz do monorepo
dotenv.config({ path: resolve(__dir, '../../../../.env.local') })
// Chaves específicas do serviço (PORT, DATABASE_URL, INTERNAL_API_KEY) vêm do .env local
dotenv.config({ path: resolve(__dir, '.env') })

import express from 'express'
import helmet from 'helmet'
import { correlationMiddleware } from './middleware/correlation.js'
import { authMiddleware } from './middleware/auth.js'
import { errorHandler } from './middleware/error-handler.js'

// Import de rotas (serão criadas a seguir)
import { healthRouter } from './routes/health.js'
import { conversasRouter } from './routes/conversas.js'
import { mensagensRouter } from './routes/mensagens.js'
import { chatRouter } from './routes/chat.js'
import { acoesRouter } from './routes/acoes.js'
import { usageRouter } from './routes/usage.js'
import { fieldHelpRouter } from './routes/fieldHelp.js'
import { agenteRouter } from './routes/agente.js'
import { diagnosticoRouter } from './routes/diagnostico.js'
import { memoriaRouter } from './routes/memoria.js'

const app = express()
const PORT = Number(process.env.PORT ?? 8009)

// ---------------------------------------------------------------------------
// Middlewares globais
// ---------------------------------------------------------------------------
app.use(helmet())
app.use(express.json())
app.use(correlationMiddleware)

// ---------------------------------------------------------------------------
// Rotas - Serão descomentadas e registradas posteriormente
// ---------------------------------------------------------------------------
app.use(healthRouter)

// Protege rotas subsequentes com o authMiddleware
app.use(authMiddleware)
app.use(conversasRouter)
app.use(mensagensRouter)
app.use(chatRouter)
app.use(acoesRouter)
app.use(usageRouter)
app.use(fieldHelpRouter)
app.use(agenteRouter)
app.use(diagnosticoRouter)
app.use(memoriaRouter)

// ---------------------------------------------------------------------------
// Handler global de erros — deve ser o último middleware
// ---------------------------------------------------------------------------
app.use(errorHandler)

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`[GABI_SERVICE] ✅ Rodando na porta ${PORT}`)
  console.log(`[GABI_SERVICE]    Health: http://localhost:${PORT}/health`)

  // F2-G: worker horario que avalia limites monetarios e dispara avisos por e-mail
  void import('./queue/limite-worker.js').then(({ iniciarLimiteWorker }) => {
    iniciarLimiteWorker()
  }).catch((err) => {
    console.warn('[GABI_SERVICE] falha iniciando limite-worker', (err as Error).message)
  })

  // Cron: limpar nonces expirados a cada 5 minutos
  void import('./services/servico-circuit-breaker.js').then(({ limparNoncesExpirados }) => {
    setInterval(async () => {
      try {
        const removidos = await limparNoncesExpirados()
        if (removidos > 0) console.log(`[GABI/Cron] Nonces expirados removidos: ${removidos}`)
      } catch (err) {
        console.warn('[GABI/Cron] Falha na limpeza de nonces:', (err as Error).message)
      }
    }, 5 * 60 * 1000)
    console.log('[GABI_SERVICE]    Cron: limpeza de nonces (5min)')
  }).catch((err) => {
    console.warn('[GABI_SERVICE] falha iniciando cron nonces', (err as Error).message)
  })

  // Cron: decaimento de memorias inativas — diario (a cada 24h)
  void import('./services/servico-memoria.js').then(({ aplicarDecaimentoMemorias }) => {
    setInterval(async () => {
      try {
        const resultado = await aplicarDecaimentoMemorias()
        if (resultado.desativadas > 0 || resultado.reduzidas > 0) {
          console.log(`[GABI/Cron] Decaimento memorias: ${resultado.reduzidas} reduzidas, ${resultado.desativadas} desativadas`)
        }
      } catch (err) {
        console.warn('[GABI/Cron] Falha no decaimento de memorias:', (err as Error).message)
      }
    }, 24 * 60 * 60 * 1000)
    console.log('[GABI_SERVICE]    Cron: decaimento memorias (24h)')
  }).catch((err) => {
    console.warn('[GABI_SERVICE] falha iniciando cron memorias', (err as Error).message)
  })
})

export default app
