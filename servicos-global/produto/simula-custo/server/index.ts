/**
 * index.ts — SimulaCusto Express Server
 * Porta 8020
 */

import express from 'express'
import { simulateRouter } from './routes/simulate.js'

const app = express()
const PORT = process.env.PORT ?? 8020

app.use(express.json())

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
