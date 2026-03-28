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
// Health check — sem autenticação
// ---------------------------------------------------------------------------
app.use(healthRouter)

// ---------------------------------------------------------------------------
// Auth — injeta req.auth a partir do header x-tenant-id / x-user-id
// Em produção o gateway valida o JWT e propaga como headers internos.
// ---------------------------------------------------------------------------
app.use((req, res, next) => {
  const tenantId = req.headers['x-tenant-id'] as string | undefined
  const userId = req.headers['x-user-id'] as string | undefined

  if (!tenantId) {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'x-tenant-id obrigatório' },
    })
    return
  }

  ;(req as any).auth = { tenantId, userId: userId ?? '' }
  next()
})

// ---------------------------------------------------------------------------
// Rotas de negócio (protegidas)
// ---------------------------------------------------------------------------
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
