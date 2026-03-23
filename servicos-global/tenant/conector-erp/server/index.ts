// server/index.ts
// Servidor Express — Agente Conector ERP | Onda 3 | 12/13
// Porta: 8017

import 'dotenv/config'
import express from 'express'
import { correlationMiddleware } from './middleware/correlation.js'
import { errorHandler } from './middleware/error-handler.js'
import { healthRouter } from './routes/health.js'
import { conexoesRouter } from './routes/conexoes.js'
import { sincronizacaoRouter } from './routes/sincronizacao.js'
import { mapeamentosRouter } from './routes/mapeamentos.js'
import { alertasRouter } from './routes/alertas.js'

const app = express()
const PORT = Number(process.env.PORT ?? 8017)

// ---------------------------------------------------------------------------
// Middlewares globais
// ---------------------------------------------------------------------------
app.use(express.json())
app.use(correlationMiddleware)

// ---------------------------------------------------------------------------
// Rotas
// ---------------------------------------------------------------------------
app.use(healthRouter)
app.use(conexoesRouter)
app.use(sincronizacaoRouter)
app.use(mapeamentosRouter)
app.use(alertasRouter)

// ---------------------------------------------------------------------------
// Handler global de erros — DEVE ser o último middleware
// ---------------------------------------------------------------------------
app.use(errorHandler)

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`[CONECTOR_ERP] ✅ Rodando na porta ${PORT}`)
  console.log(`[CONECTOR_ERP]    Health: http://localhost:${PORT}/health`)
  console.log(`[CONECTOR_ERP]    API:    http://localhost:${PORT}/api/v1/erp`)
})

export default app
