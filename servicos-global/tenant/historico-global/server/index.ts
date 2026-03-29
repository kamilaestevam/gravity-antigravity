import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { historicoRouter } from './routes.js'
import { errorHandler } from './lib/errors.js'

const app = express()
const PORT = Number(process.env.PORT ?? 8012)

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Correlation ID
app.use((req, res, next) => {
  const correlationId = (req.headers['x-correlation-id'] as string) ?? crypto.randomUUID()
  req.headers['x-correlation-id'] = correlationId
  next()
})

app.use('/api/v1/historico', historicoRouter)

app.get('/health', (req, res) => {
  res.json({
    service: '@tenant/historico',
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '1.0.0',
  })
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`[HISTORICO] Serviço rodando na porta ${PORT}`)
  console.log(`[HISTORICO] Health check: http://localhost:${PORT}/health`)
})

export { app }
