// server/index.ts
// Ponto de entrada do serviço de Cronômetro.
// Porta: 8007 (designada pelo Agente Cronômetro — Onda 3 | 2/13)

import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import { timersRouter } from './routes/timers.js'
import { errorHandler } from './lib/errors.js'

// ---------------------------------------------------------------------------
// Configuração do servidor
// ---------------------------------------------------------------------------

const app = express()
const PORT = Number(process.env.PORT ?? 8007)

// ---------------------------------------------------------------------------
// Middlewares globais
// ---------------------------------------------------------------------------

app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Propagação de Correlation ID (gerado pelo gateway ou pelo chamador)
app.use((req, _res, next) => {
  const correlationId = (req.headers['x-correlation-id'] as string) ?? crypto.randomUUID()
  req.headers['x-correlation-id'] = correlationId
  next()
})

// ---------------------------------------------------------------------------
// Rotas
// ---------------------------------------------------------------------------

// Onda API-1: paths absolutos no router (atividades/:id_atividade/cronometro/* + cronometros/*)
app.use('/api/v1', timersRouter)

// ---------------------------------------------------------------------------
// Health check — monitorado pelo UptimeRobot a cada 5 minutos
// ---------------------------------------------------------------------------

app.get('/health', (_req, res) => {
  res.json({
    service: '@tenant/cronometro',
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '1.0.0',
  })
})

// ---------------------------------------------------------------------------
// Handler global de erros — deve ser o último middleware
// ---------------------------------------------------------------------------

app.use(errorHandler)

// ---------------------------------------------------------------------------
// Inicialização
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`[CRONOMETRO] Serviço rodando na porta ${PORT}`)
  console.log(`[CRONOMETRO] Health check: http://localhost:${PORT}/health`)
  console.log(`[CRONOMETRO] SSE stream:  http://localhost:${PORT}/api/v1/cronometros/stream`)
})

export { app }
