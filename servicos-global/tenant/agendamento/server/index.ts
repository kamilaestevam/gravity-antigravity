import 'dotenv/config'
import express from 'express'
import crypto from 'node:crypto'
import { errorHandler } from './lib/errors.js'
import { agendaRouter } from './routes/agenda.js'
import { slotRouter } from './routes/slot.js'
import { reservaRouter } from './routes/reserva.js'
import { configRouter } from './routes/config.js'

const app = express()
const PORT = Number(process.env.PORT ?? 8014)

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use((req, _res, next) => {
  const correlationId = (req.headers['x-correlation-id'] as string) ?? crypto.randomUUID()
  req.headers['x-correlation-id'] = correlationId
  next()
})

app.use('/api/v1/agenda', agendaRouter)
app.use('/api/v1/slot', slotRouter)
app.use('/api/v1/reserva', reservaRouter)
app.use('/api/v1/config', configRouter)

app.get('/health', (_req, res) => {
  res.json({
    service: '@tenant/agendamento',
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '1.0.0',
  })
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`[AGENDAMENTO] Serviço rodando na porta ${PORT}`)
  console.log(`[AGENDAMENTO] Health check: http://localhost:${PORT}/health`)
})

export { app }
