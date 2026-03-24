/**
 * index.ts — SimulaCusto Express Server
 * Porta 8020
 */

import express from 'express'
import { simulateRouter } from './routes/simulate.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT ?? 8020

app.use(express.json())

// CORS para acesso do Configurador
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

// Serve a interface HTML na raiz
app.use(express.static(join(__dirname, '..', 'public')))

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'simula-custo', port: PORT })
})

// Routes
app.use('/api/v1/simula-custo', simulateRouter)

// Só inicia o servidor fora de testes
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[SimulaCusto] Servidor rodando na porta ${PORT}`)
  })
}

export { app }
