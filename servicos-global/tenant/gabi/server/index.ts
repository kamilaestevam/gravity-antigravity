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
})

export default app
